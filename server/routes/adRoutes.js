const express = require('express');
const adController = require('../controllers/adController');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Public routes (with optional authentication for bookmarks/application status)
router.get('/', optionalAuth, adController.getAds);
router.get('/categories', adController.getCategories);
router.get('/cities', adController.getCities);
router.get('/search/suggestions', adController.getSearchSuggestions);
router.get('/:adId', optionalAuth, adController.getAdById);
router.get('/:adId/similar', adController.getSimilarAds);

module.exports = router;