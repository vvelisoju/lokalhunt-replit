const express = require('express');
const authRoutes = require('./authRoutes');
const candidateRoutes = require('./candidateRoutes');
const employerRoutes = require('./employerRoutes');
const branchAdminRoutes = require('./branchAdminRoutes');
const adRoutes = require('./adRoutes');
const publicRoutes = require('./publicRoutes');
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
      health: '/health'
    }
  }));
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/ads', adRoutes);
router.use('/candidate', candidateRoutes);
router.use('/employer', employerRoutes);
router.use('/branch-admin', branchAdminRoutes);
router.use('/public', publicRoutes);

module.exports = router;
