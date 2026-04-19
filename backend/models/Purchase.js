const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  purchase_id: {
    type: String,
    required: true,
    unique: true,
    default: () => `PUR_${Date.now()}`
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
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
    },
    purchase_price: {
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
  status: {
    type: String,
    enum: ['ordered', 'received', 'cancelled'],
    default: 'ordered'
  },
  payment_status: {
    type: String,
    enum: ['paid', 'pending', 'partial'],
    default: 'pending'
  },
  purchase_date: {
    type: Date,
    default: Date.now
  },
  notes: String,
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Purchase', purchaseSchema);
