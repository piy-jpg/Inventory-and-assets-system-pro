const mongoose = require('mongoose');

const stockTransferSchema = new mongoose.Schema({
  transfer_id: {
    type: String,
    required: true,
    unique: true,
    default: () => `TRF_${Date.now()}`
  },
  from_warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true
  },
  to_warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'in_transit', 'completed', 'cancelled'],
    default: 'pending'
  },
  shipping_charges: {
    type: Number,
    default: 0
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

module.exports = mongoose.model('StockTransfer', stockTransferSchema);
