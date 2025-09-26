const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware to check admin access
const adminOnly = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// One-time bootstrap route: promote first authenticated user to admin if no admin exists yet
router.post('/bootstrap-admin', authMiddleware, adminController.promoteSelfIfFirst);

// Dashboard
router.get('/dashboard', authMiddleware, adminOnly, adminController.getDashboardStats);

// User Management
router.get('/users', authMiddleware, adminOnly, adminController.getAllUsers);
router.put('/users/:userId', authMiddleware, adminOnly, adminController.updateUserStatus);
router.delete('/users/:userId', authMiddleware, adminOnly, adminController.deleteUser);

// Guide Management
router.get('/guides', authMiddleware, adminOnly, adminController.getAllGuideApplications);
router.put('/guides/:guideId/status', authMiddleware, adminOnly, adminController.updateGuideStatus);

// Place Management
router.get('/places', authMiddleware, adminOnly, adminController.getAllPlaces);
router.post('/places', authMiddleware, adminOnly, adminController.createPlace);
router.put('/places/:placeId', authMiddleware, adminOnly, adminController.updatePlace);
router.delete('/places/:placeId', authMiddleware, adminOnly, adminController.deletePlace);

// Region Management
router.get('/regions', authMiddleware, adminOnly, adminController.getAllRegions);
router.post('/regions', authMiddleware, adminOnly, adminController.createRegion);

// Festival Management
router.post('/festivals', authMiddleware, adminOnly, adminController.createFestival);
router.put('/festivals/:festivalId', authMiddleware, adminOnly, adminController.updateFestival);
router.delete('/festivals/:festivalId', authMiddleware, adminOnly, adminController.deleteFestival);

// Alert Management
router.get('/alerts', authMiddleware, adminOnly, adminController.getAllAlerts);
router.post('/alerts', authMiddleware, adminOnly, adminController.createAlert);
router.put('/alerts/:alertId', authMiddleware, adminOnly, adminController.updateAlert);
router.delete('/alerts/:alertId', authMiddleware, adminOnly, adminController.deleteAlert);

// Currency Management
router.get('/currency', authMiddleware, adminOnly, adminController.getCurrencyRates);
router.put('/currency', authMiddleware, adminOnly, adminController.updateCurrencyRates);

module.exports = router;
