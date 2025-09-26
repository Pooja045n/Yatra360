const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SECRET = process.env.JWT_SECRET || 'yatra_secret';

/**
 * Hybrid auth middleware:
 * 1. Verifies JWT & extracts embedded claims (id, role, isAdmin)
 * 2. Fetches current user document to ensure latest role/isAdmin state
 * 3. Attaches sanitized user object to req.user
 */
module.exports = async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'No token provided' });

    let decoded;
    try {
      decoded = jwt.verify(token, SECRET);
    } catch (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'User not found' });

    // Attach merged source of truth
    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      isAdmin: user.isAdmin,
      preferences: user.preferences || {},
      profile: user.profile || {}
    };
    next();
  } catch (e) {
    console.error('Auth middleware error:', e);
    res.status(500).json({ message: 'Auth processing error' });
  }
};
