
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { createResponse, createErrorResponse } = require("../utils/response");
const { sendPushNotification, sendPushNotificationMultiple } = require("../push");

class NotificationController {
  // =======================
  // NOTIFICATION MANAGEMENT
  // =======================

  // Get notifications for user
  async getNotifications(req, res, next) {
    try {
      const userId = req.user.userId;

      // Fetch notifications from the database, ordered by timestamp
      const userNotifications = await prisma.notification.findMany({
        where: { userId: userId },
        orderBy: { createdAt: "desc" },
      });

      // Count unread notifications
      const unreadCount = await prisma.notification.count({
        where: { userId: userId, read: false },
      });

      res.json(
        createResponse("Notifications retrieved successfully", {
          notifications: userNotifications,
          unreadCount: unreadCount,
        }),
      );
    } catch (error) {
      console.error("Get notifications error:", error);
      next(error);
    }
  }

  // Mark notification as read
  async markNotificationAsRead(req, res, next) {
    try {
      const { notificationId } = req.params;
      const userId = req.user.userId;

      // Find the notification and ensure it belongs to the current user
      const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
      });

      if (!notification) {
        return res
          .status(404)
          .json(createErrorResponse("Notification not found", 404));
      }

      if (notification.userId !== userId) {
        return res.status(403).json(
          createErrorResponse(
            "You do not have permission to update this notification",
            403,
          ),
        );
      }

