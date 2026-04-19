const express = require('express');
const Customer = require('../models/Customer');
const Sale = require('../models/Sale');
const { authMiddleware } = require('../config/auth');

const router = express.Router();

const getCustomerSaleFilter = (customer) => ({
  $or: [
    { customer_id: customer._id },
    { customer_name: customer.name },
    ...(customer.company_name ? [{ customer_name: customer.company_name }] : []),
  ],
});

const buildProductPattern = (sales) => {
  const products = {};

  sales.forEach((sale) => {
    (sale.items || []).forEach((item) => {
      const key = item.product?._id?.toString() || item.product?.name || 'unknown';
      if (!products[key]) {
        products[key] = {
          name: item.product?.name || 'Unknown Product',
          quantity: 0,
          revenue: 0,
        };
      }
      products[key].quantity += item.quantity || 0;
      products[key].revenue += item.total || 0;
    });
  });

  return Object.values(products)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);
};

const buildCustomerMetrics = async (customer) => {
  const sales = await Sale.find(getCustomerSaleFilter(customer))
    .populate('items.product', 'name sku category')
    .sort({ sale_date: -1 });

  const totalPurchases = sales.length;
  const totalSpent = sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
  const lastPurchaseDate = sales[0]?.sale_date || customer.last_purchase_date || null;
  const productPattern = buildProductPattern(sales);

  const ledgerEntries = [
    ...sales.map((sale) => ({
      id: `sale-${sale._id}`,
      date: sale.sale_date,
      type: 'sale',
      reference: sale.sale_id,
      description: `${sale.items?.length || 0} items sold`,
      debit: sale.total_amount || 0,
      credit: 0,
      status: sale.status,
    })),
    ...(customer.payment_history || []).map((payment, index) => ({
      id: `payment-${index}`,
      date: payment.date,
      type: 'payment',
      reference: payment.reference || `PAY-${index + 1}`,
      description: payment.note || `Payment via ${payment.method}`,
      debit: 0,
      credit: payment.amount || 0,
      status: 'paid',
    })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let runningBalance = 0;
  const ledger = ledgerEntries.map((entry) => {
    runningBalance += (entry.debit || 0) - (entry.credit || 0);
    return {
      ...entry,
      runningBalance,
    };
  });

  return {
    totalPurchases,
    totalSpent,
    outstandingBalance: customer.outstanding_balance || Math.max(totalSpent - (customer.payment_history || []).reduce((sum, payment) => sum + (payment.amount || 0), 0), 0),
    overdueAmount: customer.payment_status === 'overdue' ? customer.outstanding_balance || 0 : 0,
    lastPurchaseDate,
    productPattern,
    salesHistory: sales,
    ledger,
  };
};

router.get('/analytics/summary', authMiddleware, async (req, res, next) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    const customerMetrics = await Promise.all(customers.map(async (customer) => ({
      customer,
      metrics: await buildCustomerMetrics(customer),
    })));

    const topCustomers = customerMetrics
      .map(({ customer, metrics }) => ({
        _id: customer._id,
        name: customer.name,
        totalSpent: metrics.totalSpent,
        totalPurchases: metrics.totalPurchases,
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);

    const frequentBuyers = customerMetrics
      .map(({ customer, metrics }) => ({
        _id: customer._id,
        name: customer.name,
        totalPurchases: metrics.totalPurchases,
      }))
      .sort((a, b) => b.totalPurchases - a.totalPurchases)
      .slice(0, 5);

    const segmentDistribution = customers.reduce((acc, customer) => {
      const key = customer.group || 'retail';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        totalCustomers: customers.length,
        activeCustomers: customers.filter((customer) => customer.status === 'active').length,
        duePayments: customers.filter((customer) => (customer.outstanding_balance || 0) > 0).length,
        topCustomers,
        frequentBuyers,
        highRevenueCustomers: topCustomers,
        segmentDistribution: Object.entries(segmentDistribution).map(([name, value]) => ({ name, value })),
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      group,
      highValue,
      duePayments,
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (group) filter.group = group;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { company_name: { $regex: search, $options: 'i' } },
        { gst_number: { $regex: search, $options: 'i' } },
      ];
    }

    const customers = await Customer.find(filter)
      .sort({ name: 1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const enriched = await Promise.all(customers.map(async (customer) => {
      const metrics = await buildCustomerMetrics(customer);
      return {
        ...customer.toObject(),
        metrics,
      };
    }));

    const filtered = enriched.filter((customer) => {
      if (highValue === 'true' && customer.metrics.totalSpent < 100000) return false;
      if (duePayments === 'true' && customer.metrics.outstandingBalance <= 0) return false;
      return true;
    });

    const total = await Customer.countDocuments(filter);

    res.json({
      success: true,
      data: {
        customers: filtered,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / Number(limit)),
          total,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/ledger', authMiddleware, async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const metrics = await buildCustomerMetrics(customer);
    res.json({
      success: true,
      data: {
        customer,
        ledger: metrics.ledger,
        salesHistory: metrics.salesHistory,
        productPattern: metrics.productPattern,
        summary: {
          totalPurchases: metrics.totalPurchases,
          totalSpent: metrics.totalSpent,
          outstandingBalance: metrics.outstandingBalance,
          overdueAmount: metrics.overdueAmount,
          lastPurchaseDate: metrics.lastPurchaseDate,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const metrics = await buildCustomerMetrics(customer);
    res.json({
      success: true,
      data: {
        customer: {
          ...customer.toObject(),
          metrics,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json({ success: true, data: { customer } });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.json({ success: true, data: { customer } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
