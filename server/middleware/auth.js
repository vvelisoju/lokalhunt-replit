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

module.exports = {
  authenticateToken,
  requireRole,
  optionalAuth
};