      // Mark the notification as read
      await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true },
      });

      res.json(createResponse("Notification marked as read successfully"));
    } catch (error) {
      console.error("Mark notification as read error:", error);
      next(error);
    }
  }

  // Mark all notifications as read
  async markAllNotificationsAsRead(req, res, next) {
    try {
      const userId = req.user.userId;

      // Mark all notifications for the current user as read
      await prisma.notification.updateMany({
        where: { userId: userId },
        data: { read: true },
      });

      res.json(createResponse("All notifications marked as read successfully"));
    } catch (error) {
      console.error("Mark all notifications as read error:", error);
      next(error);
    }
  }

  // Delete notification
  async deleteNotification(req, res, next) {
    try {
      const { notificationId } = req.params;
      const userId = req.user.userId;

      // Find the notification and ensure it belongs to the current user
      const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
      });

      if (!notification) {
        return res
          .status(404)
          .json(createErrorResponse("Notification not found", 404));
      }

      if (notification.userId !== userId) {
        return res.status(403).json(
          createErrorResponse(
            "You do not have permission to delete this notification",
            403,
          ),
        );
      }

      // Delete the notification
      await prisma.notification.delete({
        where: { id: notificationId },
      });

      res.json(createResponse("Notification deleted successfully"));
    } catch (error) {
      console.error("Delete notification error:", error);
      next(error);
    }
  }

  // Get notification preferences
  async getNotificationPreferences(req, res, next) {
    try {
      const userId = req.user.userId;

      // Fetch notification preferences for the user
      const preferences = await prisma.userNotificationPreference.findUnique({
        where: { userId: userId },
      });

      // If preferences don't exist, return defaults
      if (!preferences) {
        return res.json(
          createResponse("Notification preferences retrieved successfully", {
            emailNotifications: true, // Default to true
            smsNotifications: false, // Default to false
            jobAlerts: true, // Default to true
            applicationUpdates: true, // Default to true
            pushNotifications: true, // Default to true
            // Add other preferences as needed
          }),
        );
      }

      res.json(
        createResponse("Notification preferences retrieved successfully", preferences),
      );
    } catch (error) {
      console.error("Get notification preferences error:", error);
      next(error);
    }
  }

  // Update notification preferences
  async updateNotificationPreferences(req, res, next) {
    try {
      const userId = req.user.userId;
      const {
        emailNotifications,
        smsNotifications,
        pushNotifications,
        jobAlerts,
        applicationUpdates,
        // Add other preference fields here
      } = req.body;

      // Prepare data to update or create
      const dataToUpdate = {};
      if (emailNotifications !== undefined)
        dataToUpdate.emailNotifications = emailNotifications;
      if (smsNotifications !== undefined)
        dataToUpdate.smsNotifications = smsNotifications;
      if (pushNotifications !== undefined)
        dataToUpdate.pushNotifications = pushNotifications;
      if (jobAlerts !== undefined) dataToUpdate.jobAlerts = jobAlerts;
      if (applicationUpdates !== undefined)
        dataToUpdate.applicationUpdates = applicationUpdates;
      // Add other preferences

      // Update or create notification preferences
      const updatedPreferences =
        await prisma.userNotificationPreference.upsert({
          where: { userId: userId },
          update: dataToUpdate,
          create: {
            userId: userId,
            emailNotifications: emailNotifications ?? true,
            smsNotifications: smsNotifications ?? false,
            pushNotifications: pushNotifications ?? true,
            jobAlerts: jobAlerts ?? true,
            applicationUpdates: applicationUpdates ?? true,
            // Set default values for other preferences
          },
        });

      res.json(
        createResponse(
          "Notification preferences updated successfully",
          updatedPreferences,
        ),
      );
    } catch (error) {
      console.error("Update notification preferences error:", error);
      next(error);
    }
  }

  // =======================
  // PUSH NOTIFICATION METHODS
  // =======================

  // Send push notification to specific user
  async sendPushToUser(req, res, next) {
    try {
      const { userId } = req.params;
      const { title, body, data = {}, options = {} } = req.body;

      if (!title || !body) {
        return res.status(400).json(
          createErrorResponse("Title and body are required", 400)
        );
      }

      // Get user's device token
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { deviceToken: true, name: true }
      });

      if (!user || !user.deviceToken) {
        return res.status(404).json(
          createErrorResponse("User not found or no device token available", 404)
        );
      }

      // Send push notification
      const result = await sendPushNotification(
        user.deviceToken,
        title,
        body,
        data,
        options
      );

      // Store notification in database
      await prisma.notification.create({
        data: {
          userId: userId,
          title: title,
          message: body,
          type: data.type || 'general',
          data: data,
          read: false
        }
      });

      res.json(
        createResponse("Push notification sent successfully", {
          messageId: result.messageId,
          sentTo: user.name,
          timestamp: result.timestamp
        })
      );
    } catch (error) {
      console.error("Send push notification error:", error);
      next(error);
    }
  }

  // Send push notification to multiple users
  async sendPushToMultipleUsers(req, res, next) {
    try {
      const { userIds, title, body, data = {}, options = {} } = req.body;

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json(
          createErrorResponse("Valid userIds array is required", 400)
        );
      }

      if (!title || !body) {
        return res.status(400).json(
          createErrorResponse("Title and body are required", 400)
        );
      }

      // Get device tokens for all users
      const users = await prisma.user.findMany({
        where: { 
          id: { in: userIds },
          deviceToken: { not: null }
        },
        select: { id: true, deviceToken: true, name: true }
      });

      if (users.length === 0) {
        return res.status(404).json(
          createErrorResponse("No users found with device tokens", 404)
        );
      }

      const deviceTokens = users.map(user => user.deviceToken);

      // Send multicast push notification
      const result = await sendPushNotificationMultiple(
        deviceTokens,
        title,
        body,
        data,
        options
      );

      // Store notifications in database for all users
      const notificationData = users.map(user => ({
        userId: user.id,
        title: title,
        message: body,
        type: data.type || 'general',
        data: data,
        read: false
      }));

      await prisma.notification.createMany({
        data: notificationData
      });

      res.json(
        createResponse("Push notifications sent successfully", {
          totalUsers: users.length,
          successCount: result.successCount,
          failureCount: result.failureCount,
          timestamp: result.timestamp
        })
      );
    } catch (error) {
      console.error("Send multicast push notification error:", error);
      next(error);
    }
  }

  // Send welcome notification (internal method)
  async sendWelcomeNotification(userId, deviceToken, userName) {
    try {
      const welcomeTitle = "Welcome to LokalHunt! 🎉";
      const welcomeBody = `Hi ${userName || 'there'}! Your push notifications are now active. We'll keep you updated on new job opportunities!`;

      console.log(`🔔 Sending welcome notification to ${userName}`);

      const result = await sendPushNotification(
        deviceToken,
        welcomeTitle,
        welcomeBody,
        {
          type: 'welcome',
          userId: userId,
          action: 'open_app'
        }
      );

      // Store welcome notification in database
      await prisma.notification.create({
        data: {
          userId: userId,
          title: welcomeTitle,
          message: welcomeBody,
          type: 'welcome',
          data: {
            type: 'welcome',
            userId: userId,
            action: 'open_app'
          },
          read: false
        }
      });

      console.log(`✅ Welcome notification sent successfully to ${userName}`);
      return result;
    } catch (error) {
      console.error('❌ Failed to send welcome notification:', error);
      throw error;
    }
  }

  // Test push notification endpoint
  async testPushNotification(req, res, next) {
    try {
      const userId = req.user.userId;
      const { title = "Test Notification", body = "This is a test push notification from LokalHunt!" } = req.body;

      // Get user's device token
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { deviceToken: true, name: true, firstName: true }
      });

      if (!user || !user.deviceToken) {
        return res.status(404).json(
          createErrorResponse("No device token available for your account", 404)
        );
      }

      // Send test push notification
      const result = await sendPushNotification(
        user.deviceToken,
        title,
        body,
        {
          type: 'test',
          userId: userId,
          timestamp: new Date().toISOString()
        }
      );

      res.json(
        createResponse("Test push notification sent successfully", {
          messageId: result.messageId,
          sentTo: user.firstName || user.name,
          timestamp: result.timestamp
        })
      );
    } catch (error) {
      console.error("Test push notification error:", error);
      next(error);
    }
  }
}

module.exports = new NotificationController();
