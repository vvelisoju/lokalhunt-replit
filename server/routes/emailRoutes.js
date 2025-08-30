const express = require('express');
const router = express.Router();
const {
  handleSendEmail,
  handleCreateTemplate,
  handleGetTemplates,
  handleGetTemplateByType,
  handleSendOTP,
  handleVerifyOTP
} = require('../controllers/emailController');
const { authenticateToken } = require('../middleware/auth');

// Send email
router.post('/send', authenticateToken, handleSendEmail);

// OTP functionality
router.post('/send-otp', authenticateToken, handleSendOTP);
router.post('/verify-otp', authenticateToken, handleVerifyOTP);

// Template management
router.post('/templates', authenticateToken, handleCreateTemplate);
router.get('/templates', authenticateToken, handleGetTemplates);
router.get('/templates/:type', authenticateToken, handleGetTemplateByType);

module.exports = router;