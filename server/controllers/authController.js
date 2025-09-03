const { createResponse, createErrorResponse } = require("../utils/response");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const {
  generateOTP,
  getOTPExpiration,
  isOTPExpired,
  isValidOTPFormat,
} = require("../utils/otpUtils");
const { sendEmail } = require("./emailController");
const { sendOTPSMS } = require("../utils/smsUtils");

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
      if (!fullName || (!email && !phone)) {
        return res
          .status(400)
          .json(
            createErrorResponse(
              "Name (or firstName/lastName) and at least one of email or phone are required",
              400,
            ),
          );
      }

      // Check if user already exists by phone or email
      let existingUser = null;
      if (phone) {
        existingUser = await prisma.user.findFirst({
          where: { phone },
        });
      }

      if (existingUser) {
        if (existingUser.phone === phone) {
          return res
            .status(409)
            .json(
              createErrorResponse(
                "User with this phone number already exists",
                409,
              ),
            );
        }
        // if (existingUser.email === email) {
        //   return res
        //     .status(409)
        //     .json(createErrorResponse("User with this email already exists", 409));
        // }
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

      // Send OTP via email if email is provided
      if (email) {
        const emailResult = await sendEmail("OTP_VERIFICATION", email, {
          otp,
          email,
          firstName,
        });

        // Log email result but don't fail registration if email fails
        if (!emailResult.success) {
          console.warn("Failed to send OTP email:", emailResult.error);
        }
      }

      // Send OTP via SMS if phone number is provided
      let smsResult = { success: true };
      if (phone) {
        console.log(`Registration OTP generated: ${otp} for phone: ${phone}`);
        smsResult = await sendOTPSMS(phone, "register_otp", {
          otp,
          name: fullName,
        });

        if (!smsResult.success) {
          console.warn("Failed to send OTP SMS:", smsResult.error);
        } else {
          console.log("OTP SMS result:", smsResult.message);
        }
      }

      res.status(201).json(
        createResponse("OTP sent. Please verify to complete registration.", {
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
        phone,
        email,
        otp,
        isForgotPassword = false,
        password,
        confirmPassword,
        registrationData,
        companyName, // Direct company name from frontend
        cityId, // Direct city ID from frontend
      } = req.body;

      console.log("OTP Verification Request:", { 
        phone, 
        email, 
        isForgotPassword, 
        hasRegistrationData: !!registrationData,
        companyName,
        cityId
      });

      // Determine identifier type and value
      const identifier = phone || email;

      if (!identifier || !otp) {
        return res
          .status(400)
          .json(createErrorResponse("Phone/Email and OTP are required", 400));
      }

      // Find user by phone or email
      let userData;
      if (phone) {
        userData = await prisma.user.findFirst({
          where: { phone },
        });
      } else if (email) {
        userData = await prisma.user.findUnique({
          where: { email },
        });
      }

      if (!userData) {
        return res.status(404).json(createErrorResponse("User not found", 404));
      }

      // Validate OTP
      if (userData.otp !== otp) {
        return res.status(400).json(createErrorResponse("Invalid OTP", 400));
      }

      if (isOTPExpired(userData.otpExpiresAt)) {
        return res
          .status(400)
          .json(createErrorResponse("OTP has expired", 400));
      }

      // FORGOT PASSWORD FLOW
      if (isForgotPassword) {
        // Validation for forgot password
        if (!password || !confirmPassword) {
          return res
            .status(400)
            .json(
              createErrorResponse(
                "Password and confirm password are required",
                400,
              ),
            );
        }

        if (password !== confirmPassword) {
          return res
            .status(400)
            .json(createErrorResponse("Passwords do not match", 400));
        }

        if (!isValidOTPFormat(otp)) {
          return res
            .status(400)
            .json(
              createErrorResponse(
                "Please enter a valid 6-digit verification code",
                400,
              ),
            );
        }

        if (password.length < 6) {
          return res
            .status(400)
            .json(
              createErrorResponse(
                "Password must be at least 6 characters long",
                400,
              ),
            );
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(password, 12);

        // Update user with new password and clear OTP
        const updatedUser = await prisma.user.update({
          where: { id: userData.id },
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

        // Generate JWT token for forgot password flow
        const token = jwt.sign(
          {
            userId: updatedUser.id,
            role: updatedUser.role,
            email: updatedUser.email,
            phone: updatedUser.phone,
          },
          process.env.JWT_SECRET,
          { expiresIn: "30d" },
        );

        return res.status(200).json(
          createResponse("Password reset successfully", {
            message: "Your password has been reset successfully",
            user: {
              id: updatedUser.id,
              name: updatedUser.name,
              firstName: updatedUser.firstName,
              lastName: updatedUser.lastName,
              email: updatedUser.email,
              phone: updatedUser.phone,
              role: updatedUser.role,
              isVerified: updatedUser.isVerified,
              isActive: true,
            },
            token,
          }),
        );
      }

      // REGISTRATION FLOW
      // For registration flow, password is required
      if (!userData.isVerified && (!password || !confirmPassword)) {
        return res
          .status(400)
          .json(
            createErrorResponse(
              "Password and confirm password are required for registration",
              400,
            ),
          );
      }

      if (!userData.isVerified && password !== confirmPassword) {
        return res
          .status(400)
          .json(createErrorResponse("Passwords do not match", 400));
      }

      if (!userData.isVerified && password && password.length < 6) {
        return res
          .status(400)
          .json(
            createErrorResponse(
              "Password must be at least 6 characters long",
              400,
            ),
          );
      }

      // Extract company data from multiple sources
      const finalCompanyData = {
        companyName: companyName || registrationData?.companyName,
        cityId: cityId || registrationData?.cityId || userData.cityId,
      };

      console.log("Final company data for employer:", finalCompanyData);

      // Start transaction for registration completion
      const result = await prisma.$transaction(async (transactionPrisma) => {
        // Update user data
        const updateData = {
          isVerified: true,
          otp: null,
          otpExpiresAt: null,
        };

        // Set password for registration flow
        if (!userData.isVerified && password) {
          const passwordHash = await bcrypt.hash(password, 12);
          updateData.passwordHash = passwordHash;
          updateData.isActive = true;
        }

        const updatedUser = await transactionPrisma.user.update({
          where: { id: userData.id },
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
            isVerified: true,
            isActive: true,
            createdAt: true,
          },
        });

        let profileData = null;

        // Create role-specific profiles for new registrations
        if (!userData.isVerified) {
          if (userData.role === "CANDIDATE") {
            profileData = await transactionPrisma.candidate.create({
              data: {
                userId: userData.id,
              },
            });
          } else if (userData.role === "EMPLOYER") {
            // Create employer profile
            const employer = await transactionPrisma.employer.create({
              data: {
                userId: userData.id,
                contactDetails: {},
                isVerified: false,
              },
            });

            console.log("Created employer profile:", employer.id);

            // Create default company for employer
            if (finalCompanyData.companyName && finalCompanyData.cityId) {
              console.log("Creating default company with data:", finalCompanyData);
              
              const defaultCompany = await transactionPrisma.company.create({
                data: {
                  employerId: employer.id,
                  name: finalCompanyData.companyName,
                  cityId: finalCompanyData.cityId,
                  isDefault: true,
                  isActive: true,
                },
              });

              console.log("Created default company:", defaultCompany);
            } else {
              console.log("No company data available - company name:", finalCompanyData.companyName, "cityId:", finalCompanyData.cityId);
            }

            // Assign basic subscription
            const basicPlan = await transactionPrisma.plan.findFirst({
              where: { name: "Self-Service" },
            });

            if (basicPlan) {
              await transactionPrisma.subscription.create({
                data: {
                  employerId: employer.id,
                  planId: basicPlan.id,
                  status: "ACTIVE",
                  startDate: new Date(),
                },
              });
              console.log("Assigned basic subscription to employer");
            }

            profileData = employer;
          } else if (userData.role === "BRANCH_ADMIN") {
            profileData = await transactionPrisma.branchAdmin.create({
              data: {
                userId: userData.id,
                assignedCityId: userData.cityId,
              },
            });
          }
        }

        return { user: updatedUser, profileData };
      });

      // Generate JWT token for successful registration
      let token = null;
      if (!userData.isVerified) {
        token = jwt.sign(
          {
            userId: result.user.id,
            role: result.user.role,
            email: result.user.email,
            phone: result.user.phone,
          },
          process.env.JWT_SECRET,
          { expiresIn: "30d" },
        );
      }

      // Clean up temporary storage
      if (userData.role === "EMPLOYER") {
        // This would be handled by frontend, but we can log it
        console.log("Registration completed - temporary company data should be cleared from frontend");
      }

      // Determine response message and status
      const responseMessage = userData.isVerified
        ? "Account verification completed"
        : "Registration completed successfully";

      const statusCode = userData.isVerified ? 200 : 201;

      res.status(statusCode).json(
        createResponse(responseMessage, {
          user: {
            id: result.user.id,
            name: result.user.name,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            email: result.user.email,
            phone: result.user.phone,
            role: result.user.role,
            isVerified: result.user.isVerified,
            isActive: result.user.isActive,
          },
          ...(token && { token }),
          ...(result.profileData && { profile: result.profileData }),
        }),
      );
    } catch (error) {
      console.error("OTP verification error:", error);
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
        return res.status(404).json(createErrorResponse("User not found", 404));
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
        await sendEmail("PASSWORD_RESET_OTP", email, {
          username: user.name,
          appName: "LokalHunt",
          otp: otp,
        });
      } catch (emailError) {
        console.error("Failed to send password reset OTP email:", emailError);
        return res
          .status(500)
          .json(
            createErrorResponse("Failed to send password reset OTP email", 500),
          );
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

  // Forgot Password via Mobile - Send OTP
  async forgotPasswordMobile(req, res, next) {
    try {
      const { phone } = req.body;

      if (!phone) {
        return res
          .status(400)
          .json(createErrorResponse("Phone number is required", 400));
      }

      // Find user by phone number
      const user = await prisma.user.findFirst({
        where: { phone },
      });

      if (!user) {
        return res
          .status(404)
          .json(
            createErrorResponse("User not found with this phone number", 404),
          );
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

      // Send OTP SMS for password reset
      try {
        console.log(
          `Forgot password OTP generated: ${otp} for phone: ${phone}`,
        );
        const smsResult = await sendOTPSMS(phone, "forgot_password_otp", {
          otp,
          name: user.name,
        });

        if (!smsResult.success) {
          throw new Error(smsResult.error);
        } else {
          console.log("Forgot password OTP SMS result:", smsResult.message);
        }
      } catch (smsError) {
        console.error("Failed to send password reset OTP SMS:", smsError);
        return res
          .status(500)
          .json(
            createErrorResponse("Failed to send password reset OTP SMS", 500),
          );
      }

      res.status(200).json(
        createResponse("Password reset OTP sent successfully", {
          message: "OTP has been sent to your phone for password reset",
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  // Reset Password with OTP
  async resetPasswordWithOTP(req, res, next) {
    try {
      const {
        email,
        phone, // Added phone number to the request body for lookup
        otp,
        password,
        confirmPassword,
      } = req.body;

      // Validation
      if ((!email && !phone) || !otp || !password || !confirmPassword) {
        return res
          .status(400)
          .json(
            createErrorResponse(
              "Phone number, verification code, and passwords are required",
              400,
            ),
          );
      }

      if (password !== confirmPassword) {
        return res
          .status(400)
          .json(createErrorResponse("Passwords do not match", 400));
      }

      if (!isValidOTPFormat(otp)) {
        return res
          .status(400)
          .json(
            createErrorResponse(
              "Please enter a valid 6-digit verification code",
              400,
            ),
          );
      }

      if (password.length < 6) {
        return res
          .status(400)
          .json(
            createErrorResponse(
              "Password must be at least 6 characters long",
              400,
            ),
          );
      }

      // Find user by phone first, then by email if phone not provided
      let user;
      if (phone) {
        user = await prisma.user.findFirst({
          where: { phone },
        });
      } else if (email) {
        user = await prisma.user.findUnique({
          where: { email },
        });
      }

      if (!user) {
        return res.status(404).json(createErrorResponse("User not found", 404));
      }

      // Validate OTP
      if (user.otp !== otp) {
        return res
          .status(400)
          .json(
            createErrorResponse(
              "Invalid OTP. Please check your verification code and try again.",
              400,
            ),
          );
      }

      if (isOTPExpired(user.otpExpiresAt)) {
        return res
          .status(400)
          .json(
            createErrorResponse(
              "OTP has expired. Please request a new verification code.",
              400,
            ),
          );
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
          message:
            "Your password has been reset successfully and your account is now verified",
          user: updatedUser,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  // Reset Password with Mobile OTP
  async resetPasswordWithMobileOTP(req, res, next) {
    try {
      const { phone, otp, password, confirmPassword } = req.body;

      // Validation
      if (!phone || !otp || !password || !confirmPassword) {
        return res
          .status(400)
          .json(
            createErrorResponse(
              "Phone, OTP, password, and confirm password are required",
              400,
            ),
          );
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
          .json(
            createErrorResponse(
              "Password must be at least 6 characters long",
              400,
            ),
          );
      }

      // Find user by phone
      const user = await prisma.user.findFirst({
        where: { phone },
      });

      if (!user) {
        return res
          .status(404)
          .json(
            createErrorResponse("User not found with this phone number", 404),
          );
      }

      // Validate OTP
      if (user.otp !== otp) {
        return res.status(400).json(createErrorResponse("Invalid OTP", 400));
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
          message:
            "Your password has been reset successfully and your account is now verified",
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
      const { email, phone } = req.body; // Allow resending OTP to email or phone

      if (!email && !phone) {
        return res
          .status(400)
          .json(createErrorResponse("Email or phone number is required", 400));
      }

      // Find user by phone or email
      let user;
      if (phone) {
        user = await prisma.user.findFirst({ where: { phone } });
      } else if (email) {
        user = await prisma.user.findUnique({ where: { email } });
      }

      if (!user) {
        return res.status(404).json(createErrorResponse("User not found", 404));
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

      // Determine the recipient and template based on provided identifier
      let sendResult = { success: false };
      if (phone) {
        console.log(`Resend OTP generated: ${otp} for phone: ${phone}`);
        sendResult = await sendOTPSMS(
          phone,
          user.isVerified ? "forgot_password_otp" : "register_otp",
          {
            otp,
            name: user.name,
          },
        );
        if (!sendResult.success) {
          console.error("Failed to send OTP SMS:", sendResult.error);
        } else {
          console.log("Resend OTP SMS result:", sendResult.message);
        }
      } else if (email) {
        const emailTemplate = user.isVerified
          ? "PASSWORD_RESET_OTP"
          : "OTP_VERIFICATION";
        sendResult = await sendEmail(emailTemplate, email, {
          username: user.name,
          appName: "LokalHunt",
          otp: otp,
        });
        if (!sendResult.success) {
          console.error("Failed to send OTP email:", sendResult.error);
        }
      }

      if (!sendResult.success) {
        return res
          .status(500)
          .json(createErrorResponse("Failed to send OTP", 500));
      }

      res.status(200).json(
        createResponse("OTP sent successfully", {
          message:
            "New OTP has been sent to your registered phone number or email",
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  // Login user
  async login(req, res, next) {
    try {
      const { email, password, phone } = req.body; // Allow login with email or phone

      // Validation
      if ((!email && !phone) || !password) {
        return res
          .status(400)
          .json(
            createErrorResponse(
              "Email or phone number and password are required",
              400,
            ),
          );
      }

      // Find user by phone or email
      let user;
      if (phone) {
        user = await prisma.user.findFirst({
          where: { phone },
          include: {
            candidate: true,
            employer: true,
            branchAdmin: true,
            city: true,
          },
        });
      } else if (email) {
        user = await prisma.user.findUnique({
          where: { email },
          include: {
            candidate: true,
            employer: true,
            branchAdmin: true,
            city: true,
          },
        });
      }

      if (!user) {
        return res
          .status(401)
          .json(createErrorResponse("Invalid credentials", 401));
      }

      // Check if user is verified
      if (!user.isVerified) {
        return res
          .status(403)
          .json(
            createErrorResponse(
              "Please verify your account before logging in",
              403,
            ),
          );
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
      const { passwordHash, otp, otpExpiresAt, ...userWithoutSensitiveData } =
        user;

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

      res.json(createResponse("Profile retrieved successfully", user));
    } catch (error) {
      next(error);
    }
  }

  // Store device token for push notifications
  async storeDeviceToken(req, res, next) {
    try {
      const userId = req.user.userId;
      const { deviceToken, platform } = req.body;

      if (!deviceToken) {
        return res.status(400).json({
          success: false,
          message: "Device token is required"
        });
      }

      console.log(`📱 Storing device token for user ${userId}:`, {
        token: `${deviceToken.slice(0, 20)}...`,
        platform: platform || 'unknown'
      });

      // Get user info for welcome notification
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          firstName: true,
          deviceToken: true
        }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      // Update user with device token
      await prisma.user.update({
        where: { id: userId },
        data: {
          deviceToken: deviceToken,
          devicePlatform: platform || 'unknown'
        }
      });

      // Send welcome notification if this is a new token
      if (user.deviceToken !== deviceToken) {
        try {
          const notificationController = require('./notificationController');
          await notificationController.sendWelcomeNotification(
            userId,
            deviceToken,
            user.firstName || user.name
          );
        } catch (notificationError) {
          console.error('❌ Failed to send welcome notification:', notificationError);
          // Don't fail the token storage if notification fails
        }
      }

      res.json({
        success: true,
        message: "Device token stored successfully",
        data: {
          message: "Push notifications are now enabled",
          tokenStored: true
        }
      });
    } catch (error) {
      console.error("Device token storage error:", error);
      next(error);
    }
  }
}

module.exports = new AuthController();
