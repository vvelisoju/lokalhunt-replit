const { createResponse, createErrorResponse } = require("../utils/response");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class AuthController {
  // Register new user
  async register(req, res, next) {
    try {
      const {
        name,
        firstName,
        lastName,
        email,
        phone,
        password,
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
      if (!fullName || !email || !password) {
        return res
          .status(400)
          .json(
            createErrorResponse(
              "Name (or firstName/lastName), email and password are required",
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

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Use cityId from request, fallback to city if provided as UUID
      const userCityId = cityId || city;

      // Create user
      const user = await prisma.user.create({
        data: {
          name: fullName,
          firstName,
          lastName,
          email,
          phone,
          passwordHash,
          role,
          cityId: userCityId,
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
          createdAt: true,
        },
      });

      // Create role-specific profile
      if (role === "CANDIDATE") {
        await prisma.candidate.create({
          data: { userId: user.id },
        });
      } else if (role === "EMPLOYER") {
        // Create employer profile
        const employer = await prisma.employer.create({
          data: {
            userId: user.id,
            contactDetails: contactDetails || null,
            isVerified: false,
          },
        });

        // Create company if provided
        let company = null;
        if (companyName) {
          company = await prisma.company.create({
            data: {
              employerId: employer.id,
              name: companyName,
              description: companyDescription || null,
              cityId: userCityId,
              industry: industry || null,
              size: companySize || null,
              website: website || null,
              isDefault: true, // Set as default since this is the first company during registration
            },
            include: {
              city: true,
            },
          });
        }

        // Assign basic subscription (Self-Service plan)
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
      } else if (role === "BRANCH_ADMIN") {
        await prisma.branchAdmin.create({
          data: {
            userId: user.id,
            assignedCityId: cityId,
          },
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || "lokalhunt-secret",
        { expiresIn: "7d" },
      );

      res.status(201).json(
        createResponse("User registered successfully", {
          user,
          token,
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
      const { passwordHash, ...userWithoutPassword } = user;

      res.json(
        createResponse("Login successful", {
          user: userWithoutPassword,
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

      const { passwordHash, ...userWithoutPassword } = user;

      res.json(
        createResponse("Profile retrieved successfully", userWithoutPassword),
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
