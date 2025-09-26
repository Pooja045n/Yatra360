const User = require('../models/User');
const Guide = require('../models/Guide');
const Place = require('../models/Place');
const Region = require('../models/Region');
const Festival = require('../models/Festival');
const Alert = require('../models/Alert');
const Currency = require('../models/Currency');
const mongoose = require('mongoose');

// Bootstrap: promote the first authenticated user to admin if none exists yet
// POST /api/admin/bootstrap-admin (protected)
// Security: Only succeeds if there are currently zero admin users.
exports.promoteSelfIfFirst = async (req, res) => {
  try {
    const existingAdminCount = await User.countDocuments({ isAdmin: true });
    if (existingAdminCount > 0) {
      return res.status(409).json({ message: 'An admin already exists. Bootstrap unavailable.' });
    }
    const userId = req.user.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    const updated = await User.findByIdAndUpdate(
      userId,
      { isAdmin: true, role: 'admin' },
      { new: true }
    ).select('-password');
    if (!updated) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User promoted to admin', user: { id: updated._id, email: updated.email, name: updated.name, isAdmin: updated.isAdmin, role: updated.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Dashboard Overview
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalGuides,
      pendingGuides,
      totalPlaces,
      totalRegions,
      totalFestivals,
      activeAlerts
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Guide.countDocuments({ status: 'approved' }),
      Guide.countDocuments({ status: 'pending' }),
      Place.countDocuments(),
      Region.countDocuments(),
      Festival.countDocuments(),
      Alert.countDocuments({ validUntil: { $gte: new Date() } })
    ]);

    const recentUsers = await User.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt');

    const recentGuideApplications = await Guide.find({ status: 'pending' })
      .sort({ appliedAt: -1 })
      .limit(5)
      .select('name type region status appliedAt');

    res.json({
      stats: {
        totalUsers,
        totalGuides,
        pendingGuides,
        totalPlaces,
        totalRegions,
        totalFestivals,
        activeAlerts
      },
      recentUsers,
      recentGuideApplications
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// User Management
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const query = search 
      ? { 
          role: 'user',
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        }
      : { role: 'user' };

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-password');

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isAdmin, role } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isAdmin, role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndDelete(userId);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Guide Management
exports.getAllGuideApplications = async (req, res) => {
  try {
    const { status = 'all', page = 1, limit = 10 } = req.query;
    const query = status === 'all' ? {} : { status };

    const guides = await Guide.find(query)
      .sort({ appliedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('approvedBy', 'name email');

    const total = await Guide.countDocuments(query);

    res.json({
      guides,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateGuideStatus = async (req, res) => {
  try {
    const { guideId } = req.params;
    const { status } = req.body;
    const adminId = req.user.id; // From auth middleware

    const updateData = { status };
    if (status === 'approved') {
      updateData.approvedAt = new Date();
      updateData.approvedBy = adminId;
    }

    const guide = await Guide.findByIdAndUpdate(
      guideId,
      updateData,
      { new: true }
    ).populate('approvedBy', 'name email');

    if (!guide) {
      return res.status(404).json({ error: 'Guide not found' });
    }

    res.json(guide);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Place Management
exports.getAllPlaces = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const query = search 
      ? { name: { $regex: search, $options: 'i' } }
      : {};

    const places = await Place.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('region', 'name');

    const total = await Place.countDocuments(query);

    res.json({
      places,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createPlace = async (req, res) => {
  try {
    const place = new Place(req.body);
    const savedPlace = await place.save();
    res.status(201).json(savedPlace);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updatePlace = async (req, res) => {
  try {
    const { placeId } = req.params;
    const place = await Place.findByIdAndUpdate(
      placeId,
      req.body,
      { new: true }
    );

    if (!place) {
      return res.status(404).json({ error: 'Place not found' });
    }

    res.json(place);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deletePlace = async (req, res) => {
  try {
    const { placeId } = req.params;
    await Place.findByIdAndDelete(placeId);
    res.json({ message: 'Place deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Region Management
exports.getAllRegions = async (req, res) => {
  try {
    const regions = await Region.find().sort({ name: 1 });
    res.json(regions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createRegion = async (req, res) => {
  try {
    const region = new Region(req.body);
    const savedRegion = await region.save();
    res.status(201).json(savedRegion);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Festival Management
exports.createFestival = async (req, res) => {
  try {
    const payload = { ...req.body };
    // Normalize image fields
    if (payload.image && !payload.imageUrl) payload.imageUrl = payload.image;
    if (payload.traditions && typeof payload.traditions === 'string') {
      payload.traditions = payload.traditions.split(',').map(t=>t.trim()).filter(Boolean);
    }
    if (!payload.duration) payload.duration = 1;
    const festival = new Festival(payload);
    const savedFestival = await festival.save();
    res.status(201).json(savedFestival);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateFestival = async (req, res) => {
  try {
    const { festivalId } = req.params;
    const payload = { ...req.body };
    if (payload.image && !payload.imageUrl) payload.imageUrl = payload.image;
    if (payload.traditions && typeof payload.traditions === 'string') {
      payload.traditions = payload.traditions.split(',').map(t=>t.trim()).filter(Boolean);
    }
    const festival = await Festival.findByIdAndUpdate(festivalId, payload, { new: true });

    if (!festival) {
      return res.status(404).json({ error: 'Festival not found' });
    }

    res.json(festival);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Added: delete festival (admin)
exports.deleteFestival = async (req, res) => {
  try {
    const { festivalId } = req.params;
    const existing = await Festival.findById(festivalId);
    if (!existing) {
      return res.status(404).json({ error: 'Festival not found' });
    }
    await Festival.findByIdAndDelete(festivalId);
    res.json({ message: 'Festival deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Alert Management
exports.createAlert = async (req, res) => {
  try {
    const alertData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    const alert = new Alert(alertData);
    const savedAlert = await alert.save();
    res.status(201).json(savedAlert);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllAlerts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const alerts = await Alert.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email');

    const total = await Alert.countDocuments();

    res.json({
      alerts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const alert = await Alert.findByIdAndUpdate(
      alertId,
      req.body,
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json(alert);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    await Alert.findByIdAndDelete(alertId);
    res.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Currency Management
exports.updateCurrencyRates = async (req, res) => {
  try {
    const { rates } = req.body;
    if (!rates || typeof rates !== 'object') {
      return res.status(400).json({ error: 'Missing rates object' });
    }
    const base = 'INR'; // canonical base for admin simplified view
    const updates = [];
    for (const [targetCodeRaw, rateVal] of Object.entries(rates)) {
      if (rateVal == null || isNaN(rateVal)) continue;
      const target = String(targetCodeRaw).toUpperCase();
      updates.push(
        Currency.findOneAndUpdate(
          { baseCurrency: base, targetCurrency: target },
          { baseCurrency: base, targetCurrency: target, exchangeRate: rateVal, lastUpdated: new Date(), source: 'admin' },
          { upsert: true, new: true }
        )
      );
    }
    await Promise.all(updates);
    res.json({ message: 'Currency rates updated successfully', count: updates.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCurrencyRates = async (req, res) => {
  try {
    // Return only rows with baseCurrency INR mapped to simplified shape expected by admin UI
    const base = 'INR';
    const docs = await Currency.find({ baseCurrency: base }).sort({ targetCurrency: 1 });
    const mapped = docs.map(d => ({
      _id: d._id,
      code: d.targetCurrency,
      rate: d.exchangeRate,
      lastUpdated: d.lastUpdated || d.updatedAt || d.createdAt
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
