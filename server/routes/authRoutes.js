const express = require("express");
const bcrypt = require("bcryptjs");
const authController = require("../controllers/authController");
const { authenticateToken } = require("../middleware/auth");
const prisma = require("../utils/prismaClient");

const router = express.Router();

// Authentication routes
router.post("/register", authController.register);
router.post("/verify-otp", authController.verifyOTPAndCompleteRegistration);
router.post("/resend-otp", authController.resendOTP);
router.post("/login", authController.login);
// Forgot password
router.post("/forgot-password", authController.forgotPassword);

// Forgot password via mobile
router.post("/forgot-password-mobile", authController.forgotPasswordMobile);

// Reset password with OTP
router.post("/reset-password", authController.resetPasswordWithOTP);

// Reset password with mobile OTP
router.post(
  "/reset-password-mobile",
  authController.resetPasswordWithMobileOTP,
);
// Get user profile
router.get("/profile", authenticateToken, authController.getProfile);

// Update profile
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    console.log("req.user", req.user);
    // Extract userId from different possible JWT payload structures
    const userId = req.user.id || req.user.userId || req.user.sub;
    const role = req.user.role;
    const updates = req.body;

    if (!userId) {
      console.error("No userId found in JWT token:", req.user);
      return res.status(401).json({
        status: "error",
        message: "Invalid authentication token - user ID not found",
      });
    }

    console.log("Auth profile update request:", { userId, role, updates });

    // Build update data, handling only valid User model fields
    const updateData = {};

    if (updates.firstName !== undefined)
      updateData.firstName = updates.firstName;
    if (updates.lastName !== undefined) updateData.lastName = updates.lastName;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.phone !== undefined) updateData.phone = updates.phone;

    // Handle city relationship update
    if (updates.city !== undefined && updates.city) {
      updateData.cityId = updates.city;
    }

    // Update name if firstName or lastName changed
    if (updates.firstName !== undefined || updates.lastName !== undefined) {
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true },
      });

      if (!currentUser) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      const newFirstName =
        updates.firstName !== undefined
          ? updates.firstName
          : currentUser.firstName;
      const newLastName =
        updates.lastName !== undefined
          ? updates.lastName
          : currentUser.lastName;

      updateData.name =
        `${newFirstName || ""} ${newLastName || ""}`.trim() ||
        newFirstName ||
        newLastName;
    }

    // Validate required fields
    if (updateData.firstName && !updateData.firstName.trim()) {
      return res.status(400).json({
        status: "error",
        message: "First name cannot be empty",
      });
    }

    if (updateData.lastName && !updateData.lastName.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Last name cannot be empty",
      });
    }

    // Email is optional, but if provided, validate format
    if (
      updateData.email &&
      updateData.email.trim() &&
      !/\S+@\S+\.\S+/.test(updateData.email)
    ) {
      return res.status(400).json({
        status: "error",
        message: "Invalid email format",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        cityId: true,
        city: {
          select: {
            id: true,
            name: true,
            state: true,
          },
        },
      },
    });

    console.log("Profile updated successfully:", updatedUser);

    res.json({
      status: "success",
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to update profile",
    });
  }
});

// Change password for authenticated users
router.put("/change-password", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId || req.user.sub;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Invalid authentication token - user ID not found",
      });
    }

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: "error",
        message:
          "Current password, new password, and confirm password are required",
      });
    }

    // if (newPassword !== confirmPassword) {
    //   return res.status(400).json({
    //     status: "error",
    //     message: "New passwords do not match",
    //   });
    // }

    if (newPassword.length < 6) {
      return res.status(400).json({
        status: "error",
        message: "New password must be at least 6 characters long",
      });
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true },
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );
    if (!isValidPassword) {
      return res.status(400).json({
        status: "error",
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    res.json({
      status: "success",
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to change password",
    });
  }
});

// Store device token for push notifications (requires authentication)
router.post("/device-token", authenticateToken, authController.storeDeviceToken);

// Delete account request
router.delete("/delete-account", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId || req.user.sub;
    const { reason } = req.body;

    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Invalid authentication token - user ID not found",
      });
    }

    // For now, just mark user as inactive and log the deletion request
    // In production, you might want to implement a proper deletion queue
    await prisma.user.update({
      where: { id: userId },
      data: { 
        isActive: false,
        // You could add a deletionRequestedAt field to track this
      },
    });

    // Log the deletion request (you might want to create a separate table for this)
    console.log(`Account deletion requested by user ${userId}. Reason: ${reason || 'Not specified'}`);

    res.json({
      status: "success",
      message: "Account deletion request submitted successfully. Your account will be deleted within 30 days.",
    });
  } catch (error) {
    console.error("Account deletion error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to process account deletion request",
    });
  }
});

// Logout user (for JWT, this is mainly for consistency)
router.post("/logout", (req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

module.exports = router;
