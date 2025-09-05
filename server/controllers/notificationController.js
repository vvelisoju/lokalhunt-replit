const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { createResponse, createErrorResponse } = require("../utils/response");
const {
  sendPushNotification,
  sendPushNotificationMultiple,
} = require("../push");
const { AllocationStatusLabels } = require("../utils/enums");

class NotificationController {
  // =======================
  // NOTIFICATION MANAGEMENT
  // =======================

  // Get notifications for user
  async getNotifications(req, res, next) {
    try {
      const userId = req.user.userId;
      console.log('🔔 Getting notifications for user:', userId);

      // Fetch notifications from the database, ordered by timestamp
      const userNotifications = await prisma.notification.findMany({
        where: { userId: userId },
        orderBy: { createdAt: "desc" },
      });

      // Count unread notifications
      const unreadCount = await prisma.notification.count({
        where: { userId: userId, read: false },
      });

      console.log('🔔 Found notifications:', {
        count: userNotifications.length,
        unreadCount: unreadCount,
        notifications: userNotifications.map(n => ({
          id: n.id,
          title: n.title,
          message: n.message,
          type: n.type,
          read: n.read,
          createdAt: n.createdAt
        }))
      });

      const response = createResponse("Notifications retrieved successfully", {
        notifications: userNotifications,
        unreadCount: unreadCount,
      });

      console.log('🔔 Sending response structure:', {
        status: response.status,
        message: response.message,
        dataKeys: Object.keys(response.data || {}),
        notificationsLength: response.data?.notifications?.length
      });

      res.json(response);
    } catch (error) {
      console.error("❌ Get notifications error:", error);
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
        return res
          .status(403)
          .json(
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
        return res
          .status(403)
          .json(
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
        createResponse(
          "Notification preferences retrieved successfully",
          preferences,
        ),
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
      const updatedPreferences = await prisma.userNotificationPreference.upsert(
        {
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
        },
      );

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
        return res
          .status(400)
          .json(createErrorResponse("Title and body are required", 400));
      }

      // Get user's device token
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { deviceToken: true, name: true },
      });

      if (!user || !user.deviceToken) {
        return res
          .status(404)
          .json(
            createErrorResponse(
              "User not found or no device token available",
              404,
            ),
          );
      }

      // Send push notification
      const result = await sendPushNotification(
        user.deviceToken,
        title,
        body,
        data,
        options,
      );

      // Store notification in database
      await prisma.notification.create({
        data: {
          userId: userId,
          title: title,
          message: body,
          type: data.type || "GENERAL",
          data: data,
          read: false,
        },
      });

      res.json(
        createResponse("Push notification sent successfully", {
          messageId: result.messageId,
          sentTo: user.name,
          timestamp: result.timestamp,
        }),
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
        return res
          .status(400)
          .json(createErrorResponse("Valid userIds array is required", 400));
      }

      if (!title || !body) {
        return res
          .status(400)
          .json(createErrorResponse("Title and body are required", 400));
      }

      // Get device tokens for all users
      const users = await prisma.user.findMany({
        where: {
          id: { in: userIds },
          deviceToken: { not: null },
        },
        select: { id: true, deviceToken: true, name: true },
      });

      if (users.length === 0) {
        return res
          .status(404)
          .json(createErrorResponse("No users found with device tokens", 404));
      }

      const deviceTokens = users.map((user) => user.deviceToken);

      // Send multicast push notification
      const result = await sendPushNotificationMultiple(
        deviceTokens,
        title,
        body,
        data,
        options,
      );

      // Store notifications in database for all users
      const notificationData = users.map((user) => ({
        userId: user.id,
        title: title,
        message: body,
        type: data.type || "GENERAL",
        data: data,
        read: false,
      }));

      await prisma.notification.createMany({
        data: notificationData,
      });

      res.json(
        createResponse("Push notifications sent successfully", {
          totalUsers: users.length,
          successCount: result.successCount,
          failureCount: result.failureCount,
          timestamp: result.timestamp,
        }),
      );
    } catch (error) {
      console.error("Send multicast push notification error:", error);
      next(error);
    }
  }

  // Send welcome notification (internal method)
  async sendWelcomeNotification(userId, deviceToken, userName) {
    try {
      console.log(`🔔 Starting welcome notification process for ${userName}`, {
        userId: userId,
        deviceToken: deviceToken ? `${deviceToken.slice(0, 20)}...` : "null",
        userName: userName,
      });

      if (!deviceToken) {
        console.error("❌ No device token provided for welcome notification");
        throw new Error("Device token is required for welcome notification");
      }

      if (!userId) {
        console.error("❌ No user ID provided for welcome notification");
        throw new Error("User ID is required for welcome notification");
      }

      // Use the new template system
      const result = await this.sendNotificationWithStorage(userId, "WELCOME", {
        candidateName: userName || "there",
      });

      console.log(
        `✅ Welcome notification sent successfully to ${userName}`,
        result,
      );
      return result;
    } catch (error) {
      console.error("❌ Failed to send welcome notification:", {
        error: error.message,
        userId: userId,
        userName: userName,
        deviceToken: deviceToken ? `${deviceToken.slice(0, 20)}...` : "null",
      });
      throw error;
    }
  }

  // Test push notification endpoint
  async testPushNotification(req, res, next) {
    try {
      const userId = req.user.userId;
      const {
        title = "Test Notification",
        body = "This is a test push notification from LokalHunt!",
      } = req.body;

      // Get user's device token
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { deviceToken: true, name: true, firstName: true },
      });

      if (!user || !user.deviceToken) {
        return res
          .status(404)
          .json(
            createErrorResponse(
              "No device token available for your account",
              404,
            ),
          );
      }

      // Send test push notification
      const result = await sendPushNotification(user.deviceToken, title, body, {
        type: "TEST",
        userId: userId,
        timestamp: new Date().toISOString(),
      });

      res.json(
        createResponse("Test push notification sent successfully", {
          messageId: result.messageId,
          sentTo: user.firstName || user.name,
          timestamp: result.timestamp,
        }),
      );
    } catch (error) {
      console.error("Test push notification error:", error);
      next(error);
    }
  }

  // =======================
  // CORE NOTIFICATION SERVICE FUNCTIONS
  // =======================

  // Master notification function with template support
  async sendNotificationWithStorage(
    userId,
    templateType,
    variables = {},
    options = {},
  ) {
    try {
      console.log(`🔔 Sending notification: ${templateType} to user ${userId}`);
      // Store notification in database since we are used for in app notifications

      // Get template and build message
      const { title, body } = await this.buildNotificationMessage(
        templateType,
        variables,
      );

      await prisma.notification.create({
        data: {
          userId: userId,
          title: title,
          message: body,
          type: templateType,
          data: variables,
          read: false,
        },
      });

      // Check notification preferences first
      const canSend = await this.checkNotificationPreferences(
        userId,
        templateType,
      );
      if (!canSend) {
        console.log(
          `🚫 Notification blocked by user preferences: ${templateType} for user ${userId}`,
        );
        return { success: false, reason: "blocked_by_preferences" };
      }

      // Check rate limiting
      const rateLimitOk = await this.checkRateLimit(userId, templateType);
      if (!rateLimitOk) {
        console.log(
          `🚫 Rate limit exceeded: ${templateType} for user ${userId}`,
        );
        return { success: false, reason: "rate_limit_exceeded" };
      }

      // Get user's device token
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { deviceToken: true, name: true },
      });

      if (!user || !user.deviceToken) {
        console.log(`❌ No device token for user ${userId}`);
        return { success: false, reason: "no_device_token" };
      }

      // Send push notification
      const result = await sendPushNotification(
        user.deviceToken,
        title,
        body,
        {
          type: templateType,
          userId: userId,
          ...variables,
        },
        options,
      );

      // Update rate limiting tracker
      await this.updateRateLimit(userId, templateType);

      console.log(
        `✅ Notification sent successfully: ${templateType} to ${user.name}`,
      );
      return { success: true, result };
    } catch (error) {
      console.error(`❌ Failed to send notification: ${templateType}`, error);
      throw error;
    }
  }

  // Send notification to multiple users
  async sendNotificationToMultipleUsers(
    userIds,
    templateType,
    variables = {},
    options = {},
  ) {
    try {
      const results = [];

      for (const userId of userIds) {
        const result = await this.sendNotificationWithStorage(
          userId,
          templateType,
          variables,
          options,
        );
        results.push({ userId, ...result });
      }

      const successCount = results.filter((r) => r.success).length;
      const failureCount = results.filter((r) => !r.success).length;

      return {
        success: true,
        totalUsers: userIds.length,
        successCount,
        failureCount,
        results,
      };
    } catch (error) {
      console.error("❌ Failed to send multiple notifications:", error);
      throw error;
    }
  }

  // Build notification message from template
  async buildNotificationMessage(templateType, variables = {}) {
    try {
      // Get template from database
      const template = await prisma.notificationTemplate.findUnique({
        where: { type: templateType, isActive: true },
      });

      if (!template) {
        throw new Error(`Notification template not found: ${templateType}`);
      }

      // Replace variables in title and body
      let title = template.title;
      let body = template.body;

      for (const [key, value] of Object.entries(variables)) {
        const placeholder = `{${key}}`;
        title = title.replace(new RegExp(placeholder, "g"), value || "");
        body = body.replace(new RegExp(placeholder, "g"), value || "");
      }

      return { title, body };
    } catch (error) {
      console.error("❌ Failed to build notification message:", error);
      throw error;
    }
  }

  // Check notification preferences
  async checkNotificationPreferences(userId, notificationType) {
    try {
      const preferences = await prisma.userNotificationPreference.findUnique({
        where: { userId },
      });

      // If no preferences found, allow all notifications (default behavior)
      if (!preferences) {
        return true;
      }

      // Check if push notifications are enabled
      if (!preferences.pushNotifications) {
        return false;
      }

      // Check specific notification type preferences
      switch (notificationType) {
        case "JOB_ALERT":
          return preferences.jobAlerts;
        case "APPLICATION_UPDATE":
          return preferences.applicationUpdates;
        case "INTERVIEW_SCHEDULED":
          return preferences.interviewReminders;
        case "PROFILE_UPDATE":
          return preferences.profileUpdates;
        case "SYSTEM":
          return preferences.systemNotifications;
        case "PROMOTIONAL":
          return preferences.promotionalOffers;
        default:
          return true; // Allow other types by default
      }
    } catch (error) {
      console.error("❌ Failed to check notification preferences:", error);
      return true; // Allow on error (fail open)
    }
  }

  // Check rate limiting
  async checkRateLimit(userId, notificationType) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tracker = await prisma.dailyNotificationTracker.findUnique({
        where: {
          userId_notificationType_date: {
            userId,
            notificationType,
            date: today,
          },
        },
      });

      // Rate limits by notification type
      const rateLimits = {
        JOB_ALERT: 2, // Max 2 job alerts per day
        PROFILE_VIEWED: 5, // Max 5 profile view notifications per day
        WELCOME: 1, // Max 1 welcome per day
        TEST: 10, // Max 10 test notifications per day
      };

      const limit = rateLimits[notificationType] || 10; // Default limit

      return !tracker || tracker.count < limit;
    } catch (error) {
      console.error("❌ Failed to check rate limit:", error);
      return true; // Allow on error
    }
  }

  // Update rate limiting tracker
  async updateRateLimit(userId, notificationType) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await prisma.dailyNotificationTracker.upsert({
        where: {
          userId_notificationType_date: {
            userId,
            notificationType,
            date: today,
          },
        },
        update: {
          count: { increment: 1 },
        },
        create: {
          userId,
          notificationType,
          date: today,
          count: 1,
        },
      });
    } catch (error) {
      console.error("❌ Failed to update rate limit:", error);
    }
  }

  // =======================
  // SPECIFIC NOTIFICATION METHODS
  // =======================

  // Send job match notification to candidates
  async sendJobMatchNotifications(adId, jobDetails) {
    try {
      console.log(`🎯 Sending job match notifications for ad: ${adId}`);

      // Find candidates with matching preferences
      const matchingCandidates = await prisma.candidate.findMany({
        where: {
          AND: [
            { onboardingCompleted: true },
            {
              OR: [
                { preferredJobTitles: { has: jobDetails.title } },
                { preferredLocations: { has: jobDetails.locationId } },
                { preferredIndustries: { has: jobDetails.categoryName } },
              ],
            },
          ],
        },
        include: {
          user: {
            select: { id: true, name: true, deviceToken: true },
          },
        },
      });

      console.log(`📊 Found ${matchingCandidates.length} matching candidates`);

      const results = [];
      for (const candidate of matchingCandidates) {
        if (candidate.user.deviceToken) {
          const result = await this.sendNotificationWithStorage(
            candidate.user.id,
            "JOB_ALERT",
            {
              jobTitle: jobDetails.title,
              companyName: jobDetails.companyName,
              location: jobDetails.locationName,
              salary: jobDetails.salary || "Competitive",
            },
          );
          results.push(result);
        }
      }

      const successCount = results.filter((r) => r.success).length;
      console.log(`✅ Sent ${successCount} job match notifications`);

      return { successCount, totalCandidates: matchingCandidates.length };
    } catch (error) {
      console.error("❌ Failed to send job match notifications:", error);
      throw error;
    }
  }

  // Send application status notification
  async sendApplicationStatusNotification(
    userId,
    employerId,
    adId,
    newStatus,
    jobTitle,
    companyName,
  ) {
    try {
      await this.sendNotificationWithStorage(
        userId,
        "APPLICATION_UPDATE",
        {
          jobTitle,
          companyName,
          status: AllocationStatusLabels[newStatus] || newStatus.toLowerCase(),
        },
      );
    } catch (error) {
      console.error(
        "❌ Failed to send application status notification:",
        error,
      );
      throw error;
    }
  }

  // Send new application notification to employer
  async sendNewApplicationNotification(
    userId,
    candidateId,
    adId,
    candidateName,
    jobTitle,
  ) {
    try {
      await this.sendNotificationWithStorage(userId, "NEW_APPLICATION", {
        candidateName,
        jobTitle,
      });
    } catch (error) {
      console.error("❌ Failed to send new application notification:", error);
      throw error;
    }
  }
  // Send new application notification to employer

  async sendJobViewedNotification(
    userId,
    candidateId,
    adId,
    candidateName,
    jobTitle,
    companyName,
  ) {
    try {
      await this.sendNotificationWithStorage(userId, "JOB_VIEWED", {
        candidateName,
        jobTitle,
        companyName,
      });
    } catch (error) {
      console.error("❌ Failed to send new application notification:", error);
      throw error;
    }
  }
  // Send profile view notification
  async sendProfileViewNotification(userId, employerId, companyName) {
    try {
      await this.sendNotificationWithStorage(userId, "PROFILE_VIEWED", {
        companyName,
      });
    } catch (error) {
      console.error("❌ Failed to send profile view notification:", error);
      throw error;
    }
  }

  // Send job view milestone notification
  async sendJobViewMilestoneNotification(userId, adId, jobTitle, viewCount) {
    try {
      await this.sendNotificationWithStorage(userId, "JOB_VIEW_MILESTONE", {
        jobTitle,
        viewCount: viewCount.toString(),
      });
    } catch (error) {
      console.error(
        "❌ Failed to send job view milestone notification:",
        error,
      );
      throw error;
    }
  }

  // Send job bookmark notification
  async sendJobBookmarkNotification(
    userId,
    candidateId,
    adId,
    candidateName,
    jobTitle,
  ) {
    try {
      await this.sendNotificationWithStorage(userId, "JOB_BOOKMARKED", {
        candidateName,
        jobTitle,
      });
    } catch (error) {
      console.error("❌ Failed to send job bookmark notification:", error);
      throw error;
    }
  }

  // Send job closed notification to applied candidates
  async sendJobClosedNotifications(adId, jobTitle, companyName) {
    try {
      console.log(`🔒 Sending job closed notifications for ad: ${adId}`);

      // Find all candidates who have applied to this job
      const appliedCandidates = await prisma.allocation.findMany({
        where: {
          adId: adId,
        },
        include: {
          candidate: {
            include: {
              user: {
                select: { id: true, name: true, deviceToken: true },
              },
            },
          },
        },
      });

      console.log(`📊 Found ${appliedCandidates.length} applied candidates`);

      const results = [];
      for (const allocation of appliedCandidates) {
        if (allocation.candidate.user.deviceToken) {
          const result = await this.sendNotificationWithStorage(
            allocation.candidate.user.id,
            "JOB_CLOSED",
            {
              jobTitle,
              companyName,
            },
          );
          results.push(result);
        }
      }

      const successCount = results.filter((r) => r.success).length;
      console.log(`✅ Sent ${successCount} job closed notifications`);

      return { successCount, totalCandidates: appliedCandidates.length };
    } catch (error) {
      console.error("❌ Failed to send job closed notifications:", error);
      throw error;
    }
  }

  // Send ad approval notification to branch admin
  async sendAdApprovalNotification(employerUserId, employerName, employerEmail, adId, jobTitle) {
    try {
      console.log(`📋 Sending ad approval notification for ad: ${adId}`);

      // Get employer's city to find the branch admin
      const employer = await prisma.employer.findFirst({
        where: { userId: employerUserId },
        include: {
          user: {
            include: {
              city: true,
            },
          },
        },
      });

      if (!employer || !employer.user.cityId) {
        console.log("❌ No employer or city found for ad approval notification");
        return { success: false, reason: "no_employer_city" };
      }

      // Find branch admin for this city
      const branchAdmin = await prisma.branchAdmin.findFirst({
        where: { assignedCityId: employer.user.cityId },
        include: {
          user: {
            select: { id: true, name: true, deviceToken: true },
          },
        },
      });

      if (!branchAdmin) {
        console.log(`❌ No branch admin found for city: ${employer.user.cityId}`);
        return { success: false, reason: "no_branch_admin" };
      }

      // Send notification to branch admin
      const result = await this.sendNotificationWithStorage(
        branchAdmin.user.id,
        "NEW_AD_SUBMITTED",
        {
          employerName,
          companyName: employer.user.name, // Using user name as company name fallback
          jobTitle,
          adId,
        },
      );

      console.log(`✅ Ad approval notification sent to branch admin: ${branchAdmin.user.name}`);
      return result;
    } catch (error) {
      console.error("❌ Failed to send ad approval notification:", error);
      throw error;
    }
  }

  // Send employer registration notification to branch admin
  async sendEmployerRegistrationNotification(employerUserId, employerName, employerEmail) {
    try {
      console.log(`🏢 Sending employer registration notification for: ${employerName}`);

      // Get employer's city to find the branch admin
      const employer = await prisma.employer.findFirst({
        where: { userId: employerUserId },
        include: {
          user: {
            include: {
              city: true,
            },
          },
        },
      });

      if (!employer || !employer.user.cityId) {
        console.log("❌ No employer or city found for registration notification");
        return { success: false, reason: "no_employer_city" };
      }

      // Find branch admin for this city
      const branchAdmin = await prisma.branchAdmin.findFirst({
        where: { assignedCityId: employer.user.cityId },
        include: {
          user: {
            select: { id: true, name: true, deviceToken: true },
          },
        },
      });

      if (!branchAdmin) {
        console.log(`❌ No branch admin found for city: ${employer.user.cityId}`);
        return { success: false, reason: "no_branch_admin" };
      }

      // Send notification to branch admin
      const result = await this.sendNotificationWithStorage(
        branchAdmin.user.id,
        "NEW_EMPLOYER_REGISTERED",
        {
          employerName,
          employerEmail,
          companyName: employer.user.name, // Using user name as company name fallback
        },
      );

      console.log(`✅ Employer registration notification sent to branch admin: ${branchAdmin.user.name}`);
      return result;
    } catch (error) {
      console.error("❌ Failed to send employer registration notification:", error);
      throw error;
    }
  }

  // Send new candidate registration notification to branch admin
  async sendNewCandidateNotification(candidateUserId, candidateName, candidateEmail) {
    try {
      console.log(`👤 Sending new candidate notification for: ${candidateName}`);

      // Get candidate's city to find the branch admin
      const candidate = await prisma.candidate.findFirst({
        where: { userId: candidateUserId },
        include: {
          user: {
            include: {
              city: true,
            },
          },
        },
      });

      if (!candidate || !candidate.user.cityId) {
        console.log("❌ No candidate or city found for registration notification");
        return { success: false, reason: "no_candidate_city" };
      }

      // Find branch admin for this city
      const branchAdmin = await prisma.branchAdmin.findFirst({
        where: { assignedCityId: candidate.user.cityId },
        include: {
          user: {
            select: { id: true, name: true, deviceToken: true },
          },
        },
      });

      if (!branchAdmin) {
        console.log(`❌ No branch admin found for city: ${candidate.user.cityId}`);
        return { success: false, reason: "no_branch_admin" };
      }

      // Send notification to branch admin
      const result = await this.sendNotificationWithStorage(
        branchAdmin.user.id,
        "NEW_CANDIDATE_REGISTERED",
        {
          candidateName,
          candidateEmail,
        },
      );

      console.log(`✅ New candidate notification sent to branch admin: ${branchAdmin.user.name}`);
      return result;
    } catch (error) {
      console.error("❌ Failed to send new candidate notification:", error);
      throw error;
    }
  }

  // =======================
  // TEMPLATE MANAGEMENT
  // =======================

  // Get all notification templates
  async getNotificationTemplates(req, res, next) {
    try {
      const templates = await prisma.notificationTemplate.findMany({
        orderBy: { type: "asc" },
      });

      res.json(
        createResponse(
          "Notification templates retrieved successfully",
          templates,
        ),
      );
    } catch (error) {
      console.error("Get notification templates error:", error);
      next(error);
    }
  }

  // Update notification template
  async updateNotificationTemplate(req, res, next) {
    try {
      const { templateId } = req.params;
      const { title, body, variables, isActive, description } = req.body;

      const updatedTemplate = await prisma.notificationTemplate.update({
        where: { id: templateId },
        data: {
          title,
          body,
          variables,
          isActive,
          description,
        },
      });

      res.json(
        createResponse(
          "Notification template updated successfully",
          updatedTemplate,
        ),
      );
    } catch (error) {
      console.error("Update notification template error:", error);
      next(error);
    }
  }
}

module.exports = new NotificationController();
