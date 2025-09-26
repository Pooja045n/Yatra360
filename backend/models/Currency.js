const mongoose = require('mongoose');

const currencySchema = new mongoose.Schema({
  baseCurrency: { type: String, required: true, default: 'INR' },
  targetCurrency: { type: String, required: true },
  exchangeRate: { type: Number, required: true },
  lastUpdated: { type: Date, default: Date.now },
  source: { type: String, default: 'manual' } 
}, { timestamps: true });

currencySchema.index({ baseCurrency: 1, targetCurrency: 1 });

module.exports = mongoose.model('Currency', currencySchema);
