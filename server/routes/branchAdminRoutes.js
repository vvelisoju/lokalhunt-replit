const express = require('express');
const branchAdminController = require('../controllers/branchAdminController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// All routes require BRANCH_ADMIN role
router.use(authenticateToken);
router.use(requireRole('BRANCH_ADMIN'));

// =======================
// DASHBOARD AND STATS (NEW)
// =======================

// Get branch admin stats for dashboard
router.get('/stats', branchAdminController.getStats);

// Get quick actions for dashboard
router.get('/quick-actions', branchAdminController.getQuickActions);

// =======================
// PROFILE MANAGEMENT (NEW)
// =======================

// Get branch admin profile
router.get('/profile', branchAdminController.getProfile);

// Update branch admin profile
router.put('/profile', branchAdminController.updateProfile);

// Update branch admin password
router.put('/profile/password', branchAdminController.updatePassword);

// Get performance metrics
router.get('/performance', branchAdminController.getPerformance);

// =======================
// AD MANAGEMENT (ENHANCED)
// =======================

// Get ads with filters (for branch admin dashboard)
router.get('/ads', branchAdminController.getAds);

// Approve ad
router.post('/ads/:adId/approve', branchAdminController.approveAd);

// Reject ad  
router.post('/ads/:adId/reject', branchAdminController.rejectAd);

// =======================
// EMPLOYER MANAGEMENT (NEW)
// =======================

// Get employers with pagination
router.get('/employers', branchAdminController.getEmployers);

// Create new employer
router.post('/employers', branchAdminController.createEmployer);

// Get specific employer details
router.get('/employers/:employerId', branchAdminController.getEmployerDetails);

// Update employer
router.put('/employers/:employerId', branchAdminController.updateEmployer);

// Delete employer
router.delete('/employers/:employerId', branchAdminController.deleteEmployer);

// Get employer's companies
router.get('/employers/:employerId/companies', branchAdminController.getEmployerCompanies);

// Create company for employer
router.post('/employers/:employerId/companies', branchAdminController.createEmployerCompany);

// Update company for employer
router.put('/employers/:employerId/companies/:companyId', branchAdminController.updateEmployerCompany);

// Get employer's ads
router.get('/employers/:employerId/ads', branchAdminController.getEmployerAds);

// Create ad for employer
router.post('/employers/:employerId/ads', branchAdminController.createEmployerAd);

// Update ad for employer
router.put('/employers/:employerId/ads/:adId', branchAdminController.updateEmployerAd);

// Submit ad for approval
router.post('/employers/:employerId/ads/:adId/submit', branchAdminController.submitEmployerAdForApproval);

// =======================
// CANDIDATE SCREENING (NEW)  
// =======================

// Get candidates for screening
router.get('/screening/candidates', branchAdminController.getScreeningCandidates);

// =======================
// MOU MANAGEMENT (NEW)
// =======================

// Get all MOUs
router.get('/mous', branchAdminController.getMous);

// =======================
// REPORTING (NEW)
// =======================

// Get report statistics
router.get('/reports/statistics', branchAdminController.getReportsStatistics);

// =======================
// ACTIVITY LOGS (NEW)
// =======================

// Get activity logs
router.get('/activity-logs', branchAdminController.getActivityLogs);

// Get pending ads for approval (EXISTING)
router.get('/ads/pending', branchAdminController.getPendingAds);

// Get specific ad details (NEW)
router.get('/ads/:adId', branchAdminController.getAd);

// Review ad (approve/reject) (EXISTING)
router.put('/ads/:adId/review', branchAdminController.reviewAd);

// =======================
// APPLICATION MANAGEMENT (ENHANCED)
// =======================

// List all allocations with filters (ENHANCED from existing)
router.get('/applications', branchAdminController.getApplications);

// Get specific allocation details (NEW)
router.get('/applications/:allocationId', branchAdminController.getApplication);

// Screen candidate (EXISTING)
router.put('/applications/:allocationId/screen', branchAdminController.screenCandidate);

// Approve/allocate candidate (NEW)
router.put('/applications/:allocationId/allocate', branchAdminController.allocateCandidate);

// =======================
// MOU MANAGEMENT (EXISTING)
// =======================

// Create MOU (EXISTING)
router.post('/mous', branchAdminController.createMOU);

// Update MOU (NEW)
router.put('/mous/:mouId', branchAdminController.updateMOU);

// =======================
// CITY MANAGEMENT (EXISTING)
// =======================

// Get city statistics (EXISTING)
router.get('/city/stats', branchAdminController.getCityStats);

// Get city employers (EXISTING)
router.get('/city/employers', branchAdminController.getCityEmployers);

module.exports = router;