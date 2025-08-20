
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticateToken } = require('../middleware/auth');

// All profile routes require authentication
router.use(authenticateToken);

// Get current user profile
router.get('/', profileController.getProfile);

// Update profile
router.put('/', profileController.updateProfile);

// Update password
router.put('/password', profileController.updatePassword);

// Delete profile (soft delete)
router.delete('/', profileController.deleteProfile);

module.exports = router;
