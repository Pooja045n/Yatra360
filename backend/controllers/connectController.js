const Connect = require('../models/Connect');

// Get all users for connection
exports.getAllUsers = async (req, res) => {
  try {
    const { location, interests, travelStyle } = req.query;
    let filter = { isActive: true };

    // Add filters if provided
    if (location) filter.location = new RegExp(location, 'i');
    if (interests) filter.interests = { $in: interests.split(',') };
    if (travelStyle) filter.travelStyle = travelStyle;

    const users = await Connect.find(filter)
      .populate('connections', 'name email location')
      .select('-email -phone') // Hide sensitive info in public listing
      .limit(50);

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get user profile by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await Connect.findById(req.params.id)
      .populate('connections', 'name location profilePicture')
      .select('-email -phone'); // Hide sensitive info

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create user profile
exports.createProfile = async (req, res) => {
  try {
    const profile = new Connect(req.body);
    const savedProfile = await profile.save();
    res.status(201).json(savedProfile);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const updatedProfile = await Connect.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedProfile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(updatedProfile);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Connect with another user
exports.connectWithUser = async (req, res) => {
  try {
    const { userId, targetUserId } = req.body;

    // Add connection both ways
    await Connect.findByIdAndUpdate(userId, {
      $addToSet: { connections: targetUserId }
    });

    await Connect.findByIdAndUpdate(targetUserId, {
      $addToSet: { connections: userId }
    });

    res.json({ message: 'Connection established successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get user's connections
exports.getUserConnections = async (req, res) => {
  try {
    const user = await Connect.findById(req.params.id)
      .populate('connections', 'name location profilePicture interests travelStyle');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.connections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
