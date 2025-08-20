const express = require('express');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Authentication routes
router.post('/register', authController.register);
router.post('/login', authController.login);
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