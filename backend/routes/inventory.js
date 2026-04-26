const express = require('express');
const InventoryDatabaseAPI = require('../database/inventory_api');
const { authMiddleware, checkPermission } = require('../config/auth');
const { validateInventory } = require('../middleware/validation');
const { 
  emitInventoryUpdate, 
  emitStockAdjustment, 
  emitInventoryCreated, 
  emitInventoryDeleted, 
  emitLowStockAlert 
} = require('../config/socket');

const router = express.Router();

router.get('/', authMiddleware, checkPermission('inventory_read'), async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      status,
      search,
      sortBy = 'name',
      sortOrder = 'asc',
      minStock,
      maxStock
    } = req.query;

    // Try database first, fallback to mock data
    try {
      const db = new InventoryDatabaseAPI();
      await db.connect();

      const filters = {
        search,
        status,
        category_id: category,
        limit: parseInt(limit),
        offset: (page - 1) * parseInt(limit)
      };

      // Add stock filters if provided
      if (minStock) {
        filters.min_stock = parseInt(minStock);
      }
      if (maxStock) {
        filters.max_stock = parseInt(maxStock);
      }

      const products = await db.getProducts(filters);
      const total = products.length;

      await db.disconnect();

      return res.json({
        success: true,
        data: {
          inventory: products,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / limit),
            total
          }
        }
      });
    } catch (dbError) {
      console.log('Database connection failed, using mock data:', dbError.message);
      
      // Fallback to mock data
      const mockData = require('../data/mockData.js');
      let items = [...mockData.products];
      
      // Apply filters
      if (search) {
        const searchLower = search.toLowerCase();
        items = items.filter(item => 
          item.name.toLowerCase().includes(searchLower) ||
          item.sku.toLowerCase().includes(searchLower) ||
          item.category.toLowerCase().includes(searchLower) ||
          item.brand.toLowerCase().includes(searchLower)
        );
      }
      
      if (category) {
        items = items.filter(item => item.category === category);
      }
      
      if (status) {
        items = items.filter(item => item.status === status);
      }
      
      if (minStock) {
        items = items.filter(item => item.quantity <= parseInt(minStock));
      }
      
      if (maxStock) {
        items = items.filter(item => item.quantity >= parseInt(maxStock));
      }
      
      // Sort
      items.sort((a, b) => {
        const aVal = a[sortBy] || '';
        const bVal = b[sortBy] || '';
        return sortOrder === 'asc' 
          ? aVal.toString().localeCompare(bVal.toString())
          : bVal.toString().localeCompare(aVal.toString());
      });
      
      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedItems = items.slice(startIndex, endIndex);
      
      res.json({
        success: true,
        data: {
          inventory: paginatedItems,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(items.length / limit),
            total: items.length
          }
        }
      });
    }
  } catch (error) {
    next(error);
  }
});

router.get('/categories/list', authMiddleware, checkPermission('inventory_read'), async (req, res, next) => {
  try {
    // Try database first, fallback to mock data
    try {
      const db = new InventoryDatabaseAPI();
      await db.connect();

      const categories = await db.getCategories();

      await db.disconnect();
      
      return res.json({
        success: true,
        data: { categories }
      });
    } catch (dbError) {
      console.log('Database connection failed, using mock data for categories:', dbError.message);
      
      // Fallback to mock data
      const mockData = require('../data/mockData.js');
      const categories = [...new Set(mockData.products.map(p => p.category))];
      
      res.json({
        success: true,
        data: { categories }
      });
    }
  } catch (error) {
    next(error);
  }
});

