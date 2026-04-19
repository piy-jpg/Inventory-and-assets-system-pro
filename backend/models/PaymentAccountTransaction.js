const mongoose = require('mongoose');

const paymentAccountTransactionSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentAccount',
    required: true,
  },
  related_account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentAccount',
  },
  transaction_type: {
    type: String,
    enum: ['deposit', 'withdraw', 'transfer'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  transaction_date: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['completed'],
    default: 'completed',
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

paymentAccountTransactionSchema.index({ account: 1, transaction_date: -1 });
paymentAccountTransactionSchema.index({ related_account: 1, transaction_date: -1 });

module.exports = mongoose.model('PaymentAccountTransaction', paymentAccountTransactionSchema);
