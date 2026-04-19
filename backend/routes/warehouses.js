const express = require('express');
const Warehouse = require('../models/Warehouse');
const { authMiddleware, checkPermission } = require('../config/auth');

const router = express.Router();

// Get all warehouses
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const warehouses = await Warehouse.find().populate('manager', 'firstName lastName');
    res.json({ success: true, data: { warehouses } });
  } catch (error) {
    next(error);
  }
});

// Create new warehouse
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const warehouse = new Warehouse(req.body);
    await warehouse.save();
    res.status(201).json({ success: true, data: { warehouse } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
