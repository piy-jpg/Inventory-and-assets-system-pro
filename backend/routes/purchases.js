const express = require('express');
const Purchase = require('../models/Purchase');
const Inventory = require('../models/Inventory');
const Transaction = require('../models/Transaction');
const { authMiddleware, checkPermission } = require('../config/auth');
const { getCurrentUserId } = require('../utils/getCurrentUser');

const router = express.Router();

// Get all purchases
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const purchases = await Purchase.find(filter)
      .populate('supplier', 'name company_name')
      .populate('items.product', 'name sku')
      .sort({ purchase_date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Purchase.countDocuments(filter);

    res.json({
      success: true,
      data: {
        purchases,
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

// Create new purchase
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const currentUserId = await getCurrentUserId(req.user);
    if (!currentUserId) {
      return res.status(401).json({ success: false, message: 'Authenticated user not found' });
    }

    const purchaseData = {
      ...req.body,
      created_by: currentUserId
    };
    const purchase = new Purchase(purchaseData);
    
    // If received, update inventory quantity
    if (purchase.status === 'received') {
      for (const item of purchase.items) {
        await Inventory.findByIdAndUpdate(item.product, {
          $inc: { quantity: item.quantity }
        });
      }
    }
    
    await purchase.save();

    // Create a transaction record
    const transaction = new Transaction({
      type: 'purchase',
      status: purchase.status === 'received' ? 'completed' : 'pending',
      date: purchase.purchase_date,
      amount: {
        total: purchase.total_amount,
        currency: 'USD'
      },
      items: purchase.items.map(item => ({
        inventory_item: item.product,
        quantity: item.quantity,
        unit_price: item.purchase_price,
        total_price: item.total
      })),
      created_by: currentUserId,
      parties: {
        from: purchase.supplier,
        fromType: 'Supplier'
      },
      payment: {
        method: purchase.payment_status === 'paid' ? 'bank_transfer' : 'credit',
        status: purchase.payment_status,
        paid_amount: purchase.payment_status === 'paid' ? purchase.total_amount : 0,
        payment_date: purchase.payment_status === 'paid' ? purchase.purchase_date : undefined,
      },
      reference: {
        purchase_order: purchase.purchase_id,
        order_id: purchase.purchase_id,
        notes: purchase.notes,
      }
    });
    await transaction.save();

    const io = req.app.get('io');
    io.emit('transaction-created', {
      type: 'purchase',
      data: {
        purchase,
        transaction,
      },
    });
    if (purchase.status === 'received') {
      io.emit('inventory-updated', {
        type: 'purchase-received',
        data: {
          purchaseId: purchase._id,
          productIds: purchase.items.map((item) => item.product),
        },
      });
    }

    res.status(201).json({ success: true, data: { purchase } });
  } catch (error) {
    next(error);
  }
});

// Update purchase status (e.g. from ordered to received)
router.put('/:id/status', authMiddleware, async (req, res, next) => {
  try {
    const { status } = req.body;
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) return res.status(404).json({ success: false, message: 'Purchase not found' });
    
    // If changing to received, update inventory
    if (status === 'received' && purchase.status !== 'received') {
      for (const item of purchase.items) {
        await Inventory.findByIdAndUpdate(item.product, {
          $inc: { quantity: item.quantity }
        });
      }

      // Update the associated transaction status
      await Transaction.findOneAndUpdate(
        { 'reference.purchase_order': purchase.purchase_id },
        {
          status: 'completed',
          'payment.status': purchase.payment_status,
          'payment.paid_amount': purchase.payment_status === 'paid' ? purchase.total_amount : 0,
          'payment.payment_date': purchase.payment_status === 'paid' ? new Date() : undefined,
        }
      );
    }
    
    purchase.status = status;
    await purchase.save();

    const io = req.app.get('io');
    io.emit('transaction-updated', {
      type: 'purchase-status-updated',
      data: {
        purchase,
      },
    });
    if (status === 'received') {
      io.emit('inventory-updated', {
        type: 'purchase-received',
        data: {
          purchaseId: purchase._id,
          productIds: purchase.items.map((item) => item.product),
        },
      });
    }

    res.json({ success: true, data: { purchase } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
