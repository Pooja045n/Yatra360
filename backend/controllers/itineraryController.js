const Itinerary = require('../models/Itinerary');

exports.createItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.create({ ...req.body, user: req.user.id });
    res.status(201).json(itinerary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserItineraries = async (req, res) => {
  try {
    const itineraries = await Itinerary.find({ user: req.user.id });
    res.json(itineraries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!itinerary) return res.status(404).json({ message: "Itinerary not found" });
    res.json(itinerary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteItinerary = async (req, res) => {
  try {
    const deleted = await Itinerary.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!deleted) return res.status(404).json({ message: "Itinerary not found" });
    res.json({ message: "Itinerary deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
