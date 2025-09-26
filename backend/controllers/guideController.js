const Guide = require('../models/Guide');

exports.getAllGuides = async (req, res) => {
  try {
    const guides = await Guide.find();
    res.json(guides);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addGuide = async (req, res) => {
  try {
    const newGuide = new Guide(req.body);
    const savedGuide = await newGuide.save();
    res.status(201).json(savedGuide);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateGuide = async (req, res) => {
  try {
    const updatedGuide = await Guide.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedGuide);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteGuide = async (req, res) => {
  try {
    await Guide.findByIdAndDelete(req.params.id);
    res.json({ message: 'Guide deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
