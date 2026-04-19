const express = require('express');
const Alert = require('../models/Alert');
const { authMiddleware, checkPermission } = require('../config/auth');
const { getCurrentUserId } = require('../utils/getCurrentUser');

const router = express.Router();

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      severity,
      status,
      entity_type,
      search,
      sortBy = 'timestamps.created',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    
    if (type) filter.type = type;
    if (severity) filter.severity = severity;
    if (status) filter.status = status;
    if (entity_type) filter.entity_type = entity_type;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
        { entity_name: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const alerts = await Alert.find(filter)
      .populate('assigned_to', 'firstName lastName email')
      .populate('created_by', 'firstName lastName')
      .populate('acknowledged_by', 'firstName lastName')
      .populate('resolved_by', 'firstName lastName')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Alert.countDocuments(filter);

    res.json({
      success: true,
      data: {
        alerts,
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

router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id)
      .populate('assigned_to', 'firstName lastName email')
      .populate('created_by', 'firstName lastName')
      .populate('acknowledged_by', 'firstName lastName')
      .populate('resolved_by', 'firstName lastName');

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.json({
      success: true,
      data: { alert }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const currentUserId = await getCurrentUserId(req.user);
    if (!currentUserId) {
      return res.status(401).json({ success: false, message: 'Authenticated user not found' });
    }

    const alert = new Alert({
      ...req.body,
      created_by: currentUserId
    });

    await alert.save();

    const io = req.app.get('io');
    io.emit('alert-created', {
      type: 'created',
      data: alert
    });

    res.status(201).json({
      success: true,
      message: 'Alert created successfully',
      data: { alert }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/acknowledge', authMiddleware, async (req, res, next) => {
  try {
    const currentUserId = await getCurrentUserId(req.user);
    if (!currentUserId) {
      return res.status(401).json({ success: false, message: 'Authenticated user not found' });
    }

    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    if (alert.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Alert can only be acknowledged when status is active'
      });
    }

    await alert.acknowledge(currentUserId);

    const io = req.app.get('io');
    io.emit('alert-acknowledged', {
      alertId: alert._id,
      acknowledgedBy: currentUserId
    });

    res.json({
      success: true,
      message: 'Alert acknowledged successfully',
      data: { alert }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/resolve', authMiddleware, async (req, res, next) => {
  try {
    const currentUserId = await getCurrentUserId(req.user);
    if (!currentUserId) {
      return res.status(401).json({ success: false, message: 'Authenticated user not found' });
    }

    const { resolution_note } = req.body;

    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    if (alert.status === 'resolved' || alert.status === 'dismissed') {
      return res.status(400).json({
        success: false,
        message: 'Alert is already resolved or dismissed'
      });
    }

    await alert.resolve(currentUserId);

    if (resolution_note) {
      alert.notes.push({
        content: resolution_note,
        author: currentUserId
      });
      await alert.save();
    }

    const io = req.app.get('io');
    io.emit('alert-resolved', {
      alertId: alert._id,
      resolvedBy: currentUserId
    });

    res.json({
      success: true,
      message: 'Alert resolved successfully',
      data: { alert }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/dismiss', authMiddleware, async (req, res, next) => {
  try {
    const currentUserId = await getCurrentUserId(req.user);
    if (!currentUserId) {
      return res.status(401).json({ success: false, message: 'Authenticated user not found' });
    }

    const { dismissal_reason } = req.body;

    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    if (alert.status === 'resolved' || alert.status === 'dismissed') {
      return res.status(400).json({
        success: false,
        message: 'Alert is already resolved or dismissed'
      });
    }

    await alert.dismiss(currentUserId);

    if (dismissal_reason) {
      alert.notes.push({
        content: dismissal_reason,
        author: currentUserId
      });
      await alert.save();
    }

    const io = req.app.get('io');
    io.emit('alert-dismissed', {
      alertId: alert._id,
      dismissedBy: currentUserId
    });

    res.json({
      success: true,
      message: 'Alert dismissed successfully',
      data: { alert }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/assign', authMiddleware, async (req, res, next) => {
  try {
    const { assigned_to } = req.body;

    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    alert.assigned_to = assigned_to;
    await alert.save();

    const io = req.app.get('io');
    io.emit('alert-assigned', {
      alertId: alert._id,
      assignedTo: assigned_to
    });

    res.json({
      success: true,
      message: 'Alert assigned successfully',
      data: { alert }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/summary/stats', authMiddleware, async (req, res, next) => {
  try {
    const stats = await Alert.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const severityStats = await Alert.aggregate([
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 }
        }
      }
    ]);

    const typeStats = await Alert.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const recentAlerts = await Alert.find({ status: 'active' })
      .sort({ 'timestamps.created': -1 })
      .limit(5)
      .populate('assigned_to', 'firstName lastName')
      .exec();

    res.json({
      success: true,
      data: {
        statusStats: stats,
        severityStats: severityStats,
        typeStats: typeStats,
        recentAlerts
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/active/count', authMiddleware, async (req, res, next) => {
  try {
    const count = await Alert.countDocuments({ status: 'active' });
    
    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
