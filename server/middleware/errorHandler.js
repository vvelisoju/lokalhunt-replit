const { createErrorResponse } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Prisma errors
  if (err.code) {
    switch (err.code) {
      case 'P2002':
        return res.status(409).json(
          createErrorResponse('Duplicate entry. This record already exists.', 409)
        );
      case 'P2025':
        return res.status(404).json(
          createErrorResponse('Record not found.', 404)
        );
      case 'P2003':
        return res.status(400).json(
          createErrorResponse('Foreign key constraint failed.', 400)
        );
      case 'P2014':
        return res.status(400).json(
          createErrorResponse('Invalid ID provided.', 400)
        );
      default:
        return res.status(500).json(
          createErrorResponse('Database error occurred.', 500)
        );
    }
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json(
      createErrorResponse('Validation failed', 400, {
        details: err.message
      })
    );
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(
      createErrorResponse('Invalid token', 401)
    );
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(
      createErrorResponse('Token expired', 401)
    );
  }

  // Syntax errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json(
      createErrorResponse('Invalid JSON format', 400)
    );
  }

  // Default error
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json(
    createErrorResponse(
      message,
      statusCode,
      process.env.NODE_ENV === 'development' ? { stack: err.stack } : undefined
    )
  );
};

module.exports = errorHandler;
