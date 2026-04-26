const express = require('express');
const Supplier = require('../models/Supplier');
const { authMiddleware, checkPermission } = require('../config/auth');
const { validateSupplier } = require('../middleware/validation');

const router = express.Router();

router.get('/', authMiddleware, checkPermission('inventory_read'), async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      category,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    const filter = {};
    
    if (status) filter.status = status;
    if (category) filter.categories = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company_name: { $regex: search, $options: 'i' } },
        { 'contact_person.email': { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const suppliers = await Supplier.find(filter)
      .populate('products', 'name category quantity')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Supplier.countDocuments(filter);

    res.json({
      success: true,
      data: {
        suppliers,
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

router.get('/categories/list', authMiddleware, checkPermission('inventory_read'), async (req, res, next) => {
  try {
    const categories = await Supplier.distinct('categories');
    
    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authMiddleware, checkPermission('inventory_read'), async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id)
      .populate('products')
      .populate('notes.author', 'firstName lastName');

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    res.json({
      success: true,
      data: { supplier }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', authMiddleware, checkPermission('inventory_write'), validateSupplier, async (req, res, next) => {
  try {
    const supplier = new Supplier(req.body);
    await supplier.save();

    const io = req.app.get('io');
    io.emit('supplier-created', {
      type: 'created',
      data: supplier
    });

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: { supplier }
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authMiddleware, checkPermission('inventory_write'), validateSupplier, async (req, res, next) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('products');

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    const io = req.app.get('io');
    io.emit('supplier-updated', {
      type: 'updated',
      data: supplier
    });

    res.json({
      success: true,
      message: 'Supplier updated successfully',
      data: { supplier }
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authMiddleware, checkPermission('inventory_write'), async (req, res, next) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    const io = req.app.get('io');
    io.emit('supplier-deleted', {
      type: 'deleted',
      data: { _id: req.params.id }
    });

    res.json({
      success: true,
      message: 'Supplier deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/performance', authMiddleware, checkPermission('inventory_write'), async (req, res, next) => {
  try {
    const { rating, onTimeDelivery, qualityScore } = req.body;

    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    if (rating !== undefined) supplier.performance.rating = rating;
    if (onTimeDelivery !== undefined) supplier.performance.on_time_delivery = onTimeDelivery;
    if (qualityScore !== undefined) supplier.performance.quality_score = qualityScore;

    await supplier.save();

    res.json({
      success: true,
      message: 'Supplier performance updated successfully',
      data: { supplier }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
