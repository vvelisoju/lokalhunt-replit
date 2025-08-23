const express = require("express");
const branchAdminController = require("../controllers/branchAdminController");
const { authenticateToken, requireRole } = require("../middleware/auth");
const employerController = require("../controllers/employerController");

const router = express.Router();

// All routes require BRANCH_ADMIN role
router.use(authenticateToken);
router.use(requireRole("BRANCH_ADMIN"));

// =======================
// DASHBOARD AND STATS
// =======================

// Get branch admin stats for dashboard
router.get("/stats", branchAdminController.getStats);

// Get quick actions for dashboard
router.get("/quick-actions", branchAdminController.getQuickActions);

// =======================
// PROFILE MANAGEMENT
// =======================

// Get branch admin profile
router.get("/profile", branchAdminController.getProfile);

// Update branch admin profile
router.put("/profile", branchAdminController.updateProfile);

// Update branch admin password
router.put("/profile/password", branchAdminController.updatePassword);

// Get performance metrics
router.get("/performance", branchAdminController.getPerformance);

// =======================
// AD MANAGEMENT
// =======================

// Get ads with filters (for branch admin dashboard)
router.get("/ads", branchAdminController.getAds);

// Get pending ads for approval
router.get("/ads/pending", branchAdminController.getPendingAds);

// Get specific ad details
router.get("/ads/:adId", branchAdminController.getAd);

// Approve ad
router.post("/ads/:adId/approve", branchAdminController.approveAd);

// Reject ad
router.post("/ads/:adId/reject", branchAdminController.rejectAd);

// Review ad (approve/reject)
router.put("/ads/:adId/review", branchAdminController.reviewAd);

// =======================
// EMPLOYER MANAGEMENT
// =======================

// Get employers with pagination
router.get("/employers", branchAdminController.getEmployers);

// Create new employer
router.post("/employers", branchAdminController.createEmployer);

// Get specific employer details - using getEmployerDetails method
router.get("/employers/:employerId", branchAdminController.getEmployerDetails);

// Update employer
router.put("/employers/:employerId", branchAdminController.updateEmployer);

// Delete employer
router.delete("/employers/:employerId", branchAdminController.deleteEmployer);

// =======================
// APPLICATION MANAGEMENT
// =======================

// List all allocations with filters
router.get("/applications", branchAdminController.getApplications);

// Get specific allocation details
router.get("/applications/:allocationId", branchAdminController.getApplication);

// Screen candidate
router.put(
  "/applications/:allocationId/screen",
  branchAdminController.screenCandidate,
);

// Approve/allocate candidate
router.put(
  "/applications/:allocationId/allocate",
  branchAdminController.allocateCandidate,
);

// =======================
// CANDIDATE SCREENING
// =======================

// Get candidates for screening
router.get(
  "/screening/candidates",
  branchAdminController.getScreeningCandidates,
);

// =======================
// MOU MANAGEMENT (COMMENTED OUT - NOT IN USE)
// =======================

/* 
// Get all MOUs
router.get("/mous", branchAdminController.getMous);

// Create MOU
router.post("/mous", branchAdminController.createMOU);

// Update MOU
router.put("/mous/:mouId", branchAdminController.updateMOU);
*/

// =======================
// REPORTING
// =======================

// Get report statistics
router.get("/reports/statistics", branchAdminController.getReportsStatistics);

// =======================
// ACTIVITY LOGS
// =======================

// Get activity logs
router.get("/logs", branchAdminController.getActivityLogs);

// Get subscription plans (for filtering)
router.get("/subscription-plans", branchAdminController.getSubscriptionPlans);

module.exports = router;
