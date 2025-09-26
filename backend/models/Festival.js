const mongoose = require('mongoose');

const festivalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  // legacy fields
  state: { type: String },
  description: { type: String },
  date: { type: String }, // for fixed festivals like 15-Aug, or "March-April" for variable ones
  imageUrl: { type: String },
  // extended admin fields
  region: { type: String },
  month: { type: String },
  duration: { type: Number, default: 1 },
  significance: { type: String },
  traditions: { type: [String], default: [] },
  image: { type: String } // alias used by admin form; can fall back to imageUrl
}, { timestamps: true });

// Virtual to keep backward compatibility: prefer image field, fallback to imageUrl
festivalSchema.virtual('displayImage').get(function(){
  return this.image || this.imageUrl || '';
});

module.exports = mongoose.model('Festival', festivalSchema);
