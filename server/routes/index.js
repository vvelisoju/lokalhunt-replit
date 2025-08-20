const express = require('express');
const authRoutes = require('./authRoutes');
const candidateRoutes = require('./candidateRoutes');
const employerRoutes = require('./employerRoutes');
const branchAdminRoutes = require('./branchAdminRoutes');
const adRoutes = require('./adRoutes');
const publicRoutes = require('./publicRoutes');
const sharedRoutes = require('./sharedRoutes');
const aiRoutes = require('./aiRoutes');
const profileRoutes = require('./profileRoutes');
const { createResponse } = require('../utils/response');

const router = express.Router();

// API Info endpoint
router.get('/', (req, res) => {
  res.json(createResponse('Lokalhunt API is running', {
    version: process.env.API_VERSION || 'v1',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    platform: 'Lokalhunt - Your city, your career',
    endpoints: {
      auth: '/api/auth',
      ads: '/api/ads',
      candidate: '/api/candidate',
      employer: '/api/employer',
      branchAdmin: '/api/branch-admin',
      profile: '/api/profile',
      health: '/health',
      ai: '/api/ai'
    }
  }));
});

// Routes
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/candidate', candidateRoutes);
router.use('/employer', employerRoutes);
router.use('/branch-admin', branchAdminRoutes);
router.use('/ads', adRoutes);
router.use('/public', publicRoutes);
router.use('/shared', sharedRoutes);
router.use('/ai', aiRoutes);

module.exports = router;