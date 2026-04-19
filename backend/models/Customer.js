const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customer_id: {
    type: String,
    required: true,
    unique: true,
    default: () => `CUST_${Date.now()}`
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true
  },
  company_name: {
    type: String,
    trim: true
  },
  gst_number: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zip: String
  },
  group: {
    type: String,
    enum: ['retail', 'wholesale', 'vip'],
    default: 'retail'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  credit_limit: {
    type: Number,
    default: 0
  },
  outstanding_balance: {
    type: Number,
    default: 0
  },
  payment_status: {
    type: String,
    enum: ['paid', 'pending', 'overdue'],
    default: 'paid'
  },
  last_purchase_date: {
    type: Date
  },
  follow_up_reminder: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  payment_history: [{
    amount: {
      type: Number,
      default: 0
    },
    date: {
      type: Date,
      default: Date.now
    },
    method: {
      type: String,
      default: 'cash'
    },
    reference: String,
    note: String
  }],
  communication_log: [{
    type: {
      type: String,
      enum: ['call', 'email', 'note', 'reminder'],
      default: 'note'
    },
    subject: String,
    content: String,
    follow_up_date: Date,
    created_at: {
      type: Date,
      default: Date.now
    }
  }],
  total_spent: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Customer', customerSchema);
