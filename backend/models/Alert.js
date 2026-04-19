const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  alert_id: {
    type: String,
    required: true,
    unique: true,
    default: () => `ALT_${Date.now()}`
  },
  type: {
    type: String,
    required: true,
    enum: ['low_stock', 'out_of_stock', 'maintenance_due', 'asset_disposed', 
            'transaction_failed', 'security_breach', 'budget_exceeded', 'expiry_warning',
            'quality_issue', 'delayed_delivery', 'ai_prediction']
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  entity_type: {
    type: String,
    enum: ['inventory', 'asset', 'transaction', 'user', 'system'],
    required: true
  },
  entity_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  entity_name: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'acknowledged', 'resolved', 'dismissed'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assigned_to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  acknowledged_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  timestamps: {
    created: {
      type: Date,
      default: Date.now
    },
    acknowledged: Date,
    resolved: Date,
    due_date: Date
  },
  details: {
    current_value: Number,
    threshold_value: Number,
    percentage: Number,
    previous_value: Number,
    location: String,
    department: String,
    supplier: String,
    customer: String
  },
  actions: [{
    action: String,
    description: String,
    completed: {
      type: Boolean,
      default: false
    },
    completed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    completed_date: Date
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
  notifications: {
    email_sent: {
      type: Boolean,
      default: false
    },
    sms_sent: {
      type: Boolean,
      default: false
    },
    push_sent: {
      type: Boolean,
      default: false
    },
    last_notification: Date
  },
  escalation: {
    level: {
      type: Number,
      default: 1
    },
    escalated_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    escalation_date: Date,
    auto_escalate: {
      type: Boolean,
      default: true
    },
    escalation_interval: {
      type: Number,
      default: 24
    }
  },
  metadata: {
    source: {
      type: String,
      enum: ['system', 'user', 'ai', 'external'],
      default: 'system'
    },
    category: String,
    tags: [{
      type: String,
      trim: true
    }],
    related_alerts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Alert'
    }]
  }
}, {
  timestamps: true
});

alertSchema.index({ type: 1, status: 1 });
alertSchema.index({ severity: 1, status: 1 });
alertSchema.index({ entity_type: 1, entity_id: 1 });
alertSchema.index({ assigned_to: 1, status: 1 });
alertSchema.index({ 'timestamps.created': -1 });

alertSchema.methods.acknowledge = function(userId) {
  this.status = 'acknowledged';
  this.acknowledged_by = userId;
  this.timestamps.acknowledged = new Date();
  return this.save();
};

alertSchema.methods.resolve = function(userId) {
  this.status = 'resolved';
  this.resolved_by = userId;
  this.timestamps.resolved = new Date();
  return this.save();
};

alertSchema.methods.dismiss = function(userId) {
  this.status = 'dismissed';
  this.resolved_by = userId;
  this.timestamps.resolved = new Date();
  return this.save();
};

alertSchema.methods.escalate = function(userId) {
  this.escalation.level += 1;
  this.escalation.escalated_to = userId;
  this.escalation.escalation_date = new Date();
  return this.save();
};

alertSchema.methods.isOverdue = function() {
  if (!this.timestamps.due_date) return false;
  return new Date() > this.timestamps.due_date && this.status === 'active';
};

alertSchema.methods.getTimeSinceCreation = function() {
  return Date.now() - this.timestamps.created.getTime();
};

alertSchema.statics.createLowStockAlert = function(inventoryItem) {
  const alert = new this({
    type: 'low_stock',
    severity: inventoryItem.quantity <= 0 ? 'critical' : 'high',
    title: `Low Stock Alert: ${inventoryItem.name}`,
    message: `Stock level for ${inventoryItem.name} is ${inventoryItem.quantity} (Min: ${inventoryItem.minStockLevel})`,
    entity_type: 'inventory',
    entity_id: inventoryItem._id,
    entity_name: inventoryItem.name,
    details: {
      current_value: inventoryItem.quantity,
      threshold_value: inventoryItem.minStockLevel,
      percentage: (inventoryItem.quantity / inventoryItem.minStockLevel) * 100,
      location: inventoryItem.location?.warehouse
    }
  });
  return alert.save();
};

alertSchema.statics.createMaintenanceDueAlert = function(asset) {
  const alert = new this({
    type: 'maintenance_due',
    severity: 'medium',
    title: `Maintenance Due: ${asset.asset_name}`,
    message: `Scheduled maintenance is due for ${asset.asset_name}`,
    entity_type: 'asset',
    entity_id: asset._id,
    entity_name: asset.asset_name,
    timestamps: {
      due_date: asset.maintenance.nextMaintenanceDue
    },
    details: {
      location: asset.location?.building,
      department: asset.assigned_to?.department
    }
  });
  return alert.save();
};

module.exports = mongoose.model('Alert', alertSchema);
