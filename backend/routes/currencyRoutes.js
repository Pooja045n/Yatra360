const express = require('express');
const router = express.Router();
const currencyController = require('../controllers/currencyController');

// Get all currency rates (with filters)
router.get('/', currencyController.getAllRates);

// Get popular currency pairs
router.get('/popular', currencyController.getPopularPairs);

// Convert currency
router.get('/convert', currencyController.convertCurrency);

// Get specific currency rate
router.get('/:from/:to', currencyController.getRate);

// Add or update currency rate
router.post('/', currencyController.updateRate);

// Initialize common currency rates
router.post('/initialize', currencyController.initializeRates);

module.exports = router;
