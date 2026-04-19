const mongoose = require('mongoose');

const paymentAccountSchema = new mongoose.Schema({
  name: { type: String, required: true },
  account_number: { type: String, trim: true },
  account_type: { type: String, enum: ['bank', 'cash', 'upi', 'credit', 'other'], default: 'bank' },
  opening_balance: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  bank_name: String,
  bank_branch: String,
  upi_id: String,
  card_number: String,
  card_type: { type: String, enum: ['credit', 'debit'], default: 'credit' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

paymentAccountSchema.virtual('current_balance').get(function getCurrentBalance() {
  return this.balance ?? this.opening_balance ?? 0;
});

module.exports = mongoose.model('PaymentAccount', paymentAccountSchema);
