const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  supplier_id: {
    type: String,
    required: true,
    unique: true,
    default: () => `SUP_${Date.now()}`
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  company_name: {
    type: String,
    required: true,
    trim: true
  },
  contact_person: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    position: String,
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postal_code: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  categories: [{
    type: String,
    required: true
  }],
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory'
  }],
  payment_terms: {
    method: {
      type: String,
      enum: ['cash', 'credit', 'bank_transfer', 'check'],
      default: 'bank_transfer'
    },
    credit_period: {
      type: Number,
      default: 30
    },
    discount: {
      percentage: Number,
      conditions: String
    }
  },
  performance: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },
    on_time_delivery: {
      type: Number,
      min: 0,
      max: 100,
      default: 95
    },
    quality_score: {
      type: Number,
      min: 0,
      max: 100,
      default: 95
    },
    total_orders: {
      type: Number,
      default: 0
    },
    total_value: {
      type: Number,
      default: 0
    },
    last_order_date: Date
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'blacklisted', 'under_review'],
    default: 'active'
  },
  documents: [{
    name: String,
    url: String,
    type: {
      type: String,
      enum: ['contract', 'certificate', 'license', 'insurance', 'other']
    },
    expiry_date: Date,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  notes: [{
    content: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  lead_time: {
    average: {
      type: Number,
      default: 7
    },
    min: Number,
    max: Number,
    unit: {
      type: String,
      default: 'days'
    }
  },
  minimum_order: {
    amount: Number,
    quantity: Number
  }
}, {
  timestamps: true
});

supplierSchema.index({ name: 1, company_name: 1 });
supplierSchema.index({ categories: 1 });
supplierSchema.index({ status: 1 });
supplierSchema.index({ 'performance.rating': -1 });

supplierSchema.methods.updatePerformance = function(order) {
  this.performance.total_orders += 1;
  this.performance.total_value += order.amount.total;
  this.performance.last_order_date = order.date;
  
  return this.save();
};

module.exports = mongoose.model('Supplier', supplierSchema);
