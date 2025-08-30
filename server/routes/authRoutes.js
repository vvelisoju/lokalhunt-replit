const express = require('express');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Authentication routes
router.post('/register', authController.register);
router.post('/verify-otp', authController.verifyOTPAndCompleteRegistration);
router.post('/resend-otp', authController.resendOTP);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPasswordWithOTP);
// Get user profile
router.get('/profile', authenticateToken, authController.getProfile)

// Logout user (for JWT, this is mainly for consistency)
router.post('/logout', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Logged out successfully' 
  })
})

module.exports = router