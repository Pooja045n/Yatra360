const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'guide'],
    default: 'user'
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  preferences: {
    language: String,
    interests: [String],
    budget: Number
  },
  profile: {
    avatar: String,
    bio: String,
    phone: String,
    location: String
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
