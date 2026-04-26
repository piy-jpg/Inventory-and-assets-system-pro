const express = require('express');
const Transaction = require('../models/Transaction');
const Inventory = require('../models/Inventory');
const { authMiddleware, checkPermission } = require('../config/auth');
const { validateTransaction } = require('../middleware/validation');
const { getCurrentUserId } = require('../utils/getCurrentUser');

const router = express.Router();

router.get('/', authMiddleware, checkPermission('transactions_read'), async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      status,
      search,
      sortBy = 'date',
      sortOrder = 'desc',
      startDate,
      endDate,
      minAmount,
      maxAmount
    } = req.query;

    const filter = {};
    
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (minAmount || maxAmount) {
      filter['amount.total'] = {};
      if (minAmount) filter['amount.total'].$gte = parseFloat(minAmount);
      if (maxAmount) filter['amount.total'].$lte = parseFloat(maxAmount);
    }
    if (search) {
      filter.$or = [
        { 'reference.order_id': { $regex: search, $options: 'i' } },
        { 'reference.invoice_id': { $regex: search, $options: 'i' } },
        { 'reference.notes': { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const transactions = await Transaction.find(filter)
      .populate('items.inventory_item', 'name sku category')
      .populate('created_by', 'firstName lastName')
      .populate('parties.from')
      .populate('parties.to')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Transaction.countDocuments(filter);

    res.json({
      success: true,
      data: {
        transactions,
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

router.get('/summary/stats', authMiddleware, checkPermission('transactions_read'), async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const matchStage = dateFilter.$gte || dateFilter.$lte 
      ? { date: dateFilter }
      : {};

    const stats = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount.total' },
          avgAmount: { $avg: '$amount.total' }
        }
      }
    ]);

    const statusStats = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        typeStats: stats,
        statusStats: statusStats
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authMiddleware, checkPermission('transactions_read'), async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('items.inventory_item')
      .populate('created_by', 'firstName lastName email')
      .populate('approved_by', 'firstName lastName email')
      .populate('parties.from')
      .populate('parties.to');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: { transaction }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', authMiddleware, checkPermission('transactions_write'), validateTransaction, async (req, res, next) => {
  try {
    const currentUserId = await getCurrentUserId(req.user);
    if (!currentUserId) {
      return res.status(401).json({ success: false, message: 'Authenticated user not found' });
    }

    const transaction = new Transaction({
      ...req.body,
      created_by: currentUserId
    });

    await transaction.save();

    if (transaction.type === 'purchase' && transaction.status === 'completed') {
      for (const item of transaction.items) {
        await Inventory.findByIdAndUpdate(
          item.inventory_item,
          { 
            $inc: { quantity: item.quantity },
            lastRestocked: new Date()
          }
        );
      }
    } else if (transaction.type === 'sale' && transaction.status === 'completed') {
      for (const item of transaction.items) {
        const inventoryItem = await Inventory.findById(item.inventory_item);
        if (inventoryItem && inventoryItem.quantity >= item.quantity) {
          await Inventory.findByIdAndUpdate(
            item.inventory_item,
            { $inc: { quantity: -item.quantity } }
          );
        }
      }
    }

    const io = req.app.get('io');
    io.emit('transaction-created', {
      type: 'created',
      data: transaction
    });

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: { transaction }
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authMiddleware, checkPermission('transactions_write'), validateTransaction, async (req, res, next) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('items.inventory_item', 'name sku category')
      .populate('created_by', 'firstName lastName');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    const io = req.app.get('io');
    io.emit('transaction-updated', {
      type: 'updated',
      data: transaction
    });

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      data: { transaction }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/approve', authMiddleware, checkPermission('transactions_write'), async (req, res, next) => {
  try {
    const currentUserId = await getCurrentUserId(req.user);
    if (!currentUserId) {
      return res.status(401).json({ success: false, message: 'Authenticated user not found' });
    }

    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Transaction can only be approved when status is pending'
      });
    }

    transaction.status = 'completed';
    transaction.approved_by = currentUserId;

    await transaction.save();

    if (transaction.type === 'purchase') {
      for (const item of transaction.items) {
        await Inventory.findByIdAndUpdate(
          item.inventory_item,
          { 
            $inc: { quantity: item.quantity },
            lastRestocked: new Date()
          }
        );
      }
    } else if (transaction.type === 'sale') {
      for (const item of transaction.items) {
        const inventoryItem = await Inventory.findById(item.inventory_item);
        if (inventoryItem && inventoryItem.quantity >= item.quantity) {
          await Inventory.findByIdAndUpdate(
            item.inventory_item,
            { $inc: { quantity: -item.quantity } }
          );
        }
      }
    }

    const io = req.app.get('io');
    io.emit('transaction-approved', {
      transactionId: transaction._id,
      approvedBy: currentUserId
    });

    res.json({
      success: true,
      message: 'Transaction approved successfully',
      data: { transaction }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/cancel', authMiddleware, checkPermission('transactions_write'), async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    if (transaction.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed transaction'
      });
    }

    transaction.status = 'cancelled';
    await transaction.save();

    const io = req.app.get('io');
    io.emit('transaction-cancelled', {
      transactionId: transaction._id
    });

    res.json({
      success: true,
      message: 'Transaction cancelled successfully',
      data: { transaction }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
