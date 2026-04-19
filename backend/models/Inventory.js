const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  product_id: {
    type: String,
    required: true,
    unique: true,
    default: () => `PRD_${Date.now()}`
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  brand: {
    type: String,
    trim: true
  },
  warranty: {
    type: String,
    trim: true
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  minStockLevel: {
    type: Number,
    default: 10,
    min: 0
  },
  maxStockLevel: {
    type: Number,
    default: 1000,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    default: 'pieces'
  },
  price: {
    cost: {
      type: Number,
      required: true,
      min: 0
    },
    selling: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  supplier_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  location: {
    warehouse: String,
    aisle: String,
    shelf: String,
    bin: String
  },
  status: {
    type: String,
    enum: ['active', 'discontinued', 'out_of_stock', 'low_stock'],
    default: 'active'
  },
  reorderPoint: {
    type: Number,
    default: 20
  },
  reorderQuantity: {
    type: Number,
    default: 100
  },
  lastRestocked: {
    type: Date
  },
  expiryDate: {
    type: Date
  },
  batchNumber: {
    type: String
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    weight: Number,
    unit: {
      type: String,
      default: 'cm'
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  images: [{
    url: String,
    alt: String
  }],
  aiPredictedDemand: {
    next30Days: Number,
    next90Days: Number,
    confidence: Number,
    lastUpdated: Date
  }
}, {
  timestamps: true
});

inventorySchema.index({ name: 1, category: 1 });
inventorySchema.index({ quantity: 1 });
inventorySchema.index({ 'price.cost': 1 });
inventorySchema.index({ supplier_id: 1 });

inventorySchema.methods.checkStockLevel = function() {
  if (this.quantity <= 0) {
    return 'out_of_stock';
  } else if (this.quantity <= this.minStockLevel) {
    return 'low_stock';
  } else if (this.quantity >= this.maxStockLevel) {
    return 'overstocked';
  }
  return 'normal';
};

inventorySchema.methods.calculateValue = function() {
  return this.quantity * this.price.cost;
};

module.exports = mongoose.model('Inventory', inventorySchema);
