const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transaction_id: {
    type: String,
    required: true,
    unique: true,
    default: () => `TRX_${Date.now()}`
  },
  type: {
    type: String,
    required: true,
    enum: ['purchase', 'sale', 'adjustment', 'transfer', 'return', 'disposal', 'maintenance']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled', 'failed'],
    default: 'pending'
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  amount: {
    total: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    tax: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    }
  },
  items: [{
    inventory_item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unit_price: {
      type: Number,
      required: true,
      min: 0
    },
    total_price: {
      type: Number,
      required: true,
      min: 0
    },
    batch_number: String,
    expiry_date: Date
  }],
  parties: {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'parties.fromType'
    },
    fromType: {
      type: String,
      enum: ['Supplier', 'Customer', 'Warehouse', 'User']
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'parties.toType'
    },
    toType: {
      type: String,
      enum: ['Supplier', 'Customer', 'Warehouse', 'User']
    }
  },
  reference: {
    order_id: String,
    invoice_id: String,
    receipt_id: String,
    purchase_order: String,
    notes: String
  },
  payment: {
    method: {
      type: String,
      enum: ['cash', 'card', 'bank_transfer', 'check', 'credit', 'other']
    },
    status: {
      type: String,
      enum: ['paid', 'pending', 'partial', 'overdue'],
      default: 'pending'
    },
    due_date: Date,
    paid_amount: {
      type: Number,
      default: 0
    },
    payment_date: Date
  },
  location: {
    warehouse: String,
    department: String,
    address: String
  },
  approved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  documents: [{
    name: String,
    url: String,
    type: {
      type: String,
      enum: ['invoice', 'receipt', 'purchase_order', 'delivery_note', 'other']
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  metadata: {
    reason: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    tags: [{
      type: String,
      trim: true
    }]
  }
}, {
  timestamps: true
});

transactionSchema.index({ type: 1, date: -1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ 'parties.from': 1 });
transactionSchema.index({ 'parties.to': 1 });
transactionSchema.index({ created_by: 1 });
transactionSchema.index({ date: -1 });

transactionSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    let total = 0;
    this.items.forEach(item => {
      item.total_price = item.quantity * item.unit_price;
      total += item.total_price;
    });
    this.amount.total = total;
  }
  next();
});

transactionSchema.methods.calculateProfit = function() {
  if (this.type === 'sale') {
    let cost = 0;
    this.items.forEach(item => {
      if (item.inventory_item && item.inventory_item.price) {
        cost += item.quantity * item.inventory_item.price.cost;
      }
    });
    return this.amount.total - cost;
  }
  return 0;
};

transactionSchema.methods.isOverdue = function() {
  if (this.payment.status === 'paid') return false;
  if (!this.payment.due_date) return false;
  return new Date() > this.payment.due_date;
};

transactionSchema.methods.getPaymentStatus = function() {
  if (this.payment.paid_amount >= this.amount.total) {
    return 'paid';
  } else if (this.payment.paid_amount > 0) {
    return 'partial';
  }
  return this.isOverdue() ? 'overdue' : 'pending';
};

module.exports = mongoose.model('Transaction', transactionSchema);
