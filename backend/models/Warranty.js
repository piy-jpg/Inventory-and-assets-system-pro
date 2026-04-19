const mongoose = require('mongoose');

const warrantySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  duration: { type: Number, required: true },
  duration_type: { type: String, enum: ['days', 'months', 'years'], default: 'months' },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Warranty', warrantySchema);
