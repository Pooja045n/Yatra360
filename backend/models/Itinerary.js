const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: String,
  destinations: [String], // e.g., ["Goa", "Hampi"]
  startDate: Date,
  endDate: Date,
  budget: Number,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Itinerary', itinerarySchema);
