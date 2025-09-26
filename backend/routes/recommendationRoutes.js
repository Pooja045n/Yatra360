const express = require('express');
const router = express.Router();
const rec = require('../controllers/recommendationController');
const protect = require('../middleware/authMiddleware');

// Record interaction
router.post('/interactions', protect, rec.recordInteraction);

// Content-based recommendations
router.get('/content', protect, rec.contentBased);

// Collaborative recommendations
router.get('/collaborative', protect, rec.collaborative);

// Hybrid recommendations
router.get('/hybrid', protect, rec.hybrid);

module.exports = router;
