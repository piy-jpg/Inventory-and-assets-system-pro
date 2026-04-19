const express = require('express');
const Asset = require('../models/Asset');
const Alert = require('../models/Alert');
const { authMiddleware, checkPermission } = require('../config/auth');
const { validateAsset } = require('../middleware/validation');
const { getCurrentUserId } = require('../utils/getCurrentUser');

const router = express.Router();

router.get('/', authMiddleware, checkPermission('assets_read'), async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      status,
      type,
      search,
      sortBy = 'asset_name',
      sortOrder = 'asc',
      assignedTo
    } = req.query;

    const filter = {};
    
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (assignedTo) filter['assigned_to.user_id'] = assignedTo;
    if (search) {
      filter.$or = [
        { asset_name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'specifications.serialNumber': { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const assets = await Asset.find(filter)
      .populate('assigned_to.user_id', 'firstName lastName email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Asset.countDocuments(filter);

    res.json({
      success: true,
      data: {
        assets,
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

router.get('/:id', authMiddleware, checkPermission('assets_read'), async (req, res, next) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate('assigned_to.user_id', 'firstName lastName email')
      .populate('notes.author', 'firstName lastName');

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    res.json({
      success: true,
      data: { asset }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', authMiddleware, checkPermission('assets_write'), validateAsset, async (req, res, next) => {
  try {
    const asset = new Asset(req.body);
    
    asset.current_value = {
      amount: asset.calculateCurrentValue(),
      currency: asset.purchase_cost.currency,
      lastUpdated: new Date()
    };

    await asset.save();

    if (asset.isMaintenanceDue()) {
      await Alert.createMaintenanceDueAlert(asset);
    }

    const io = req.app.get('io');
    io.emit('asset-updated', {
      type: 'created',
      data: asset
    });

    res.status(201).json({
      success: true,
      message: 'Asset created successfully',
      data: { asset }
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authMiddleware, checkPermission('assets_write'), validateAsset, async (req, res, next) => {
  try {
    const asset = await Asset.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('assigned_to.user_id', 'firstName lastName email');

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    asset.current_value = {
      amount: asset.calculateCurrentValue(),
      currency: asset.purchase_cost.currency,
      lastUpdated: new Date()
    };

    await asset.save();

    if (asset.isMaintenanceDue()) {
      await Alert.createMaintenanceDueAlert(asset);
    }

    const io = req.app.get('io');
    io.emit('asset-updated', {
      type: 'updated',
      data: asset
    });

    res.json({
      success: true,
      message: 'Asset updated successfully',
      data: { asset }
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authMiddleware, checkPermission('assets_write'), async (req, res, next) => {
  try {
    const asset = await Asset.findByIdAndDelete(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    const io = req.app.get('io');
    io.emit('asset-updated', {
      type: 'deleted',
      data: { _id: req.params.id }
    });

    res.json({
      success: true,
      message: 'Asset deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/assign', authMiddleware, checkPermission('assets_write'), async (req, res, next) => {
  try {
    const { user_id, department, location } = req.body;

    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    asset.assigned_to = {
      user_id,
      department,
      location,
      assigned_date: new Date()
    };

    await asset.save();

    const populatedAsset = await Asset.findById(req.params.id)
      .populate('assigned_to.user_id', 'firstName lastName email');

    const io = req.app.get('io');
    io.emit('asset-assigned', {
      assetId: asset._id,
      assignedTo: user_id
    });

    res.json({
      success: true,
      message: 'Asset assigned successfully',
      data: { asset: populatedAsset }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/unassign', authMiddleware, checkPermission('assets_write'), async (req, res, next) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    asset.assigned_to = {};

    await asset.save();

    const io = req.app.get('io');
    io.emit('asset-unassigned', {
      assetId: asset._id
    });

    res.json({
      success: true,
      message: 'Asset unassigned successfully',
      data: { asset }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/maintenance', authMiddleware, checkPermission('assets_write'), async (req, res, next) => {
  try {
    const currentUserId = await getCurrentUserId(req.user);
    if (!currentUserId) {
      return res.status(401).json({ success: false, message: 'Authenticated user not found' });
    }

    const { maintenanceDate, cost, notes, nextMaintenanceDue } = req.body;

    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    asset.maintenance.lastMaintenance = maintenanceDate || new Date();
    asset.maintenance.nextMaintenanceDue = nextMaintenanceDue;
    if (cost) {
      asset.maintenance.maintenanceCost.total += cost;
      asset.maintenance.maintenanceCost.lastCost = cost;
    }

    if (notes) {
      asset.notes.push({
        content: notes,
        author: currentUserId
      });
    }

    await asset.save();

    const io = req.app.get('io');
    io.emit('asset-maintenance', {
      assetId: asset._id,
      maintenanceDate: asset.maintenance.lastMaintenance
    });

    res.json({
      success: true,
      message: 'Maintenance record added successfully',
      data: { asset }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/maintenance/due', authMiddleware, checkPermission('assets_read'), async (req, res, next) => {
  try {
    const dueAssets = await Asset.find({
      'maintenance.nextMaintenanceDue': { $lte: new Date() },
      status: { $ne: 'disposed' }
    }).populate('assigned_to.user_id', 'firstName lastName email');

    res.json({
      success: true,
      data: { dueAssets }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/categories/list', authMiddleware, checkPermission('assets_read'), async (req, res, next) => {
  try {
    const categories = await Asset.distinct('category');
    
    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
