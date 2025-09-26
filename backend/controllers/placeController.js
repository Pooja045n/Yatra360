const Place = require('../models/Place');

// Get all places
exports.getAllPlaces = async (req, res) => {
  try {
    const { state, category, search, limit = 50 } = req.query;
    let filter = {};

    // Add filters if provided
    if (state) filter.state = new RegExp(state, 'i');
    if (category) filter.category = new RegExp(category, 'i');
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { location: new RegExp(search, 'i') }
      ];
    }

    const places = await Place.find(filter).limit(parseInt(limit));
    res.json(places);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single place by ID
exports.getPlaceById = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) {
      return res.status(404).json({ error: 'Place not found' });
    }
    res.json(place);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add a new place
exports.addPlace = async (req, res) => {
  try {
    const newPlace = new Place(req.body);
    const savedPlace = await newPlace.save();
    res.status(201).json(savedPlace);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update a place
exports.updatePlace = async (req, res) => {
  try {
    const updatedPlace = await Place.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedPlace);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a place
exports.deletePlace = async (req, res) => {
  try {
    await Place.findByIdAndDelete(req.params.id);
    res.json({ message: 'Place deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
