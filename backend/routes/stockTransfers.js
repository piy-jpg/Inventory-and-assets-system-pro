const express = require('express');
const StockTransfer = require('../models/StockTransfer');
const Inventory = require('../models/Inventory');
const { authMiddleware } = require('../config/auth');
const { getCurrentUserId } = require('../utils/getCurrentUser');

const router = express.Router();

// Get all transfers
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const transfers = await StockTransfer.find(filter)
      .populate('from_warehouse', 'name')
      .populate('to_warehouse', 'name')
      .populate('items.product', 'name sku')
      .populate('created_by', 'firstName lastName')
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await StockTransfer.countDocuments(filter);
    res.json({ success: true, data: { transfers, pagination: { current: page, pages: Math.ceil(total / limit), total } } });
  } catch (error) {
    next(error);
  }
});

// Create new transfer
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const currentUserId = await getCurrentUserId(req.user);
    if (!currentUserId) {
      return res.status(401).json({ success: false, message: 'Authenticated user not found' });
    }

    const { from_warehouse, to_warehouse, items, shipping_charges, notes } = req.body;
    
    // In a real multi-warehouse inventory, you'd check stock at 'from_warehouse'
    // For this implementation, we check global inventory stock
    for (const item of items) {
      const product = await Inventory.findById(item.product);
      if (!product || product.quantity < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product?.name}` });
      }
    }

    const transfer = new StockTransfer({
      from_warehouse,
      to_warehouse,
      items,
      shipping_charges,
      notes,
      created_by: currentUserId,
      status: 'pending'
    });

    await transfer.save();
    res.status(201).json({ success: true, data: { transfer } });
  } catch (error) {
    next(error);
  }
});

// Update transfer status
router.put('/:id/status', authMiddleware, async (req, res, next) => {
  try {
    const { status } = req.body;
    const transfer = await StockTransfer.findById(req.params.id);
    if (!transfer) return res.status(404).json({ success: false, message: 'Transfer not found' });

    // If completing, we'd normally move stock between location records
    // Here we just update the status to reflect the flow
    transfer.status = status;
    await transfer.save();
    res.json({ success: true, data: { transfer } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
