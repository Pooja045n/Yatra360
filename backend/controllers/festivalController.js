const Festival = require('../models/Festival');

exports.getAllFestivals = async (req, res) => {
  try {
    const { region, state, month } = req.query;
    let filter = {};

    // Add filters if provided
    if (region) filter.region = new RegExp(region, 'i');
    if (state) filter.state = new RegExp(state, 'i');
    if (month) filter.month = month;

    const festivals = await Festival.find(filter);
    res.json(festivals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addFestival = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.image && !payload.imageUrl) payload.imageUrl = payload.image;
    if (payload.traditions && typeof payload.traditions === 'string') {
      payload.traditions = payload.traditions.split(',').map(t=>t.trim()).filter(Boolean);
    }
    if (!payload.duration) payload.duration = 1;
    const newFestival = new Festival(payload);
    const saved = await newFestival.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateFestival = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.image && !payload.imageUrl) payload.imageUrl = payload.image;
    if (payload.traditions && typeof payload.traditions === 'string') {
      payload.traditions = payload.traditions.split(',').map(t=>t.trim()).filter(Boolean);
    }
    const updated = await Festival.findByIdAndUpdate(req.params.id, payload, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteFestival = async (req, res) => {
  try {
    await Festival.findByIdAndDelete(req.params.id);
    res.json({ message: 'Festival deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