router.get('/low-stock/alerts', authMiddleware, checkPermission('inventory_read'), async (req, res, next) => {
  try {
    // Try database first, fallback to mock data
    try {
      const db = new InventoryDatabaseAPI();
      await db.connect();

      const lowStockItems = await db.getLowStockAlerts();

      await db.disconnect();

      return res.json({
        success: true,
        data: { lowStockItems }
      });
    } catch (dbError) {
      console.log('Database connection failed, using mock data for low stock alerts:', dbError.message);
      
      // Fallback to mock data
      const mockData = require('../data/mockData.js');
      const lowStockItems = mockData.products.filter(item => item.quantity <= item.minStock);
      
      res.json({
        success: true,
        data: { lowStockItems }
      });
    }
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authMiddleware, checkPermission('inventory_read'), async (req, res, next) => {
  try {
    // Try database first, fallback to mock data
    try {
      const db = new InventoryDatabaseAPI();
      await db.connect();

      const inventory = await db.getProductById(req.params.id);

      if (!inventory) {
        await db.disconnect();
        return res.status(404).json({
          success: false,
          message: 'Inventory item not found'
        });
      }

      await db.disconnect();

      return res.json({
        success: true,
        data: { inventory }
      });
    } catch (dbError) {
      console.log('Database connection failed, using mock data for product by ID:', dbError.message);
      
      // Fallback to mock data
      const mockData = require('../data/mockData.js');
      const inventory = mockData.products.find(p => p._id === req.params.id || p.item_id === req.params.id);

      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: 'Inventory item not found'
        });
      }

      res.json({
        success: true,
        data: { inventory }
      });
    }
  } catch (error) {
    next(error);
  }
});

router.post('/', authMiddleware, checkPermission('inventory_write'), validateInventory, async (req, res, next) => {
  try {
    const inventory = new Inventory(req.body);
    
    const stockStatus = inventory.checkStockLevel();
    if (stockStatus !== 'normal') {
      inventory.status = stockStatus;
    }

    await inventory.save();

    if (inventory.status === 'low_stock' || inventory.status === 'out_of_stock') {
      await Alert.createLowStockAlert(inventory);
      emitLowStockAlert(inventory);
    }

    // Emit real-time event for new inventory item
    emitInventoryCreated(inventory);

    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      data: { inventory }
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authMiddleware, checkPermission('inventory_write'), validateInventory, async (req, res, next) => {
  try {
    const inventory = await Inventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('supplier_id');

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    const stockStatus = inventory.checkStockLevel();
    inventory.status = stockStatus;

    await inventory.save();

    if (inventory.status === 'low_stock' || inventory.status === 'out_of_stock') {
      await Alert.createLowStockAlert(inventory);
      emitLowStockAlert(inventory);
    }

    // Emit real-time event for inventory update
    emitInventoryUpdate(inventory);

    res.json({
      success: true,
      message: 'Inventory item updated successfully',
      data: { inventory }
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authMiddleware, checkPermission('inventory_write'), async (req, res, next) => {
  try {
    const inventory = await Inventory.findByIdAndDelete(req.params.id);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    // Emit real-time event for inventory deletion
    emitInventoryDeleted({ ...inventory.toObject(), action: 'deleted' });

    const io = req.app.get('io');
    io.emit('inventory-updated', {
      type: 'deleted',
      data: { _id: req.params.id }
    });

    res.json({
      success: true,
      message: 'Inventory item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/adjust-stock', authMiddleware, checkPermission('inventory_write'), async (req, res, next) => {
  try {
    const { quantity, reason } = req.body;

    if (!quantity || typeof quantity !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required'
      });
    }

    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    const oldQuantity = inventory.quantity;
    inventory.quantity += quantity;
    
    if (inventory.quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock for this adjustment'
      });
    }

    const stockStatus = inventory.checkStockLevel();
    inventory.status = stockStatus;
    inventory.lastRestocked = new Date();

    await inventory.save();

    if (inventory.status === 'low_stock' || inventory.status === 'out_of_stock') {
      await Alert.createLowStockAlert(inventory);
    }

    const io = req.app.get('io');
    io.emit('stock-adjusted', {
      inventoryId: inventory._id,
      oldQuantity,
      newQuantity: inventory.quantity,
      adjustment: quantity,
      reason
    });

    res.json({
      success: true,
      message: 'Stock adjusted successfully',
      data: { inventory }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
