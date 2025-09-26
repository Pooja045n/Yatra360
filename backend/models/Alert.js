const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  region: { type: String }, // optional: North, South, or state name
  severity: { type: String, enum: ['info', 'warning', 'danger'], default: 'info' },
  expiresOn: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);
