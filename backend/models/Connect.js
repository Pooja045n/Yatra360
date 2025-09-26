const mongoose = require('mongoose');

const connectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  location: { type: String },
  interests: [{ type: String }], // Travel interests
  travelStyle: { type: String, enum: ['Budget', 'Luxury', 'Adventure', 'Cultural', 'Family'] },
  languages: [{ type: String }],
  bio: { type: String },
  profilePicture: { type: String },
  isActive: { type: Boolean, default: true },
  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Connect' }],
  socialMedia: {
    instagram: { type: String },
    facebook: { type: String },
    twitter: { type: String }
  }
}, { timestamps: true });

module.exports = mongoose.model('Connect', connectSchema);
