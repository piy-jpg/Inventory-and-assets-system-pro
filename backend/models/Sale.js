const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  sale_id: {
    type: String,
    required: true,
    unique: true,
    default: () => `SAL_${Date.now()}`
  },
  customer_name: {
    type: String,
    default: 'Walk-in Customer'
  },
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
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
    },
    selling_price: {
      type: Number,
      required: true,
      min: 0
    },
    total: {
      type: Number,
      required: true
    }
  }],
  total_amount: {
    type: Number,
    required: true,
    min: 0
  },
  payment_method: {
    type: String,
    enum: ['cash', 'card', 'online', 'other'],
    default: 'cash'
  },
  status: {
    type: String,
    enum: ['completed', 'cancelled', 'refunded'],
    default: 'completed'
  },
  sale_date: {
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

module.exports = mongoose.model('Sale', saleSchema);
