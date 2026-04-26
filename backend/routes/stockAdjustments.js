const express = require('express');
const StockAdjustment = require('../models/StockAdjustment');
const Inventory = require('../models/Inventory');
const Transaction = require('../models/Transaction');
const mockData = require('../data/mockData.js');
const { authMiddleware, checkPermission } = require('../config/auth');
const { getCurrentUserId } = require('../utils/getCurrentUser');
const { isDatabaseAvailable } = require('../config/prisma');
const { emitInventoryUpdate, emitStockAdjustment } = require('../config/socket');

const router = express.Router();

const ensureMockCollections = () => {
  if (!Array.isArray(mockData.stockAdjustments)) {
    mockData.stockAdjustments = [];
  }
  if (!Array.isArray(mockData.transactions)) {
    mockData.transactions = [];
  }
};

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getSignedQuantity = (type, quantity) => (type === 'increase' ? quantity : -quantity);

const getMinStockLevel = (inventoryItem) =>
  toNumber(inventoryItem?.minStockLevel, toNumber(inventoryItem?.minStock, 0));

const applyInventoryStatus = (inventoryItem) => {
  const minStockLevel = getMinStockLevel(inventoryItem);

  if (inventoryItem.quantity <= 0) {
    inventoryItem.status = 'out_of_stock';
    return inventoryItem;
  }

  if (inventoryItem.quantity <= minStockLevel) {
    inventoryItem.status = 'low_stock';
    return inventoryItem;
  }

  inventoryItem.status = 'active';
  return inventoryItem;
};

const buildInventoryPayload = (inventoryItem, extra = {}) => ({
  _id: inventoryItem._id,
  name: inventoryItem.name,
  sku: inventoryItem.sku,
  quantity: inventoryItem.quantity,
  minStockLevel: getMinStockLevel(inventoryItem),
  status: inventoryItem.status,
  updatedAt: inventoryItem.updatedAt,
  ...extra,
});

const emitAdjustmentRealtimeEvents = (inventoryItem, extra = {}) => {
  const payload = buildInventoryPayload(inventoryItem, extra);
  emitInventoryUpdate(payload);
  emitStockAdjustment(payload);
};

const filterMockAdjustments = (items, query) => {
  const { search, type, reason, startDate, endDate } = query;
  let filtered = [...items];

  if (type && type !== 'all') {
    filtered = filtered.filter((item) => item.type === type);
  }

  if (reason && reason !== 'all') {
    filtered = filtered.filter((item) => item.reason === reason);
  }

  if (startDate) {
    const start = new Date(startDate);
    filtered = filtered.filter((item) => new Date(item.createdAt) >= start);
  }

  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    filtered = filtered.filter((item) => new Date(item.createdAt) <= end);
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter((item) =>
      `${item.product?.name || ''} ${item.product?.sku || ''} ${item.reason || ''} ${item.notes || ''}`
        .toLowerCase()
        .includes(searchLower)
    );
  }

  return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const buildMockCreatedBy = (req) => ({
  _id: req.user?.user_id || 'USR_demo',
  firstName: 'Jaanu',
  lastName: 'User',
});

const findMockInventoryItem = (id) =>
  mockData.products.find((item) => item._id === id || item.item_id === id);

const syncMockAdjustmentTransaction = (adjustment, inventoryItem, deleteMode = false) => {
  ensureMockCollections();
  const index = mockData.transactions.findIndex(
    (item) => item.type === 'adjustment' && item.reference?.order_id === adjustment._id
  );

  if (deleteMode) {
    if (index >= 0) {
      mockData.transactions.splice(index, 1);
    }
    return;
  }

  const transaction = {
    _id: index >= 0 ? mockData.transactions[index]._id : `TRX_${Date.now()}`,
    transaction_id: index >= 0 ? mockData.transactions[index].transaction_id : `TRX_${Date.now()}`,
    type: 'adjustment',
    status: 'completed',
    date: adjustment.createdAt,
    amount: {
      total: adjustment.quantity * toNumber(inventoryItem.costPrice || inventoryItem.unitPrice, 0),
      currency: 'USD',
    },
    items: [
      {
        inventory_item: inventoryItem._id,
        quantity: adjustment.quantity,
        unit_price: toNumber(inventoryItem.costPrice || inventoryItem.unitPrice, 0),
        total_price: adjustment.quantity * toNumber(inventoryItem.costPrice || inventoryItem.unitPrice, 0),
      },
    ],
    created_by: adjustment.created_by?._id || 'USR_demo',
    reference: {
      order_id: adjustment._id,
      notes: `${adjustment.type} adjustment: ${adjustment.reason || 'Manual update'}`,
    },
    createdAt: adjustment.createdAt,
    updatedAt: new Date().toISOString(),
  };

  if (index >= 0) {
    mockData.transactions[index] = transaction;
  } else {
    mockData.transactions.unshift(transaction);
  }
};

