const express = require('express');
const StockAdjustment = require('../models/StockAdjustment');
const Inventory = require('../models/Inventory');
const Transaction = require('../models/Transaction');
const { authMiddleware } = require('../config/auth');
const { getCurrentUserId } = require('../utils/getCurrentUser');

const router = express.Router();

// Get all adjustments
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const adjustments = await StockAdjustment.find()
      .populate('product', 'name sku')
      .populate('created_by', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await StockAdjustment.countDocuments();
    res.json({ success: true, data: { adjustments, pagination: { current: page, pages: Math.ceil(total / limit), total } } });
  } catch (error) {
    next(error);
  }
});

// Create new adjustment
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const currentUserId = await getCurrentUserId(req.user);
    if (!currentUserId) {
      return res.status(401).json({ success: false, message: 'Authenticated user not found' });
    }

    const { product, type, quantity, reason, notes } = req.body;
    
    const inventoryItem = await Inventory.findById(product);
    if (!inventoryItem) return res.status(404).json({ success: false, message: 'Product not found' });

    // Update quantity
    const quantityChange = type === 'increase' ? quantity : -quantity;
    if (type === 'decrease' && inventoryItem.quantity < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock for decrease' });
    }

    inventoryItem.quantity += quantityChange;
    await inventoryItem.save();

    const adjustment = new StockAdjustment({
      product,
      type,
      quantity,
      reason,
      notes,
      created_by: currentUserId
    });

    await adjustment.save();

    // Create a transaction record
    const transaction = new Transaction({
      type: 'adjustment',
      status: 'completed',
      date: adjustment.createdAt,
      amount: {
        total: 0, // Adjustments usually don't have a total amount in the same way
        currency: 'USD'
      },
      items: [{
        inventory_item: product,
        quantity: quantity,
        unit_price: inventoryItem.price.cost,
        total_price: quantity * inventoryItem.price.cost
      }],
      created_by: currentUserId,
      reference: {
        order_id: adjustment._id.toString(),
        notes: `${type} adjustment: ${reason || 'Manual update'}`,
      }
    });
    await transaction.save();

    res.status(201).json({ success: true, data: { adjustment } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
