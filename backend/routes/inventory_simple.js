// Simple Inventory Routes using Mock Data
// This file provides inventory endpoints without database dependency

const express = require('express');
const { authMiddleware, checkPermission } = require('../config/auth');
const mockData = require('../data/mockData.js');
const {
  emitInventoryCreated,
  emitInventoryDeleted,
  emitInventoryUpdate,
  emitStockAdjustment,
} = require('../config/socket');

const router = express.Router();

// Get all inventory items
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
  } catch (error) {
    next(error);
  }
});

// Get categories
router.get('/categories/list', authMiddleware, checkPermission('inventory_read'), async (req, res, next) => {
  try {
    const categories = [...new Set(mockData.products.map(p => p.category))];
    
    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    next(error);
  }
});

// Get low stock alerts
router.get('/low-stock/alerts', authMiddleware, checkPermission('inventory_read'), async (req, res, next) => {
  try {
    const lowStockItems = mockData.products.filter(item => item.quantity <= item.minStock);
    
    res.json({
      success: true,
      data: { lowStockItems }
    });
  } catch (error) {
    next(error);
  }
});

// Get inventory item by ID
router.get('/:id', authMiddleware, checkPermission('inventory_read'), async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
});

// Create inventory item
router.post('/', authMiddleware, checkPermission('inventory_write'), async (req, res, next) => {
  try {
    const newInventory = {
      _id: 'INV_' + Date.now(),
      item_id: req.body.item_id || 'INV_' + Date.now(),
      ...req.body,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // In a real implementation, this would save to database
    mockData.products.push(newInventory);
    emitInventoryCreated(newInventory);

    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      data: { inventory: newInventory }
    });
  } catch (error) {
    next(error);
  }
});

// Update inventory item
router.put('/:id', authMiddleware, checkPermission('inventory_write'), async (req, res, next) => {
  try {
    const index = mockData.products.findIndex(p => p._id === req.params.id || p.item_id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    mockData.products[index] = { 
      ...mockData.products[index], 
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    emitInventoryUpdate(mockData.products[index]);

    res.json({
      success: true,
      message: 'Inventory item updated successfully',
      data: { inventory: mockData.products[index] }
    });
  } catch (error) {
    next(error);
  }
});

// Delete inventory item
router.delete('/:id', authMiddleware, checkPermission('inventory_write'), async (req, res, next) => {
  try {
    const index = mockData.products.findIndex(p => p._id === req.params.id || p.item_id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    const deletedInventory = mockData.products.splice(index, 1)[0];
    emitInventoryDeleted(deletedInventory);

    res.json({
      success: true,
      message: 'Inventory item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Adjust stock
router.post('/:id/adjust-stock', authMiddleware, checkPermission('inventory_write'), async (req, res, next) => {
  try {
    const { quantity, reason } = req.body;

    if (!quantity || typeof quantity !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required'
      });
    }

    const index = mockData.products.findIndex(p => p._id === req.params.id || p.item_id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    const oldQuantity = mockData.products[index].quantity;
    mockData.products[index].quantity += quantity;
    
    if (mockData.products[index].quantity < 0) {
      mockData.products[index].quantity = oldQuantity; // Reset
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock for this adjustment'
      });
    }

    mockData.products[index].updatedAt = new Date().toISOString();
    emitStockAdjustment({
      ...mockData.products[index],
      oldQuantity,
      adjustment: quantity,
      reason,
    });

    res.json({
      success: true,
      message: 'Stock adjusted successfully',
      data: { 
        inventory: mockData.products[index],
        oldQuantity,
        newQuantity: mockData.products[index].quantity,
        adjustment: quantity,
        reason
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
