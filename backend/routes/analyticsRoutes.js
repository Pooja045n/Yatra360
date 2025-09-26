const express = require('express');
const router = express.Router();
const analytics = require('../controllers/analyticsController');
const protect = require('../middleware/authMiddleware');

router.post('/', protect, analytics.record);
router.get('/summary', protect, analytics.summary);

module.exports = router;
