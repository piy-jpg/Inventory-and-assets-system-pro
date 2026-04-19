const express = require('express');
const Inventory = require('../models/Inventory');
const Asset = require('../models/Asset');
const Transaction = require('../models/Transaction');
const Alert = require('../models/Alert');
const Supplier = require('../models/Supplier');
const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Expense = require('../models/Expense');
const { authMiddleware, checkPermission } = require('../config/auth');

const router = express.Router();

router.get('/dashboard/overview', authMiddleware, async (req, res, next) => {
  try {
    const [
      totalInventoryValue,
      lowStockCount,
      activeAssets,
      totalSales,
      monthlyPurchases,
      monthlyExpenses,
      activeAlerts
    ] = await Promise.all([
      Inventory.aggregate([
        { $group: { _id: null, total: { $sum: { $multiply: ['$quantity', '$price.cost'] } } } }
      ]),
      Inventory.countDocuments({ 
        $expr: { $lte: ['$quantity', '$minStockLevel'] }
      }),
      Asset.countDocuments({ status: 'active' }),
      Sale.aggregate([
        {
          $match: {
            sale_date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        },
        { $group: { _id: null, total: { $sum: '$total_amount' } } }
      ]),
      Purchase.aggregate([
        {
          $match: {
            purchase_date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        },
        { $group: { _id: null, total: { $sum: '$total_amount' } } }
      ]),
      Expense.aggregate([
        {
          $match: {
            date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Alert.countDocuments({ status: 'active' })
    ]);

    res.json({
      success: true,
      data: {
        totalInventoryValue: totalInventoryValue[0]?.total || 0,
        lowStockCount,
        activeAssets,
        monthlySales: totalSales[0]?.total || 0,
        monthlyPurchases: monthlyPurchases[0]?.total || 0,
        monthlyExpense: monthlyExpenses[0]?.total || 0,
        activeAlerts
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/inventory/trends', authMiddleware, async (req, res, next) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const categoryTrends = await Inventory.aggregate([
      {
        $group: {
          _id: '$category',
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$quantity', '$price.cost'] } },
          itemCount: { $sum: 1 }
        }
      },
      { $sort: { totalValue: -1 } }
    ]);

    const stockLevels = await Inventory.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$quantity', '$price.cost'] } }
        }
      }
    ]);

    const topProducts = await Inventory.find()
      .sort({ quantity: -1 })
      .limit(10)
      .select('name category quantity price.cost')
      .exec();

    res.json({
      success: true,
      data: {
        categoryTrends,
        stockLevels,
        topProducts
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/assets/overview', authMiddleware, async (req, res, next) => {
  try {
    const [
      assetByCategory,
      assetByStatus,
      depreciationSchedule,
      maintenanceDue
    ] = await Promise.all([
      Asset.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalValue: { $sum: '$purchase_cost.amount' }
          }
        },
        { $sort: { totalValue: -1 } }
      ]),
      Asset.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalValue: { $sum: '$purchase_cost.amount' }
          }
        }
      ]),
      Asset.aggregate([
        {
          $addFields: {
            age: { $divide: [{ $subtract: [new Date(), '$purchase_date'] }, 365.25 * 24 * 60 * 60 * 1000] },
            currentValue: { $subtract: ['$purchase_cost.amount', { $multiply: [{ $divide: [{ $subtract: [new Date(), '$purchase_date'] }, 365.25 * 24 * 60 * 60 * 1000] }, { $divide: ['$purchase_cost.amount', '$depreciation.usefulLife'] }] }] }
          }
        },
        { $sort: { age: -1 } },
        { $limit: 20 }
      ]),
      Asset.find({
        'maintenance.nextMaintenanceDue': { $lte: new Date() },
        status: { $ne: 'disposed' }
      }).countDocuments()
    ]);

    res.json({
      success: true,
      data: {
        assetByCategory,
        assetByStatus,
        depreciationSchedule,
        maintenanceDueCount: maintenanceDue
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/transactions/analysis', authMiddleware, async (req, res, next) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      transactionTrends,
      revenueByType,
      topSuppliers,
      paymentStatus
    ] = await Promise.all([
      Transaction.aggregate([
        { $match: { date: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            totalAmount: { $sum: "$amount.total" },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id": 1 } }
      ]),
      Transaction.aggregate([
        { $match: { date: { $gte: startDate } } },
        {
          $group: {
            _id: '$type',
            totalAmount: { $sum: '$amount.total' },
            count: { $sum: 1 },
            avgAmount: { $avg: '$amount.total' }
          }
        }
      ]),
      Transaction.aggregate([
        { $match: { date: { $gte: startDate }, type: 'purchase' } },
        {
          $group: {
            _id: '$parties.from',
            totalAmount: { $sum: '$amount.total' },
            count: { $sum: 1 }
          }
        },
        { $sort: { totalAmount: -1 } },
        { $limit: 10 }
      ]),
      Transaction.aggregate([
        { $match: { date: { $gte: startDate } } },
        {
          $group: {
            _id: '$payment.status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount.total' }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      data: {
        transactionTrends,
        revenueByType,
        topSuppliers,
        paymentStatus
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/suppliers/performance', authMiddleware, checkPermission('analytics_view'), async (req, res, next) => {
  try {
    const [
      supplierPerformance,
      categoryDistribution,
      topPerformers
    ] = await Promise.all([
      Supplier.aggregate([
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$performance.rating' },
            avgOnTimeDelivery: { $avg: '$performance.on_time_delivery' },
            avgQualityScore: { $avg: '$performance.quality_score' },
            totalSuppliers: { $sum: 1 }
          }
        }
      ]),
      Supplier.aggregate([
        { $unwind: '$categories' },
        {
          $group: {
            _id: '$categories',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]),
      Supplier.find()
        .sort({ 'performance.rating': -1 })
        .limit(10)
        .select('name company_name performance rating categories')
        .exec()
    ]);

    res.json({
      success: true,
      data: {
        supplierPerformance: supplierPerformance[0] || {},
        categoryDistribution,
        topPerformers
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/alerts/analysis', authMiddleware, checkPermission('analytics_view'), async (req, res, next) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      alertTrends,
      severityDistribution,
      typeDistribution,
      resolutionTime
    ] = await Promise.all([
      Alert.aggregate([
        { $match: { 'timestamps.created': { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamps.created" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id": 1 } }
      ]),
      Alert.aggregate([
        { $match: { 'timestamps.created': { $gte: startDate } } },
        {
          $group: {
            _id: '$severity',
            count: { $sum: 1 }
          }
        }
      ]),
      Alert.aggregate([
        { $match: { 'timestamps.created': { $gte: startDate } } },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]),
      Alert.aggregate([
        {
          $match: {
            'timestamps.created': { $gte: startDate },
            'timestamps.resolved': { $exists: true }
          }
        },
        {
          $addFields: {
            resolutionHours: {
              $divide: [
                { $subtract: ['$timestamps.resolved', '$timestamps.created'] },
                1000 * 60 * 60
              ]
            }
          }
        },
        {
          $group: {
            _id: '$type',
            avgResolutionTime: { $avg: '$resolutionHours' },
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      data: {
        alertTrends,
        severityDistribution,
        typeDistribution,
        resolutionTime
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/reports/summary', authMiddleware, async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const [sales, purchases, expenses] = await Promise.all([
      Sale.aggregate([
        { $match: filter },
        { $group: { _id: null, total: { $sum: '$total_amount' }, count: { $sum: 1 } } }
      ]),
      Purchase.aggregate([
        { $match: filter },
        { $group: { _id: null, total: { $sum: '$total_amount' }, count: { $sum: 1 } } }
      ]),
      Expense.aggregate([
        { $match: filter },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        sales: sales[0] || { total: 0, count: 0 },
        purchases: purchases[0] || { total: 0, count: 0 },
        expenses: expenses[0] || { total: 0, count: 0 },
        profit: (sales[0]?.total || 0) - (purchases[0]?.total || 0) - (expenses[0]?.total || 0)
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/reports/stock', authMiddleware, async (req, res, next) => {
  try {
    const stockReport = await Inventory.find()
      .select('name sku quantity minStockLevel category price.cost price.selling')
      .sort({ quantity: 1 });

    const stats = {
      total_items: stockReport.length,
      low_stock_items: stockReport.filter(i => i.quantity <= i.minStockLevel).length,
      out_of_stock: stockReport.filter(i => i.quantity <= 0).length,
      total_value: stockReport.reduce((sum, i) => sum + (i.quantity * i.price.cost), 0)
    };

    res.json({ success: true, data: { items: stockReport, stats } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
