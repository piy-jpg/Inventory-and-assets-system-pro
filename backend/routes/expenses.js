const express = require('express');
const Expense = require('../models/Expense');
const { authMiddleware, checkPermission } = require('../config/auth');
const { getCurrentUserId } = require('../utils/getCurrentUser');

const router = express.Router();

// Get all expenses
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      status,
      search,
      startDate,
      endDate
    } = req.query;

    const filter = {};
    
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) {
      filter.description = { $regex: search, $options: 'i' };
    }
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(filter)
      .populate('created_by', 'firstName lastName')
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Expense.countDocuments(filter);

    res.json({
      success: true,
      data: {
        expenses,
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

// Create new expense
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const currentUserId = await getCurrentUserId(req.user);
    if (!currentUserId) {
      return res.status(401).json({ success: false, message: 'Authenticated user not found' });
    }

    const expenseData = {
      ...req.body,
      created_by: currentUserId
    };
    const expense = new Expense(expenseData);
    await expense.save();

    res.status(201).json({
      success: true,
      data: { expense }
    });
  } catch (error) {
    next(error);
  }
});

// Get expense categories
router.get('/categories/list', authMiddleware, async (req, res, next) => {
  try {
    const categories = await Expense.distinct('category');
    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
