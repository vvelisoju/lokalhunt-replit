const { createResponse, createErrorResponse } = require('../utils/response');
const bcrypt = require('bcryptjs');

// Initialize Prisma Client globally
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class ProfileController {
  // Get profile for any user role
  async getProfile(req, res, next) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          cityId: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          cityRef: {
            select: {
              id: true,
              name: true,
              state: true
            }
          }
        }
      });

      if (!user) {
        return res.status(404).json(
          createErrorResponse('User not found', 404)
        );
      }

      // Format response with cityName for frontend compatibility
      const profileData = {
        ...user,
        cityName: user.cityRef ? `${user.cityRef.name}, ${user.cityRef.state}` : null
      };

      res.json(createResponse('Profile retrieved successfully', { user: profileData }));
    } catch (error) {
      next(error);
    }
  }

  // Update profile for any user role
  async updateProfile(req, res, next) {
    try {
      const { firstName, lastName, phone, cityId } = req.body;

      // Build update data
      const updateData = {};

      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (phone !== undefined) updateData.phone = phone;
      if (cityId !== undefined) updateData.cityId = cityId;

      // Update name if firstName or lastName changed
      if (firstName !== undefined || lastName !== undefined) {
        const currentUser = await prisma.user.findUnique({
          where: { id: req.user.userId },
          select: { firstName: true, lastName: true }
        });

        const newFirstName = firstName !== undefined ? firstName : currentUser.firstName;
        const newLastName = lastName !== undefined ? lastName : currentUser.lastName;

        updateData.name = `${newFirstName || ''} ${newLastName || ''}`.trim() || newFirstName || newLastName;
      }

      const updatedUser = await prisma.user.update({
        where: { id: req.user.userId },
        data: updateData,
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          cityId: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          cityRef: {
            select: {
              id: true,
              name: true,
              state: true
            }
          }
        }
      });

      // Format response with cityName for frontend compatibility
      const profileData = {
        ...updatedUser,
        cityName: updatedUser.cityRef ? `${updatedUser.cityRef.name}, ${updatedUser.cityRef.state}` : null
      };

      res.json(createResponse('Profile updated successfully', { user: profileData }));
    } catch (error) {
      next(error);
    }
  }

  // Update password for any user role
  async updatePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json(
          createErrorResponse('Current password and new password are required', 400)
        );
      }

      // Get current user with password
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { passwordHash: true }
      });

      if (!user) {
        return res.status(404).json(
          createErrorResponse('User not found', 404)
        );
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValidPassword) {
        return res.status(400).json(
          createErrorResponse('Current password is incorrect', 400)
        );
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, 12);

      // Update password
      await prisma.user.update({
        where: { id: req.user.userId },
        data: { passwordHash: newPasswordHash }
      });

      res.json(createResponse('Password updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  // Delete profile (soft delete by deactivating)
  async deleteProfile(req, res, next) {
    try {
      await prisma.user.update({
        where: { id: req.user.userId },
        data: { isActive: false }
      });

      res.json(createResponse('Profile deactivated successfully'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProfileController();