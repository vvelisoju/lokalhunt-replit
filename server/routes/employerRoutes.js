const express = require('express');
const employerController = require('../controllers/employerController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// All routes require EMPLOYER role
router.use(authenticateToken);
router.use(requireRole('EMPLOYER'));

// =======================
// PROFILE MANAGEMENT
// =======================

// Get employer profile (NEW)
router.get('/profile', employerController.getProfile);

// Update employer profile (EXISTING)
router.put('/profile', employerController.updateProfile);

// =======================
// COMPANY MANAGEMENT
// =======================

// Get all companies (EXISTING)
router.get('/companies', employerController.getCompanies);

// Get specific company details (NEW)
router.get('/companies/:companyId', employerController.getCompany);

// Create company (EXISTING)
router.post('/companies', employerController.createCompany);

// Update company (EXISTING)
router.put('/companies/:companyId', employerController.updateCompany);

// =======================
// AD MANAGEMENT
// =======================

// Get all ads (EXISTING)
router.get('/ads', employerController.getAds);

// Get specific ad details (NEW)
router.get('/ads/:adId', employerController.getAd);

// Create ad (EXISTING)
router.post('/ads', employerController.createAd);

// Update ad (NEW)
router.put('/ads/:adId', employerController.updateAd);

// Submit ad for approval (NEW)
router.patch('/ads/:adId/submit', employerController.submitForApproval);

// Archive ad (NEW)
router.patch('/ads/:adId/archive', employerController.archiveAd);

// Get allocated candidates for an ad (EXISTING)
router.get('/ads/:adId/candidates', employerController.getAllocatedCandidates);

// =======================
// MOU MANAGEMENT (NEW)
// =======================

// Get all MOU agreements
router.get('/mous', employerController.getMOUs);

// Create/sign new MOU agreement
router.post('/mous', employerController.createMOU);

// =======================
// CANDIDATE SEARCH & MANAGEMENT (NEW)
// =======================

// Get all candidates for the employer
router.get('/candidates', employerController.getAllCandidates);

// Search candidates by skills, city, and experience
router.get('/candidates/search', employerController.searchCandidates);

// Bookmark a candidate
router.post('/candidates/:candidateId/bookmark', employerController.bookmarkCandidate);

// Remove candidate bookmark
router.delete('/candidates/:candidateId/bookmark', employerController.removeBookmark);

// Get bookmarked candidates
router.get('/candidates/bookmarks', employerController.getBookmarkedCandidates);

// =======================
// LEGACY CANDIDATE MANAGEMENT (EXISTING)
// =======================

// Update candidate status in allocation
router.put('/candidates/:allocationId/status', employerController.updateCandidateStatus);

module.exports = router;