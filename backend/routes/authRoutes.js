const express = require('express');
const router = express.Router();
const { registerUser, loginUser, forgotPassword, resetPassword, getMe } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Authenticated debug route to inspect current token-derived user
router.get('/me', authMiddleware, getMe);

module.exports = router;
