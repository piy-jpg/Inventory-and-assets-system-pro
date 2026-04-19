const express = require('express');

const { authMiddleware } = require('../config/auth');
const seedGroceryStoreMonth = require('../services/seedGroceryStoreMonth');
const { getCurrentUserId } = require('../utils/getCurrentUser');

const router = express.Router();

router.post('/grocery-store-month', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin users can load the grocery store demo dataset.',
      });
    }

    const currentUserId = await getCurrentUserId(req.user);
    if (!currentUserId) {
      return res.status(401).json({ success: false, message: 'Authenticated user not found' });
    }

    const summary = await seedGroceryStoreMonth({
      createdBy: currentUserId,
      replaceExisting: req.body?.replaceExisting !== false,
    });

    res.json({
      success: true,
      message: 'One-month grocery store dataset loaded successfully.',
      data: { summary },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
