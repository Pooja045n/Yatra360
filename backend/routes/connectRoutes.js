const express = require('express');
const router = express.Router();
const connectController = require('../controllers/connectController');

// Get all users for connection (with filters)
router.get('/', connectController.getAllUsers);

// Get user profile by ID
router.get('/:id', connectController.getUserById);

// Get user's connections
router.get('/:id/connections', connectController.getUserConnections);

// Create user profile
router.post('/', connectController.createProfile);

// Update user profile
router.put('/:id', connectController.updateProfile);

// Connect with another user
router.post('/connect', connectController.connectWithUser);

module.exports = router;
