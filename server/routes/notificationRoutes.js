
const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

// Add middleware with proper error handling
router.use((req, res, next) => {
  console.log(`Notification route accessed: ${req.method} ${req.path}`);
  next();
});

// All routes require authentication
router.use(authenticateToken);

// =======================
// PUSH NOTIFICATION MANAGEMENT (Admin/Employer)
// =======================

// Send push notification to specific user (Admin/Employer only)
router.post('/push/user/:userId', requireRole(['ADMIN', 'BRANCH_ADMIN', 'EMPLOYER']), notificationController.sendPushToUser);

// Send push notification to multiple users (Admin only)
router.post('/push/multiple', requireRole(['ADMIN', 'BRANCH_ADMIN']), notificationController.sendPushToMultipleUsers);

// Test push notification (Any authenticated user)
router.post('/push/test', notificationController.testPushNotification);

// =======================
// USER NOTIFICATION MANAGEMENT
// =======================

// Get user's notifications
router.get('/', notificationController.getNotifications);

// Mark notification as read
router.patch('/:notificationId/read', notificationController.markNotificationAsRead);

// Mark all notifications as read
router.patch('/read-all', notificationController.markAllNotificationsAsRead);

// Delete notification
router.delete('/:notificationId', notificationController.deleteNotification);

// Notification preferences
router.get('/preferences', notificationController.getNotificationPreferences);
router.put('/preferences', notificationController.updateNotificationPreferences);

module.exports = router;
