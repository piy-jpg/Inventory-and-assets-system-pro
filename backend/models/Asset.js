const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  asset_id: {
    type: String,
    required: true,
    unique: true,
    default: () => `AST_${Date.now()}`
  },
  asset_name: {
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
  type: {
    type: String,
    required: true,
    enum: ['equipment', 'furniture', 'vehicle', 'electronics', 'machinery', 'building', 'other']
  },
  purchase_date: {
    type: Date,
    required: true
  },
  purchase_cost: {
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  current_value: {
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    lastUpdated: Date
  },
  depreciation: {
    method: {
      type: String,
      enum: ['straight_line', 'declining_balance', 'sum_of_years'],
      default: 'straight_line'
    },
    usefulLife: {
      type: Number,
      required: true
    },
    salvageValue: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['active', 'in_repair', 'maintenance_due', 'disposed', 'retired', 'lost'],
    default: 'active'
  },
  assigned_to: {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    department: String,
    location: String,
    assigned_date: Date
  },
  location: {
    building: String,
    floor: String,
    room: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  maintenance: {
    lastMaintenance: Date,
    nextMaintenanceDue: Date,
    maintenanceInterval: {
      type: Number,
      default: 90
    },
    maintenanceCost: {
      total: {
        type: Number,
        default: 0
      },
      lastCost: Number
    },
    warranty: {
      startDate: Date,
      endDate: Date,
      provider: String,
      coverage: String
    }
  },
  qr_code: {
    data: String,
    generated_date: Date
  },
  barcode: {
    data: String,
    generated_date: Date
  },
  images: [{
    url: String,
    alt: String,
    type: {
      type: String,
      enum: ['purchase', 'current', 'damage', 'maintenance']
    }
  }],
  documents: [{
    name: String,
    url: String,
    type: {
      type: String,
      enum: ['invoice', 'warranty', 'manual', 'maintenance_record', 'other']
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  specifications: {
    make: String,
    model: String,
    serialNumber: {
      type: String,
      unique: true,
      sparse: true
    },
    year: Number,
    color: String,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        default: 'cm'
      }
    },
    weight: Number
  },
  usage: {
    totalUsageHours: {
      type: Number,
      default: 0
    },
    lastUsageDate: Date,
    usagePerDay: Number
  },
  tags: [{
    type: String,
    trim: true
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
  }]
}, {
  timestamps: true
});

assetSchema.index({ asset_name: 1, category: 1 });
assetSchema.index({ status: 1 });
assetSchema.index({ 'assigned_to.user_id': 1 });
assetSchema.index({ purchase_date: 1 });

assetSchema.methods.calculateDepreciation = function() {
  const ageInYears = (Date.now() - this.purchase_date) / (365.25 * 24 * 60 * 60 * 1000);
  const depreciableAmount = this.purchase_cost.amount - this.depreciation.salvageValue;
  
  if (this.depreciation.method === 'straight_line') {
    const annualDepreciation = depreciableAmount / this.depreciation.usefulLife;
    return Math.min(depreciableAmount, annualDepreciation * ageInYears);
  }
  
  return 0;
};

assetSchema.methods.calculateCurrentValue = function() {
  const depreciation = this.calculateDepreciation();
  return Math.max(this.depreciation.salvageValue, this.purchase_cost.amount - depreciation);
};

assetSchema.methods.isMaintenanceDue = function() {
  if (!this.maintenance.nextMaintenanceDue) return false;
  return new Date() >= this.maintenance.nextMaintenanceDue;
};

assetSchema.methods.getAge = function() {
  return Math.floor((Date.now() - this.purchase_date) / (365.25 * 24 * 60 * 60 * 1000));
};

module.exports = mongoose.model('Asset', assetSchema);
