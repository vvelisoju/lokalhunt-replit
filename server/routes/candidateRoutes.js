const express = require('express');
const multer = require('multer');
const { authenticateToken, requireRole } = require('../middleware/auth');
const candidateController = require('../controllers/candidateController');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

const router = express.Router();

// All routes require CANDIDATE role
router.use(authenticateToken);
router.use(requireRole('CANDIDATE'));

// =======================
// PROFILE MANAGEMENT
// =======================

// Get complete candidate profile (READ)
router.get('/profile', candidateController.getProfile);

// Update candidate profile (UPDATE)
router.put('/profile', candidateController.updateProfile);

// Update specific profile sections
router.patch('/profile/basic', candidateController.updateBasicInfo);
router.patch('/profile/experience', candidateController.updateExperience);
router.patch('/profile/education', candidateController.updateEducation);
router.patch('/profile/skills', candidateController.updateSkills);

// Onboarding management
router.post('/onboarding', candidateController.saveOnboardingData);
router.get('/onboarding', candidateController.getOnboardingData);

// Open to Work status management
router.patch('/profile/open-to-work', candidateController.updateOpenToWorkStatus);
router.get('/profile/open-to-work', candidateController.getOpenToWorkStatus);

// Profile photo management
router.post('/profile/photo', upload.single('profilePhoto'), candidateController.uploadProfilePhoto);
router.delete('/profile/photo', candidateController.removeProfilePhoto);

// File upload routes
router.get('/upload-url', candidateController.getUploadUrl);
router.get('/profile-image-upload-url', candidateController.getProfileImageUploadUrl);
router.get('/cover-image-upload-url', candidateController.getCoverImageUploadUrl);
router.post('/resume/upload', candidateController.uploadResume);
router.get('/resume', candidateController.getResume);
router.delete('/resume', candidateController.deleteResume);
router.patch('/resume/status', candidateController.updateResumeStatus);

// =======================
// RESUME MANAGEMENT
// =======================

// Upload and manage resume
router.post('/resume', candidateController.uploadResume);
router.get('/resume', (req, res, next) => {
  console.log('GET /resume called for user:', req.user?.userId);
  candidateController.getResume(req, res, next);
});
router.delete('/resume', candidateController.deleteResume);

// Resume history (previous versions)
router.get('/resume/history', candidateController.getResumeHistory);

// =======================
// DASHBOARD & ANALYTICS
// =======================

// Main dashboard with stats and overview
router.get('/dashboard', candidateController.getDashboard);

// Dashboard statistics
router.get('/dashboard/stats', candidateController.getDashboardStats);

// Profile completeness and recommendations
router.get('/profile/completeness', candidateController.getProfileCompleteness);

// Activity timeline/feed
router.get('/activity', candidateController.getActivityFeed);

// =======================
// JOB APPLICATIONS
// =======================

// Apply to job
router.post('/applications', candidateController.applyToJob);
// Apply to job by ad ID (alternative endpoint)
router.post('/applications/:adId', candidateController.applyToJob);

// Get all applications with filters
router.get('/applications', candidateController.getApplications);

// Get single application details
router.get('/applications/:applicationId', candidateController.getApplication);

// Withdraw application
router.delete('/applications/:applicationId', candidateController.withdrawApplication);

// Update application notes
router.patch('/applications/:applicationId/notes', candidateController.updateApplicationNotes);

// =======================
// BOOKMARKS/SAVED JOBS
// =======================

// Add/remove bookmark (toggle)
router.post('/bookmarks/:adId', candidateController.toggleBookmark);

// Get all bookmarks
router.get('/bookmarks', candidateController.getBookmarks);

// Remove specific bookmark
router.delete('/bookmarks/:adId', candidateController.removeBookmark);

// Clear all bookmarks
router.delete('/bookmarks', candidateController.clearAllBookmarks);

// =======================
// JOB SEARCH & DISCOVERY
// =======================

// Search jobs with candidate-specific status (bookmark/application status)
router.get('/jobs/search', candidateController.searchJobsWithStatus);

// Get recommended jobs based on profile
router.get('/jobs/recommended', candidateController.getRecommendedJobs);

// Get jobs by skill match
router.get('/jobs/matches', candidateController.getJobMatches);

// Recently viewed jobs
router.get('/jobs/recent', candidateController.getRecentlyViewedJobs);

// Mark job as viewed
router.post('/jobs/:adId/view', candidateController.markJobAsViewed);

// =======================
// RATINGS & FEEDBACK
// =======================

// Get candidate ratings and feedback
router.get('/ratings', candidateController.getRatings);

// Get rating history for specific skill
router.get('/ratings/:skill/history', candidateController.getSkillRatingHistory);

// =======================
// NOTIFICATIONS & ALERTS
// =======================

// Get notifications
router.get('/notifications', candidateController.getNotifications);

// Mark notification as read
router.patch('/notifications/:notificationId/read', candidateController.markNotificationAsRead);

// Mark all notifications as read
router.patch('/notifications/read-all', candidateController.markAllNotificationsAsRead);

// Delete notification
router.delete('/notifications/:notificationId', candidateController.deleteNotification);

// Notification preferences
router.get('/notifications/preferences', candidateController.getNotificationPreferences);
router.put('/notifications/preferences', candidateController.updateNotificationPreferences);

// =======================
// ACCOUNT & SETTINGS
// =======================

// Account settings
router.get('/settings', candidateController.getAccountSettings);
router.put('/settings', candidateController.updateAccountSettings);

// Privacy settings
router.get('/privacy', candidateController.getPrivacySettings);
router.put('/privacy', candidateController.updatePrivacySettings);

// Change password
router.post('/password/change', candidateController.changePassword);

// Deactivate account
router.post('/account/deactivate', candidateController.deactivateAccount);

// =======================
// STATISTICS & INSIGHTS
// =======================

// Application statistics
router.get('/stats/applications', candidateController.getApplicationStats);

// Profile views and visibility stats
router.get('/stats/profile-views', candidateController.getProfileViews);

// Job market insights for candidate's skills
router.get('/insights/market', candidateController.getMarketInsights);

// =======================
// LEGACY ROUTES (keeping for backward compatibility)
// =======================

// Legacy apply route (deprecated - use POST /applications instead)
router.post('/apply/:adId', candidateController.applyToJobLegacy);

// Legacy bookmark route (deprecated - use POST /bookmarks/:adId instead)
router.post('/bookmark/:adId', candidateController.toggleBookmark);

// Object storage upload endpoints
router.post('/upload-url', candidateController.getUploadUrl);
router.put('/profile-photo', candidateController.updateProfilePhoto);
router.put('/cover-photo', candidateController.updateCoverPhoto);

module.exports = router;