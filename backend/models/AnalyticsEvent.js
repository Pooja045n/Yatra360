const mongoose = require('mongoose');

const AnalyticsEventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  sessionId: { type: String, required: false },
  eventType: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed },
  context: { type: String },
  createdAt: { type: Date, default: Date.now }
});

AnalyticsEventSchema.index({ eventType: 1, createdAt: -1 });
AnalyticsEventSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('AnalyticsEvent', AnalyticsEventSchema);
