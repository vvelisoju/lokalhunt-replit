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

// Detailed test with more logging
router.post('/push/test-detailed', authenticateToken, async (req, res, next) => {
  try {
    console.log('🔍 Starting detailed push notification test...');
    console.log('User ID:', req.user.userId);

    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    // Get user with device token
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { 
        id: true,
        firstName: true, 
        lastName: true,
        name: true,
        deviceToken: true,
        platform: true
      }
    });

    console.log('🔍 User found:', {
      id: user?.id,
      name: user?.firstName || user?.name,
      hasDeviceToken: !!user?.deviceToken,
      platform: user?.platform,
      tokenPreview: user?.deviceToken ? `${user.deviceToken.slice(0, 20)}...` : 'null'
    });

    if (!user || !user.deviceToken) {
      console.log('❌ No device token found for user');
      return res.status(404).json({
        success: false,
        message: "No device token available. Please ensure push notifications are enabled in your app.",
        details: {
          userFound: !!user,
          deviceTokenExists: !!user?.deviceToken
        }
      });
    }

    const { sendPushNotification } = require('../push');
    const testTitle = "🎉 Detailed Test - LokalHunt";
    const testBody = `Hi ${user.firstName || user.name || 'there'}! This is a detailed push notification test. If you receive this, your notifications are working perfectly!`;

    console.log('🔍 Sending push notification with details:', {
      title: testTitle,
      body: testBody,
      deviceToken: `${user.deviceToken.slice(0, 20)}...`,
      platform: user.platform
    });

    const result = await sendPushNotification(
      user.deviceToken,
      testTitle,
      testBody,
      {
        type: 'detailed_test',
        userId: user.id,
        timestamp: new Date().toISOString(),
        platform: user.platform
      }
    );

    console.log('✅ Push notification sent successfully:', result);

    // Store test notification in database
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: testTitle,
        message: testBody,
        type: 'test',
        data: {
          type: 'detailed_test',
          timestamp: new Date().toISOString()
        },
        read: false
      }
    });

    res.json({
      success: true,
      message: "Detailed test push notification sent successfully",
      details: {
        messageId: result.messageId,
        sentTo: user.firstName || user.name,
        deviceToken: `${user.deviceToken.slice(0, 20)}...`,
        platform: user.platform,
        timestamp: result.timestamp
      }
    });
  } catch (error) {
    console.error('❌ Detailed push test failed:', error);
    res.status(500).json({
      success: false,
      message: "Detailed test push notification failed",
      error: error.message,
      details: {
        errorType: error.name,
        errorCode: error.code
      }
    });
  }
});

// Manual test - send push to specific device token (for testing)
router.post('/test-push-manual', authenticateToken, async (req, res, next) => {
  try {
    const { deviceToken, title, body } = req.body;

    if (!deviceToken) {
      return res.status(400).json({
        success: false,
        message: "Device token is required"
      });
    }

    const { sendPushNotification } = require('../push');
    const result = await sendPushNotification(
      deviceToken,
      title || "Manual Test",
      body || "This is a manual push notification test from LokalHunt!",
      { type: 'manual_test' }
    );

    res.json({
      success: true,
      message: "Manual push notification sent",
      result: result
    });
  } catch (error) {
    console.error("Manual push test error:", error);
    next(error);
  }
});

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

// Template management routes
router.get('/templates', authenticateToken, notificationController.getNotificationTemplates);
router.put('/templates/:templateId', authenticateToken, notificationController.updateNotificationTemplate);

module.exports = router;