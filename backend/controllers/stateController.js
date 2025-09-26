const State = require('../models/State');

exports.getAllStates = async (req, res) => {
  try {
    const states = await State.find();
    res.json(states);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStateById = async (req, res) => {
  try {
    const state = await State.findById(req.params.id);
    if (!state) return res.status(404).json({ message: 'State not found' });
    res.json(state);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addState = async (req, res) => {
  try {
    const newState = new State(req.body);
    const saved = await newState.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateState = async (req, res) => {
  try {
    const updated = await State.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteState = async (req, res) => {
  try {
    await State.findByIdAndDelete(req.params.id);
    res.json({ message: 'State deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
