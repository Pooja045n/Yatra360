const mongoose = require('mongoose');

const stateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  region: { type: String, required: true },
  capital: { type: String, required: true },
  popularCities: [{ type: String }],
  shortDescription: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('State', stateSchema);