const createMockAdjustment = (req, inventoryItem, payload) => {
  ensureMockCollections();
  const now = new Date().toISOString();

  return {
    _id: `ADJ_${Date.now()}`,
    adjustment_id: `ADJ_${Date.now()}`,
    product: {
      _id: inventoryItem._id,
      name: inventoryItem.name,
      sku: inventoryItem.sku,
      quantity: inventoryItem.quantity,
      minStockLevel: getMinStockLevel(inventoryItem),
      status: inventoryItem.status,
    },
    type: payload.type,
    quantity: payload.quantity,
    reason: payload.reason,
    notes: payload.notes || '',
    created_by: buildMockCreatedBy(req),
    createdAt: now,
    updatedAt: now,
  };
};

const populateDbAdjustment = (query) =>
  query
    .populate('product', 'name sku quantity minStockLevel status')
    .populate('created_by', 'firstName lastName');

const syncDbAdjustmentTransaction = async (adjustment, inventoryItem) => {
  const transaction = await Transaction.findOne({
    type: 'adjustment',
    'reference.order_id': adjustment._id.toString(),
  });

  if (!transaction) {
    return;
  }

  transaction.date = adjustment.createdAt;
  transaction.items = [
    {
      inventory_item: adjustment.product,
      quantity: adjustment.quantity,
      unit_price: inventoryItem.price?.cost || 0,
      total_price: adjustment.quantity * (inventoryItem.price?.cost || 0),
    },
  ];
  transaction.reference = {
    ...transaction.reference,
    order_id: adjustment._id.toString(),
    notes: `${adjustment.type} adjustment: ${adjustment.reason || 'Manual update'}`,
  };
  await transaction.save();
};

