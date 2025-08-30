const { createResponse, createErrorResponse } = require("../utils/response");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const { generateOTP, getOTPExpiration, isOTPExpired, isValidOTPFormat } = require("../utils/otpUtils");
const { sendEmail } = require("./emailController");

const prisma = new PrismaClient();

class AuthController {
  // Register new user (Step 1: Send OTP)
  async register(req, res, next) {
    try {
      const {
        name,
        firstName,
        lastName,
        email,
        phone,
        role = "CANDIDATE",
        city,
        cityId,
        companyName,
        companyDescription,
        industry,
        companySize,
        website,
        contactDetails,
      } = req.body;

      // Build full name from firstName/lastName if name not provided
      const fullName =
        name ||
        (firstName && lastName
          ? `${firstName} ${lastName}`
          : firstName || lastName);

      // Debug logging
      console.log("Registration request body:", req.body);
      console.log("Computed fullName:", fullName);

      // Validation
      if (!fullName || !email) {
        return res
          .status(400)
          .json(
            createErrorResponse(
              "Name (or firstName/lastName) and email are required",
              400,
            ),
          );
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res
          .status(409)
          .json(
            createErrorResponse("User with this email already exists", 409),
          );
      }

      // Generate OTP
      const otp = generateOTP();
      const otpExpiresAt = getOTPExpiration();

      // Use cityId from request, fallback to city if provided as UUID
      const userCityId = cityId || city;

      // Create user without password (will be set during OTP verification)
      const user = await prisma.user.create({
        data: {
          name: fullName,
          firstName,
          lastName,
          email,
          phone,
          passwordHash: "", // Temporary empty password
          role,
          cityId: userCityId,
          isVerified: false,
          otp,
          otpExpiresAt,
        },
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          cityId: true,
          isVerified: true,
          createdAt: true,
        },
      });

      // Send OTP via email
      const emailResult = await sendEmail("OTP_VERIFICATION", email, {
        otp,
        email,
        firstName,
      });

      // Log email result but don't fail registration if email fails
      if (!emailResult.success) {
        console.warn('Failed to send OTP email:', emailResult.error);
        // In development, we can still continue the registration flow
        // In production, you might want to handle this differently
      }

      // Store user data temporarily for role-specific profile creation later
      if (role === "EMPLOYER" && companyName) {
        // Store company data temporarily in a way that can be retrieved during verification
        await prisma.user.update({
          where: { id: user.id },
          data: {
            // Store company data in a temporary field or handle it differently
            // For now, we'll create the employer profile after verification
          }
        });
      }

      res.status(201).json(
        createResponse("OTP sent to email. Please verify to complete registration.", {
          user,
          requiresVerification: true,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  // Verify OTP and complete registration (Step 2)
  async verifyOTPAndCompleteRegistration(req, res, next) {
    try {
      const {
        email,
        otp,
        password,
        confirmPassword,
        companyName,
        companyDescription,
        industry,
        companySize,
        website,
        contactDetails,
      } = req.body;

      // Validation
      if (!email || !otp || !password || !confirmPassword) {
        return res
          .status(400)
          .json(createErrorResponse("Email, OTP, password, and confirm password are required", 400));
      }

      if (password !== confirmPassword) {
        return res
          .status(400)
          .json(createErrorResponse("Passwords do not match", 400));
      }

      if (!isValidOTPFormat(otp)) {
        return res
          .status(400)
          .json(createErrorResponse("OTP must be 6 digits", 400));
      }

      if (password.length < 6) {
        return res
          .status(400)
          .json(createErrorResponse("Password must be at least 6 characters long", 400));
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res
          .status(404)
          .json(createErrorResponse("User not found", 404));
      }

      if (user.isVerified) {
        return res
          .status(400)
          .json(createErrorResponse("User is already verified", 400));
      }

      // Validate OTP
      if (user.otp !== otp) {
        return res
          .status(400)
          .json(createErrorResponse("Invalid OTP", 400));
      }

      if (isOTPExpired(user.otpExpiresAt)) {
        return res
          .status(400)
          .json(createErrorResponse("OTP has expired", 400));
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Update user with password and verification status
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          isVerified: true,
          otp: null,
          otpExpiresAt: null,
        },
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          cityId: true,
          isVerified: true,
          createdAt: true,
        },
      });

      // Create role-specific profiles
      if (user.role === "CANDIDATE") {
        await prisma.candidate.create({
          data: { userId: user.id },
        });
      } else if (user.role === "EMPLOYER") {
        // Create employer profile
        const employer = await prisma.employer.create({
          data: {
            userId: user.id,
            contactDetails: contactDetails || null,
            isVerified: false,
          },
        });

        // Create company if provided
        if (companyName) {
          await prisma.company.create({
            data: {
              employerId: employer.id,
              name: companyName,
              description: companyDescription || null,
              cityId: user.cityId,
              industry: industry || null,
              size: companySize || null,
              website: website || null,
              isDefault: true,
            },
          });
        }

        // Assign basic subscription
        const basicPlan = await prisma.plan.findFirst({
          where: { name: "Self-Service" },
        });

        if (basicPlan) {
          await prisma.subscription.create({
            data: {
              employerId: employer.id,
              planId: basicPlan.id,
              status: "ACTIVE",
              startDate: new Date(),
            },
          });
        }
      } else if (user.role === "BRANCH_ADMIN") {
        await prisma.branchAdmin.create({
          data: {
            userId: user.id,
            assignedCityId: user.cityId,
          },
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || "lokalhunt-secret",
        { expiresIn: "7d" },
      );

      res.status(200).json(
        createResponse("Registration completed successfully", {
          user: updatedUser,
          token,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  // Forgot Password - Send OTP
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        return res
          .status(400)
          .json(createErrorResponse("Email is required", 400));
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res
          .status(404)
          .json(createErrorResponse("User not found", 404));
      }

      // Generate new OTP for password reset
      const otp = generateOTP();
      const otpExpiresAt = getOTPExpiration();

      // Update user with new OTP
      await prisma.user.update({
        where: { id: user.id },
        data: {
          otp,
          otpExpiresAt,
        },
      });

      // Send OTP email for password reset
      try {
        await sendEmail('PASSWORD_RESET_OTP', email, {
          username: user.name,
          appName: 'LokalHunt',
          otp: otp
        });
      } catch (emailError) {
        console.error('Failed to send password reset OTP email:', emailError);
        return res
          .status(500)
          .json(createErrorResponse("Failed to send password reset OTP email", 500));
      }

      res.status(200).json(
        createResponse("Password reset OTP sent successfully", {
          message: "OTP has been sent to your email for password reset",
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  // Reset Password with OTP
  async resetPasswordWithOTP(req, res, next) {
    try {
      const { email, otp, password, confirmPassword } = req.body;

      // Validation
      if (!email || !otp || !password || !confirmPassword) {
        return res
          .status(400)
          .json(createErrorResponse("Email, OTP, password, and confirm password are required", 400));
      }

      if (password !== confirmPassword) {
        return res
          .status(400)
          .json(createErrorResponse("Passwords do not match", 400));
      }

      if (!isValidOTPFormat(otp)) {
        return res
          .status(400)
          .json(createErrorResponse("OTP must be 6 digits", 400));
      }

      if (password.length < 6) {
        return res
          .status(400)
          .json(createErrorResponse("Password must be at least 6 characters long", 400));
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res
          .status(404)
          .json(createErrorResponse("User not found", 404));
      }

      // Validate OTP
      if (user.otp !== otp) {
        return res
          .status(400)
          .json(createErrorResponse("Invalid OTP", 400));
      }

      if (isOTPExpired(user.otpExpiresAt)) {
        return res
          .status(400)
          .json(createErrorResponse("OTP has expired", 400));
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(password, 12);

      // Update user with new password, verify them, and clear OTP
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          isVerified: true, // Verify user upon successful password reset
          otp: null,
          otpExpiresAt: null,
        },
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          cityId: true,
          isVerified: true,
          createdAt: true,
        },
      });

      // If user was not verified before, create role-specific profiles
      if (!user.isVerified) {
        if (user.role === "CANDIDATE") {
          await prisma.candidate.create({
            data: { userId: user.id },
          });
        } else if (user.role === "EMPLOYER") {
          // Create employer profile
          const employer = await prisma.employer.create({
            data: {
              userId: user.id,
              contactDetails: null,
              isVerified: false,
            },
          });

          // Assign basic subscription
          const basicPlan = await prisma.plan.findFirst({
            where: { name: "Self-Service" },
          });

          if (basicPlan) {
            await prisma.subscription.create({
              data: {
                employerId: employer.id,
                planId: basicPlan.id,
                status: "ACTIVE",
                startDate: new Date(),
              },
            });
          }
        } else if (user.role === "BRANCH_ADMIN") {
          await prisma.branchAdmin.create({
            data: {
              userId: user.id,
              assignedCityId: user.cityId,
            },
          });
        }
      }

      res.status(200).json(
        createResponse("Password reset successfully", {
          message: "Your password has been reset successfully and your account is now verified",
          user: updatedUser,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  // Resend OTP
  async resendOTP(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        return res
          .status(400)
          .json(createErrorResponse("Email is required", 400));
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res
          .status(404)
          .json(createErrorResponse("User not found", 404));
      }

      // Generate new OTP
      const otp = generateOTP();
      const otpExpiresAt = getOTPExpiration();

      // Update user with new OTP
      await prisma.user.update({
        where: { id: user.id },
        data: {
          otp,
          otpExpiresAt,
        },
      });

      // Determine email template based on user verification status
      const emailTemplate = user.isVerified ? 'PASSWORD_RESET_OTP' : 'OTP_VERIFICATION';
      const emailSubject = user.isVerified ? 'Password Reset OTP' : 'Email Verification OTP';

      // Send OTP email
      try {
        await sendEmail(emailTemplate, email, {
          username: user.name,
          appName: 'LokalHunt',
          otp: otp
        });
      } catch (emailError) {
        console.error('Failed to send OTP email:', emailError);
        return res
          .status(500)
          .json(createErrorResponse("Failed to send OTP email", 500));
      }

      res.status(200).json(
        createResponse("OTP sent successfully", {
          message: "New OTP has been sent to your email",
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  // Login user
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res
          .status(400)
          .json(createErrorResponse("Email and password are required", 400));
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          candidate: true,
          employer: true,
          branchAdmin: true,
          city: true,
        },
      });

      if (!user) {
        return res
          .status(401)
          .json(createErrorResponse("Invalid credentials", 401));
      }

      // Check if user is verified
      if (!user.isVerified) {
        return res
          .status(403)
          .json(createErrorResponse("Please verify your email before logging in", 403));
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res
          .status(401)
          .json(createErrorResponse("Invalid credentials", 401));
      }

      // Check if user is active
      if (!user.isActive) {
        return res
          .status(403)
          .json(createErrorResponse("Account is deactivated", 403));
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || "lokalhunt-secret",
        { expiresIn: "7d" },
      );

      // Remove password from response
      const { passwordHash, otp, otpExpiresAt, ...userWithoutSensitiveData } = user;

      res.json(
        createResponse("Login successful", {
          user: userWithoutSensitiveData,
          token,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  // Get current user profile
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
          isVerified: true,
          createdAt: true,
          updatedAt: true,
          candidate: true,
          employer: {
            include: {
              companies: true,
              mous: true,
            },
          },
          branchAdmin: {
            include: {
              assignedCity: true,
            },
          },
          city: {
            select: {
              id: true,
              name: true,
              state: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(404).json(createErrorResponse("User not found", 404));
      }

      res.json(
        createResponse("Profile retrieved successfully", user),
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();