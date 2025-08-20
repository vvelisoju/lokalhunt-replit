
const express = require('express');
const router = express.Router();
const { generateJobDescription } = require('../controllers/aiController');
const { authenticateToken } = require('../middleware/auth');

// Generate job description using AI
router.post('/generate-job-description', authenticateToken, generateJobDescription);

module.exports = router;
