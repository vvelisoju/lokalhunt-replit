const { createResponse, createErrorResponse } = require('../utils/response');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
        role = 'CANDIDATE',
        cityId 
      } = req.body;

      // Build full name from firstName/lastName if name not provided
      const fullName = name || (firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName);

      // Debug logging
      console.log('Registration request body:', req.body);
      console.log('Computed fullName:', fullName);

      // Validation
      if (!fullName || !email || !password) {
        return res.status(400).json(
          createErrorResponse('Name (or firstName/lastName), email and password are required', 400)
        );
      }

      // Check if user already exists
      const existingUser = await req.prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(409).json(
          createErrorResponse('User with this email already exists', 409)
        );
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create user
      const user = await req.prisma.user.create({
        data: {
          name: fullName,
          firstName,
          lastName,
          email,
          phone,
          passwordHash,
          role,
          cityId
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
          createdAt: true
        }
      });

      // Create role-specific profile
      if (role === 'CANDIDATE') {
        await req.prisma.candidate.create({
          data: { userId: user.id }
        });
      } else if (role === 'EMPLOYER') {
        await req.prisma.employer.create({
          data: { userId: user.id }
        });
      } else if (role === 'BRANCH_ADMIN') {
        await req.prisma.branchAdmin.create({
          data: { 
            userId: user.id,
            assignedCityId: cityId
          }
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || 'lokalhunt-secret',
        { expiresIn: '7d' }
      );

      res.status(201).json(createResponse('User registered successfully', {
        user,
        token
      }));
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
        return res.status(400).json(
          createErrorResponse('Email and password are required', 400)
        );
      }

      // Find user
      const user = await req.prisma.user.findUnique({
        where: { email },
        include: {
          candidate: true,
          employer: true,
          branchAdmin: true,
          cityRef: true
        }
      });

      if (!user) {
        return res.status(401).json(
          createErrorResponse('Invalid credentials', 401)
        );
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json(
          createErrorResponse('Invalid credentials', 401)
        );
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(403).json(
          createErrorResponse('Account is deactivated', 403)
        );
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || 'lokalhunt-secret',
        { expiresIn: '7d' }
      );

      // Remove password from response
      const { passwordHash, ...userWithoutPassword } = user;

      res.json(createResponse('Login successful', {
        user: userWithoutPassword,
        token
      }));
    } catch (error) {
      next(error);
    }
  }

  // Get current user profile
  async getProfile(req, res, next) {
    try {
      const user = await req.prisma.user.findUnique({
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
              mous: true
            }
          },
          branchAdmin: {
            include: {
              assignedCity: true
            }
          },
          cityRef: true
        }
      });

      if (!user) {
        return res.status(404).json(
          createErrorResponse('User not found', 404)
        );
      }

      const { passwordHash, ...userWithoutPassword } = user;

      res.json(createResponse('Profile retrieved successfully', userWithoutPassword));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();