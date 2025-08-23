const jwt = require('jsonwebtoken');
const { createErrorResponse } = require('../utils/response');

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json(
      createErrorResponse('Access token required', 401)
    );
  }

  jwt.verify(token, process.env.JWT_SECRET || 'lokalhunt-secret', (err, decoded) => {
    if (err) {
      return res.status(403).json(
        createErrorResponse('Invalid or expired token', 403)
      );
    }

    req.user = decoded;
    next();
  });
};

// Middleware to check user role
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(
        createErrorResponse('Authentication required', 401)
      );
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json(
        createErrorResponse('Insufficient permissions', 403)
      );
    }

    next();
  };
};

// Optional authentication (sets req.user if token is present but doesn't require it)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET || 'lokalhunt-secret', (err, decoded) => {
    if (!err) {
      req.user = decoded;
    }
    next();
  });
};

// Enhanced role middleware for unified endpoints (supports Branch Admin access to Employer data)
const requireRoleOrAdminAccess = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(
        createErrorResponse('Authentication required', 401)
      );
    }

    const userRole = req.user.role;
    
    // Get employerId from various sources
    const employerIdFromQuery = req.query.employerId;
    const employerIdFromBody = req.body.employerId;
    const employerIdFromParams = req.params.employerId;
    const targetEmployerId = employerIdFromParams || employerIdFromQuery || employerIdFromBody;

    console.log(`[AUTH DEBUG] User: ${req.user.userId}, Role: ${userRole}, AllowedRoles: [${allowedRoles.join(', ')}], TargetEmployerId: ${targetEmployerId}`);

    // For Branch Admin accessing employer data via employerId parameter
    if (userRole === 'BRANCH_ADMIN' && targetEmployerId) {
      console.log(`[AUTH DEBUG] Branch Admin accessing employer ${targetEmployerId}`);
      req.targetEmployerId = targetEmployerId;
      req.isAdminAccess = true;
      return next();
    }

    // Check if user has direct role access
    if (allowedRoles.includes(userRole)) {
      // For regular employers, they can only access their own data
      if (userRole === 'EMPLOYER') {
        req.targetEmployerId = req.user.employerId || req.user.userId;
        req.isAdminAccess = false;
        console.log(`[AUTH DEBUG] Employer accessing own data: ${req.targetEmployerId}`);
        return next();
      }
      // For Branch Admin accessing their own branch admin data
      else if (userRole === 'BRANCH_ADMIN') {
        req.isAdminAccess = false;
        console.log(`[AUTH DEBUG] Branch Admin accessing own admin data`);
        return next();
      }
      // For other roles with direct access
      else {
        console.log(`[AUTH DEBUG] Other role accessing with direct permission`);
        return next();
      }
    }

    console.log(`[AUTH DEBUG] Access denied - Role ${userRole} not in allowed roles [${allowedRoles.join(', ')}]`);
    return res.status(403).json(
      createErrorResponse('Insufficient permissions', 403)
    );
  };
};

module.exports = {
  authenticateToken,
  requireRole,
  requireRoleOrAdminAccess,
  optionalAuth
};