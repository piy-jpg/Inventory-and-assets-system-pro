const express = require('express');
const Inventory = require('../models/Inventory');
const Alert = require('../models/Alert');
const { authMiddleware, checkPermission } = require('../config/auth');
const { validateInventory } = require('../middleware/validation');

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

    const filter = {};
    
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }
    if (minStock || maxStock) {
      filter.quantity = {};
      if (minStock) filter.quantity.$gte = parseInt(minStock);
      if (maxStock) filter.quantity.$lte = parseInt(maxStock);
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const inventory = await Inventory.find(filter)
      .populate('supplier_id', 'name company_name')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Inventory.countDocuments(filter);

    res.json({
      success: true,
      data: {
        inventory,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authMiddleware, checkPermission('inventory_read'), async (req, res, next) => {
  try {
    const inventory = await Inventory.findById(req.params.id)
      .populate('supplier_id');

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
    }

    const io = req.app.get('io');
    io.emit('inventory-updated', {
      type: 'created',
      data: inventory
    });

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
    }

    const io = req.app.get('io');
    io.emit('inventory-updated', {
      type: 'updated',
      data: inventory
    });

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

router.get('/categories/list', authMiddleware, checkPermission('inventory_read'), async (req, res, next) => {
  try {
    const categories = await Inventory.distinct('category');
    
    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/low-stock/alerts', authMiddleware, checkPermission('inventory_read'), async (req, res, next) => {
  try {
    const lowStockItems = await Inventory.find({
      $expr: {
        $lte: ['$quantity', '$minStockLevel']
      }
    }).populate('supplier_id');

    res.json({
      success: true,
      data: { lowStockItems }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
