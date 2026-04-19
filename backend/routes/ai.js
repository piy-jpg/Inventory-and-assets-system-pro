const express = require('express');
const Inventory = require('../models/Inventory');
const Transaction = require('../models/Transaction');
const { authMiddleware, checkPermission } = require('../config/auth');

const router = express.Router();

router.post('/predict-demand', authMiddleware, checkPermission('analytics_view'), async (req, res, next) => {
  try {
    const { inventory_id, period = 30 } = req.body;

    const inventory = await Inventory.findById(inventory_id);
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    const historicalData = await Transaction.aggregate([
      { $unwind: '$items' },
      {
        $match: {
          'items.inventory_item': inventory._id,
          type: 'sale',
          date: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          totalQuantity: { $sum: "$items.quantity" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const avgDailyDemand = historicalData.reduce((sum, day) => sum + day.totalQuantity, 0) / Math.max(historicalData.length, 1);
    const trend = calculateTrend(historicalData);
    
    const predictedDemand = Math.max(0, avgDailyDemand * period * (1 + trend));
    const confidence = Math.min(95, Math.max(50, 100 - (historicalData.length / 90) * 45));

    inventory.aiPredictedDemand = {
      next30Days: Math.round(predictedDemand),
      next90Days: Math.round(predictedDemand * 3),
      confidence: Math.round(confidence),
      lastUpdated: new Date()
    };

    await inventory.save();

    res.json({
      success: true,
      message: 'Demand prediction completed',
      data: {
        inventory_id: inventory._id,
        predictedDemand: inventory.aiPredictedDemand,
        recommendation: generateRestockRecommendation(inventory, predictedDemand),
        trend: trend > 0.1 ? 'increasing' : trend < -0.1 ? 'decreasing' : 'stable'
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/auto-restock-suggestions', authMiddleware, checkPermission('analytics_view'), async (req, res, next) => {
  try {
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ['$quantity', '$minStockLevel'] }
    }).populate('supplier_id');

    const suggestions = [];

    for (const item of lowStockItems) {
      const historicalData = await Transaction.aggregate([
        { $unwind: '$items' },
        {
          $match: {
            'items.inventory_item': item._id,
            type: 'sale',
            date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: null,
            totalQuantity: { $sum: "$items.quantity" }
          }
        }
      ]);

      const monthlyDemand = historicalData[0]?.totalQuantity || 0;
      const suggestedQuantity = Math.max(item.reorderQuantity, monthlyDemand * 2);
      const urgency = item.quantity <= 0 ? 'critical' : 'high';

      suggestions.push({
        inventory_id: item._id,
        name: item.name,
        current_stock: item.quantity,
        suggested_quantity: suggestedQuantity,
        supplier: item.supplier_id,
        urgency,
        estimated_cost: suggestedQuantity * item.price.cost,
        reason: generateRestockReason(item, monthlyDemand)
      });
    }

    suggestions.sort((a, b) => {
      const urgencyOrder = { critical: 3, high: 2, medium: 1, low: 0 };
      return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
    });

    res.json({
      success: true,
      data: {
        suggestions: suggestions.slice(0, 20),
        total_suggestions: suggestions.length,
        critical_count: suggestions.filter(s => s.urgency === 'critical').length
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/expense-insights', authMiddleware, checkPermission('analytics_view'), async (req, res, next) => {
  try {
    const { period = 30 } = req.body;
    const startDate = new Date(Date.now() - period * 24 * 60 * 60 * 1000);

    const [
      expenseTrends,
      topExpenseCategories,
      unusualTransactions,
      costOptimization
    ] = await Promise.all([
      Transaction.aggregate([
        { $match: { date: { $gte: startDate }, type: 'purchase' } },
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
        { $match: { date: { $gte: startDate }, type: 'purchase' } },
        {
          $lookup: {
            from: 'inventories',
            localField: 'items.inventory_item',
            foreignField: '_id',
            as: 'inventory_items'
          }
        },
        { $unwind: '$inventory_items' },
        {
          $group: {
            _id: '$inventory_items.category',
            totalAmount: { $sum: '$amount.total' },
            count: { $sum: 1 }
          }
        },
        { $sort: { totalAmount: -1 } }
      ]),
      Transaction.aggregate([
        { $match: { date: { $gte: startDate } } },
        {
          $group: {
            _id: null,
            avgAmount: { $avg: '$amount.total' },
            stdDev: { $stdDevPop: '$amount.total' }
          }
        }
      ]),
      Inventory.aggregate([
        {
          $addFields: {
            daysSinceLastRestock: {
              $divide: [
                { $subtract: [new Date(), { $ifNull: ['$lastRestocked', '$createdAt'] }] },
                1000 * 60 * 60 * 24
              ]
            },
            monthlyBurnRate: { $divide: ['$quantity', 30] }
          }
        },
        {
          $match: {
            $or: [{
              $expr: { $gt: ['$quantity', '$maxStockLevel'] }
            }, {
              daysSinceLastRestock: { $lt: 7 }
            }]
          }
        },
        {
          $project: {
            name: 1,
            quantity: 1,
            minStockLevel: 1,
            maxStockLevel: 1,
            daysSinceLastRestock: 1,
            monthlyBurnRate: 1,
            potentialSavings: { $multiply: [{ $subtract: ['$quantity', '$maxStockLevel'] }, '$price.cost'] }
          }
        }
      ])
    ]);

    const avgAmount = unusualTransactions[0]?.avgAmount || 0;
    const stdDev = unusualTransactions[0]?.stdDev || 0;
    const threshold = avgAmount + (2 * stdDev);

    const outlierTransactions = await Transaction.find({
      date: { $gte: startDate },
      'amount.total': { $gt: threshold }
    }).populate('items.inventory_item', 'name category');

    const insights = {
      expenseTrends,
      topExpenseCategories,
      outlierTransactions,
      costOptimization: costOptimization.slice(0, 10),
      summary: {
        totalExpenses: expenseTrends.reduce((sum, day) => sum + day.totalAmount, 0),
        avgDailyExpense: expenseTrends.reduce((sum, day) => sum + day.totalAmount, 0) / Math.max(expenseTrends.length, 1),
        unusualTransactionsCount: outlierTransactions.length,
        potentialSavings: costOptimization.reduce((sum, item) => sum + (item.potentialSavings || 0), 0)
      }
    };

    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    next(error);
  }
});

router.post('/fraud-detection', authMiddleware, checkPermission('analytics_view'), async (req, res, next) => {
  try {
    const { period = 30 } = req.body;
    const startDate = new Date(Date.now() - period * 24 * 60 * 60 * 1000);

    const suspiciousTransactions = await Transaction.aggregate([
      { $match: { date: { $gte: startDate } } },
      {
        $lookup: {
          from: 'users',
          localField: 'created_by',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: '$created_by',
          user: { $first: '$user' },
          transactionCount: { $sum: 1 },
          totalAmount: { $sum: '$amount.total' },
          avgAmount: { $avg: '$amount.total' },
          maxAmount: { $max: '$amount.total' }
        }
      },
      {
        $match: {
          $or: [
            { transactionCount: { $gt: 50 } },
            { totalAmount: { $gt: 100000 } },
            { avgAmount: { $gt: 10000 } }
          ]
        }
      }
    ]);

    const unusualPatterns = await Transaction.aggregate([
      { $match: { date: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d %H", date: "$date" } },
          transactionCount: { $sum: 1 },
          totalAmount: { $sum: "$amount.total" }
        }
      },
      {
        $match: {
          transactionCount: { $gt: 20 }
        }
      }
    ]);

    const duplicateTransactions = await Transaction.aggregate([
      { $match: { date: { $gte: startDate } } },
      {
        $group: {
          _id: {
            type: '$type',
            amount: '$amount.total',
            hour: { $hour: '$date' }
          },
          count: { $sum: 1 },
          transactions: { $push: '$$ROOT' }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);

    const fraudAlerts = [];

    suspiciousTransactions.forEach(user => {
      fraudAlerts.push({
        type: 'suspicious_user_activity',
        severity: 'high',
        user: user.user,
        details: {
          transactionCount: user.transactionCount,
          totalAmount: user.totalAmount,
          avgAmount: user.avgAmount
        },
        risk_score: calculateRiskScore(user)
      });
    });

    unusualPatterns.forEach(pattern => {
      fraudAlerts.push({
        type: 'unusual_time_pattern',
        severity: 'medium',
        details: {
          time: pattern._id,
          transactionCount: pattern.transactionCount,
          totalAmount: pattern.totalAmount
        },
        risk_score: Math.min(100, pattern.transactionCount * 5)
      });
    });

    duplicateTransactions.forEach(duplicate => {
      fraudAlerts.push({
        type: 'duplicate_transactions',
        severity: 'medium',
        details: {
          pattern: duplicate._id,
          count: duplicate.count,
          transactions: duplicate.transactions.slice(0, 3)
        },
        risk_score: Math.min(100, duplicate.count * 10)
      });
    });

    res.json({
      success: true,
      data: {
        fraudAlerts: fraudAlerts.sort((a, b) => b.risk_score - a.risk_score),
        summary: {
          totalAlerts: fraudAlerts.length,
          highRiskAlerts: fraudAlerts.filter(a => a.severity === 'high').length,
          mediumRiskAlerts: fraudAlerts.filter(a => a.severity === 'medium').length
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

function calculateTrend(historicalData) {
  if (historicalData.length < 2) return 0;
  
  const firstHalf = historicalData.slice(0, Math.floor(historicalData.length / 2));
  const secondHalf = historicalData.slice(Math.floor(historicalData.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, day) => sum + day.totalQuantity, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, day) => sum + day.totalQuantity, 0) / secondHalf.length;

  if (!Number.isFinite(firstAvg) || firstAvg === 0) return 0;
  return (secondAvg - firstAvg) / firstAvg;
}

function generateRestockRecommendation(inventory, predictedDemand) {
  const currentStock = inventory.quantity;
  const minStock = inventory.minStockLevel;
  const maxStock = inventory.maxStockLevel;
  
  if (currentStock <= 0) {
    return `Immediate restock required. Suggest ordering ${Math.min(maxStock, predictedDemand)} units.`;
  } else if (currentStock < minStock) {
    return `Low stock alert. Suggest ordering ${Math.min(maxStock - currentStock, predictedDemand)} units.`;
  } else if (predictedDemand > currentStock * 2) {
    return `High demand predicted. Consider pre-ordering ${Math.round(predictedDemand - currentStock)} units.`;
  } else {
    return `Stock levels adequate. Monitor demand trends.`;
  }
}

function generateRestockReason(item, monthlyDemand) {
  if (item.quantity <= 0) {
    return 'Out of stock - immediate attention required';
  } else if (item.quantity < item.minStockLevel) {
    return `Below minimum stock level (${item.minStockLevel})`;
  } else if (monthlyDemand > item.quantity) {
    return `Current stock insufficient for projected monthly demand`;
  } else {
    return 'Preventive restocking based on demand patterns';
  }
}

function calculateRiskScore(user) {
  let score = 0;
  
  if (user.transactionCount > 50) score += 30;
  if (user.totalAmount > 100000) score += 25;
  if (user.avgAmount > 10000) score += 20;
  if (user.maxAmount > 50000) score += 15;
  
  return Math.min(100, score);
}

module.exports = router;
