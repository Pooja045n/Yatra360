const mongoose = require('mongoose');

// Tracks user interactions with items (places, festivals, guides, etc.)
// Used for recommendations (content-based and collaborative signals)
const interactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  itemType: { type: String, enum: ['place', 'festival', 'guide'], required: true, index: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  action: { type: String, enum: ['view', 'like', 'bookmark', 'rate'], required: true, index: true },
  value: { type: Number, min: 0, max: 5 }, // for ratings or strength
  metadata: { type: Object },
  createdAt: { type: Date, default: Date.now }
});

interactionSchema.index({ itemType: 1, itemId: 1 });
interactionSchema.index({ userId: 1, itemType: 1 });
interactionSchema.index({ userId: 1, itemId: 1, action: 1 });

module.exports = mongoose.model('Interaction', interactionSchema);
