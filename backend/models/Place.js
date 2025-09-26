const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  state: { type: String, required: true },
  location: { type: String }, // City/Region within the state
  description: { type: String },
  imageUrl: { type: String },
  category: { type: String }, // e.g., "Heritage", "Nature", "Spiritual"
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  latitude: { type: Number }, // For compatibility with frontend
  longitude: { type: Number }, // For compatibility with frontend
  accommodations: [{ type: String }], // Array of nearby hotels/accommodations
  foods: [{ type: String }], // Array of local foods to try
  transport: [{ type: String }] // Array of transport options
}, { timestamps: true });

module.exports = mongoose.model('Place', placeSchema);
