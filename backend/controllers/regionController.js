const Region = require('../models/Region');

exports.getAllRegions = async (req, res) => {
  try {
    const regions = await Region.find();
    res.json(regions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addRegion = async (req, res) => {
  try {
    const region = new Region(req.body);
    const saved = await region.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteRegion = async (req, res) => {
  try {
    await Region.findByIdAndDelete(req.params.id);
    res.json({ message: 'Region deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
