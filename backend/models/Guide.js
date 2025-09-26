const mongoose = require('mongoose');

const guideSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['Physical', 'Virtual'], default: 'Physical' },
  region: { type: String, required: true },
  city: { type: String, required: true },
  location: { type: String }, // Keep for backward compatibility
  specializations: [{ type: String }],
  languages: [{ type: String }],
  experience: { type: String, default: '1 year' },
  rating: { type: Number, default: 4.0, min: 1, max: 5 },
  contact: { type: String },
  email: { type: String },
  price: { type: String },
  profileImage: { type: String },
  description: { type: String },
  available: { type: Boolean, default: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  appliedAt: { type: Date, default: Date.now },
  approvedAt: { type: Date },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  documents: {
    certificate: String,
    idProof: String,
    experience: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Guide', guideSchema);
