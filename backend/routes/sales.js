const express = require('express');
const Sale = require('../models/Sale');
const Inventory = require('../models/Inventory');
const Transaction = require('../models/Transaction');
const Customer = require('../models/Customer');
const { authMiddleware } = require('../config/auth');
const { getCurrentUserId } = require('../utils/getCurrentUser');

const router = express.Router();

// Get all sales
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const sales = await Sale.find()
      .populate('items.product', 'name sku')
      .populate('created_by', 'firstName lastName')
      .sort({ sale_date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Sale.countDocuments();
    res.json({ success: true, data: { sales, pagination: { current: page, pages: Math.ceil(total / limit), total } } });
  } catch (error) {
    next(error);
  }
});

// Create new sale (POS)
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const currentUserId = await getCurrentUserId(req.user);
    if (!currentUserId) {
      return res.status(401).json({ success: false, message: 'Authenticated user not found' });
    }

    let resolvedCustomerId = req.body.customer_id || null;
    let resolvedCustomerName = req.body.customer_name || req.body.customer || 'Walk-in Customer';

    if (resolvedCustomerId) {
      const customer = await Customer.findById(resolvedCustomerId);
      if (customer) {
        resolvedCustomerName = customer.name;
      }
    } else if (req.body.customer && req.body.customer !== 'Walk-in Customer') {
      const customer = await Customer.findOne({ name: req.body.customer });
      if (customer) {
        resolvedCustomerId = customer._id;
      }
    }

    const saleData = {
      customer_id: resolvedCustomerId,
      customer_name: resolvedCustomerName,
      items: (req.body.items || []).map((item) => ({
        product: item.product,
        quantity: item.quantity,
        selling_price: item.selling_price || item.price || 0,
        total: item.total || (item.quantity || 0) * (item.selling_price || item.price || 0),
      })),
      total_amount: req.body.total_amount || req.body.total || 0,
      payment_method: req.body.payment_method || req.body.paymentMethod || 'cash',
      status: req.body.status || 'completed',
      sale_date: req.body.sale_date || new Date(),
      created_by: currentUserId
    };
    
    // Check and update inventory
    for (const item of saleData.items) {
      const product = await Inventory.findById(item.product);
      if (!product || product.quantity < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product?.name || 'product'}` });
      }
    }
    
    // Update inventory
    for (const item of saleData.items) {
      await Inventory.findByIdAndUpdate(item.product, {
        $inc: { quantity: -item.quantity }
      });
    }
    
    const sale = new Sale(saleData);
    await sale.save();

    // Create a transaction record
    const transaction = new Transaction({
      type: 'sale',
      status: 'completed',
      date: sale.sale_date,
      amount: {
        total: sale.total_amount,
        currency: 'USD'
      },
      items: sale.items.map(item => ({
        inventory_item: item.product,
        quantity: item.quantity,
        unit_price: item.selling_price,
        total_price: item.total
      })),
      created_by: currentUserId,
      parties: resolvedCustomerId
        ? {
            to: resolvedCustomerId,
            toType: 'Customer',
          }
        : undefined,
      payment: {
        method: ['online', 'card'].includes(sale.payment_method) ? 'card' : sale.payment_method,
        status: ['other'].includes(sale.payment_method) ? 'pending' : 'paid',
        paid_amount: ['other'].includes(sale.payment_method) ? 0 : sale.total_amount,
        payment_date: sale.sale_date,
      },
      reference: {
        order_id: sale.sale_id,
        invoice_id: sale.sale_id
      }
    });
    await transaction.save();

    if (resolvedCustomerId) {
      const outstandingIncrement = ['credit', 'other'].includes(sale.payment_method) ? sale.total_amount : 0;
      await Customer.findByIdAndUpdate(resolvedCustomerId, {
        $set: {
          last_purchase_date: sale.sale_date,
          payment_status: outstandingIncrement > 0 ? 'pending' : 'paid',
        },
        $inc: {
          total_spent: sale.total_amount,
          outstanding_balance: outstandingIncrement,
        },
      });
    }

    const io = req.app.get('io');
    io.emit('transaction-created', {
      type: 'sale',
      data: {
        sale,
        transaction,
      },
    });
    io.emit('inventory-updated', {
      type: 'sale',
      data: {
        saleId: sale._id,
        productIds: sale.items.map((item) => item.product),
      },
    });
    if (resolvedCustomerId) {
      io.emit('customer-updated', {
        type: 'sale-linked',
        data: {
          customerId: resolvedCustomerId,
          saleId: sale._id,
        },
      });
    }

    res.status(201).json({ success: true, data: { sale } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
