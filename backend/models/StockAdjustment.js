const mongoose = require('mongoose');

const stockAdjustmentSchema = new mongoose.Schema({
  adjustment_id: {
    type: String,
    required: true,
    unique: true,
    default: () => `ADJ_${Date.now()}`
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: true
  },
  type: {
    type: String,
    enum: ['increase', 'decrease'],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  reason: {
    type: String,
    enum: ['damage', 'theft', 'correction', 'return', 'expired', 'other'],
    required: true
  },
  notes: String,
  date: {
    type: Date,
    default: Date.now
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('StockAdjustment', stockAdjustmentSchema);
