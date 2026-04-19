const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  expense_id: {
    type: String,
    required: true,
    unique: true,
    default: () => `EXP_${Date.now()}`
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  description: {
    type: String,
    trim: true
  },
  payment_method: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer', 'check', 'other'],
    default: 'cash'
  },
  status: {
    type: String,
    enum: ['paid', 'pending', 'cancelled'],
    default: 'paid'
  },
  attachment: {
    type: String // Path to receipt or invoice
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Expense', expenseSchema);