router.get('/', authMiddleware, checkPermission('inventory_read'), async (req, res, next) => {
  try {
    const page = Math.max(toNumber(req.query.page, 1), 1);
    const limit = Math.max(toNumber(req.query.limit, 20), 1);

    if (!isDatabaseAvailable()) {
      ensureMockCollections();
      const filtered = filterMockAdjustments(mockData.stockAdjustments, req.query);
      const startIndex = (page - 1) * limit;
      const adjustments = filtered.slice(startIndex, startIndex + limit);

      return res.json({
        success: true,
        data: {
          adjustments,
          pagination: {
            current: page,
            pages: Math.ceil(filtered.length / limit),
            total: filtered.length,
            limit,
          },
        },
      });
    }

    const { search, type, reason, startDate, endDate } = req.query;
    const filters = {};

    if (type && type !== 'all') {
      filters.type = type;
    }
    if (reason && reason !== 'all') {
      filters.reason = reason;
    }
    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) {
        filters.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filters.createdAt.$lte = end;
      }
    }

    let query = StockAdjustment.find(filters)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);
    query = populateDbAdjustment(query);
    let adjustments = await query.exec();

    if (search) {
      const searchLower = search.toLowerCase();
      adjustments = adjustments.filter((item) =>
        `${item.product?.name || ''} ${item.product?.sku || ''} ${item.reason || ''} ${item.notes || ''}`
          .toLowerCase()
          .includes(searchLower)
      );
    }

    const total = await StockAdjustment.countDocuments(filters);

    res.json({
      success: true,
      data: {
        adjustments,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', authMiddleware, checkPermission('inventory_write'), async (req, res, next) => {
  try {
    const { product, type, quantity, reason, notes } = req.body;
    const numericQuantity = toNumber(quantity, 0);

    if (!product || !type || numericQuantity < 1 || !reason) {
      return res.status(400).json({ success: false, message: 'Invalid stock adjustment payload' });
    }

    if (!isDatabaseAvailable()) {
      ensureMockCollections();
      const inventoryItem = findMockInventoryItem(product);
      if (!inventoryItem) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      const signedQuantity = getSignedQuantity(type, numericQuantity);
      const oldQuantity = inventoryItem.quantity;
      const newQuantity = oldQuantity + signedQuantity;

      if (newQuantity < 0) {
        return res.status(400).json({ success: false, message: 'Insufficient stock for decrease' });
      }

      inventoryItem.quantity = newQuantity;
      inventoryItem.updatedAt = new Date().toISOString();
      applyInventoryStatus(inventoryItem);

      const adjustment = createMockAdjustment(req, inventoryItem, {
        type,
        quantity: numericQuantity,
        reason,
        notes,
      });
      mockData.stockAdjustments.unshift(adjustment);
      syncMockAdjustmentTransaction(adjustment, inventoryItem);
      emitAdjustmentRealtimeEvents(inventoryItem, {
        action: 'created',
        oldQuantity,
        newQuantity,
        adjustment: signedQuantity,
        reason,
        stockAdjustmentId: adjustment._id,
      });

      return res.status(201).json({
        success: true,
        data: {
          adjustment,
          inventory: {
            productId: inventoryItem._id,
            oldQuantity,
            newQuantity,
          },
        },
      });
    }

    const currentUserId = await getCurrentUserId(req.user);
    if (!currentUserId) {
      return res.status(401).json({ success: false, message: 'Authenticated user not found' });
    }

    const inventoryItem = await Inventory.findById(product);
    if (!inventoryItem) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const signedQuantity = getSignedQuantity(type, numericQuantity);
    const oldQuantity = inventoryItem.quantity;
    const newQuantity = oldQuantity + signedQuantity;

    if (newQuantity < 0) {
      return res.status(400).json({ success: false, message: 'Insufficient stock for decrease' });
    }

    inventoryItem.quantity = newQuantity;
    applyInventoryStatus(inventoryItem);
    await inventoryItem.save();

    const adjustment = await StockAdjustment.create({
      product,
      type,
      quantity: numericQuantity,
      reason,
      notes,
      created_by: currentUserId,
    });

    await Transaction.create({
      type: 'adjustment',
      status: 'completed',
      date: adjustment.createdAt,
      amount: {
        total: 0,
        currency: inventoryItem.price?.currency || 'USD',
      },
      items: [
        {
          inventory_item: product,
          quantity: numericQuantity,
          unit_price: inventoryItem.price?.cost || 0,
          total_price: numericQuantity * (inventoryItem.price?.cost || 0),
        },
      ],
      created_by: currentUserId,
      reference: {
        order_id: adjustment._id.toString(),
        notes: `${type} adjustment: ${reason || 'Manual update'}`,
      },
    });

    const populatedAdjustment = await populateDbAdjustment(StockAdjustment.findById(adjustment._id)).exec();
    emitAdjustmentRealtimeEvents(inventoryItem, {
      action: 'created',
      oldQuantity,
      newQuantity,
      adjustment: signedQuantity,
      reason,
      stockAdjustmentId: adjustment._id,
    });

    res.status(201).json({
      success: true,
      data: {
        adjustment: populatedAdjustment,
        inventory: {
          productId: inventoryItem._id,
          oldQuantity,
          newQuantity,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authMiddleware, checkPermission('inventory_write'), async (req, res, next) => {
  try {
    const { product, type, quantity, reason, notes } = req.body;
    const numericQuantity = toNumber(quantity, 0);

    if (!product || !type || numericQuantity < 1 || !reason) {
      return res.status(400).json({ success: false, message: 'Invalid stock adjustment payload' });
    }

    if (!isDatabaseAvailable()) {
      ensureMockCollections();
      const adjustment = mockData.stockAdjustments.find((item) => item._id === req.params.id);
      if (!adjustment) {
        return res.status(404).json({ success: false, message: 'Adjustment not found' });
      }

      const oldProductId = adjustment.product?._id || adjustment.product;
      const previousInventoryItem = findMockInventoryItem(oldProductId);
      const nextInventoryItem = oldProductId === product ? previousInventoryItem : findMockInventoryItem(product);

      if (!previousInventoryItem || !nextInventoryItem) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      const previousSigned = getSignedQuantity(adjustment.type, adjustment.quantity);
      const nextSigned = getSignedQuantity(type, numericQuantity);
      const previousOldQuantity = previousInventoryItem.quantity;
      const previousNewQuantity =
        previousInventoryItem._id === nextInventoryItem._id
          ? previousInventoryItem.quantity - previousSigned + nextSigned
          : previousInventoryItem.quantity - previousSigned;

      if (previousNewQuantity < 0) {
        return res.status(400).json({ success: false, message: 'Updated adjustment would create negative stock' });
      }

      previousInventoryItem.quantity = previousNewQuantity;
      previousInventoryItem.updatedAt = new Date().toISOString();
      applyInventoryStatus(previousInventoryItem);

      let nextOldQuantity = previousInventoryItem.quantity;
      let nextNewQuantity = previousInventoryItem.quantity;

      if (previousInventoryItem._id !== nextInventoryItem._id) {
        nextOldQuantity = nextInventoryItem.quantity;
        nextNewQuantity = nextInventoryItem.quantity + nextSigned;

        if (nextNewQuantity < 0) {
          return res.status(400).json({ success: false, message: 'Updated adjustment would create negative stock' });
        }

        nextInventoryItem.quantity = nextNewQuantity;
        nextInventoryItem.updatedAt = new Date().toISOString();
        applyInventoryStatus(nextInventoryItem);
      }

      adjustment.product = {
        _id: nextInventoryItem._id,
        name: nextInventoryItem.name,
        sku: nextInventoryItem.sku,
        quantity: nextInventoryItem.quantity,
        minStockLevel: getMinStockLevel(nextInventoryItem),
        status: nextInventoryItem.status,
      };
      adjustment.type = type;
      adjustment.quantity = numericQuantity;
      adjustment.reason = reason;
      adjustment.notes = notes || '';
      adjustment.updatedAt = new Date().toISOString();

      syncMockAdjustmentTransaction(adjustment, nextInventoryItem);

      emitAdjustmentRealtimeEvents(previousInventoryItem, {
        action: 'updated',
        oldQuantity: previousOldQuantity,
        newQuantity: previousInventoryItem.quantity,
        adjustment: -previousSigned,
        reason,
        stockAdjustmentId: adjustment._id,
      });

      if (previousInventoryItem._id !== nextInventoryItem._id) {
        emitAdjustmentRealtimeEvents(nextInventoryItem, {
          action: 'updated',
          oldQuantity: nextOldQuantity,
          newQuantity: nextInventoryItem.quantity,
          adjustment: nextSigned,
          reason,
          stockAdjustmentId: adjustment._id,
        });
      } else {
        emitAdjustmentRealtimeEvents(nextInventoryItem, {
          action: 'updated',
          oldQuantity: previousOldQuantity,
          newQuantity: nextInventoryItem.quantity,
          adjustment: nextSigned - previousSigned,
          reason,
          stockAdjustmentId: adjustment._id,
        });
      }

      return res.json({
        success: true,
        data: {
          adjustment,
        },
      });
    }

    const adjustment = await StockAdjustment.findById(req.params.id);
    if (!adjustment) {
      return res.status(404).json({ success: false, message: 'Adjustment not found' });
    }

    const previousInventoryItem = await Inventory.findById(adjustment.product);
    const nextInventoryItem = String(adjustment.product) === String(product)
      ? previousInventoryItem
      : await Inventory.findById(product);

    if (!previousInventoryItem || !nextInventoryItem) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const previousSigned = getSignedQuantity(adjustment.type, adjustment.quantity);
    const nextSigned = getSignedQuantity(type, numericQuantity);
    const previousOldQuantity = previousInventoryItem.quantity;
    const previousNewQuantity =
      String(previousInventoryItem._id) === String(nextInventoryItem._id)
        ? previousInventoryItem.quantity - previousSigned + nextSigned
        : previousInventoryItem.quantity - previousSigned;

    if (previousNewQuantity < 0) {
      return res.status(400).json({ success: false, message: 'Updated adjustment would create negative stock' });
    }

    previousInventoryItem.quantity = previousNewQuantity;
    applyInventoryStatus(previousInventoryItem);

    let nextOldQuantity = previousInventoryItem.quantity;
    let nextNewQuantity = previousInventoryItem.quantity;

    if (String(previousInventoryItem._id) !== String(nextInventoryItem._id)) {
      nextOldQuantity = nextInventoryItem.quantity;
      nextNewQuantity = nextInventoryItem.quantity + nextSigned;

      if (nextNewQuantity < 0) {
        return res.status(400).json({ success: false, message: 'Updated adjustment would create negative stock' });
      }

      nextInventoryItem.quantity = nextNewQuantity;
      applyInventoryStatus(nextInventoryItem);
      await nextInventoryItem.save();
    }

    await previousInventoryItem.save();

    adjustment.product = product;
    adjustment.type = type;
    adjustment.quantity = numericQuantity;
    adjustment.reason = reason;
    adjustment.notes = notes || '';
    await adjustment.save();

    await syncDbAdjustmentTransaction(adjustment, nextInventoryItem);

    const populatedAdjustment = await populateDbAdjustment(StockAdjustment.findById(adjustment._id)).exec();

    emitAdjustmentRealtimeEvents(previousInventoryItem, {
      action: 'updated',
      oldQuantity: previousOldQuantity,
      newQuantity: previousInventoryItem.quantity,
      adjustment: -previousSigned,
      reason,
      stockAdjustmentId: adjustment._id,
    });

    if (String(previousInventoryItem._id) !== String(nextInventoryItem._id)) {
      emitAdjustmentRealtimeEvents(nextInventoryItem, {
        action: 'updated',
        oldQuantity: nextOldQuantity,
        newQuantity: nextInventoryItem.quantity,
        adjustment: nextSigned,
        reason,
        stockAdjustmentId: adjustment._id,
      });
    } else {
      emitAdjustmentRealtimeEvents(nextInventoryItem, {
        action: 'updated',
        oldQuantity: previousOldQuantity,
        newQuantity: nextInventoryItem.quantity,
        adjustment: nextSigned - previousSigned,
        reason,
        stockAdjustmentId: adjustment._id,
      });
    }

    res.json({
      success: true,
      data: {
        adjustment: populatedAdjustment,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authMiddleware, checkPermission('inventory_write'), async (req, res, next) => {
  try {
    if (!isDatabaseAvailable()) {
      ensureMockCollections();
      const index = mockData.stockAdjustments.findIndex((item) => item._id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Adjustment not found' });
      }

      const [adjustment] = mockData.stockAdjustments.splice(index, 1);
      const inventoryItem = findMockInventoryItem(adjustment.product?._id || adjustment.product);
      if (!inventoryItem) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      const signedQuantity = getSignedQuantity(adjustment.type, adjustment.quantity);
      const oldQuantity = inventoryItem.quantity;
      const newQuantity = oldQuantity - signedQuantity;

      if (newQuantity < 0) {
        mockData.stockAdjustments.splice(index, 0, adjustment);
        return res.status(400).json({
          success: false,
          message: 'Cannot delete this adjustment because it would create negative stock',
        });
      }

      inventoryItem.quantity = newQuantity;
      inventoryItem.updatedAt = new Date().toISOString();
      applyInventoryStatus(inventoryItem);
      syncMockAdjustmentTransaction(adjustment, inventoryItem, true);
      emitAdjustmentRealtimeEvents(inventoryItem, {
        action: 'deleted',
        oldQuantity,
        newQuantity,
        adjustment: -signedQuantity,
        reason: adjustment.reason,
        stockAdjustmentId: adjustment._id,
      });

      return res.json({
        success: true,
        message: 'Adjustment deleted successfully',
        data: {
          inventory: {
            productId: inventoryItem._id,
            oldQuantity,
            newQuantity,
          },
        },
      });
    }

    const adjustment = await StockAdjustment.findById(req.params.id);
    if (!adjustment) {
      return res.status(404).json({ success: false, message: 'Adjustment not found' });
    }

    const inventoryItem = await Inventory.findById(adjustment.product);
    if (!inventoryItem) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const signedQuantity = getSignedQuantity(adjustment.type, adjustment.quantity);
    const oldQuantity = inventoryItem.quantity;
    const newQuantity = oldQuantity - signedQuantity;

    if (newQuantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete this adjustment because it would create negative stock',
      });
    }

    inventoryItem.quantity = newQuantity;
    applyInventoryStatus(inventoryItem);
    await inventoryItem.save();
    await Transaction.deleteMany({
      type: 'adjustment',
      'reference.order_id': adjustment._id.toString(),
    });
    await adjustment.deleteOne();

    emitAdjustmentRealtimeEvents(inventoryItem, {
      action: 'deleted',
      oldQuantity,
      newQuantity,
      adjustment: -signedQuantity,
      reason: adjustment.reason,
      stockAdjustmentId: adjustment._id,
    });

    res.json({
      success: true,
      message: 'Adjustment deleted successfully',
      data: {
        inventory: {
          productId: inventoryItem._id,
          oldQuantity,
          newQuantity,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
