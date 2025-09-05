/**
 * Create a standardized success response
 * @param {string} message - Success message
 * @param {*} data - Response data
 * @param {Object} meta - Additional metadata (pagination, etc.)
 * @returns {Object} Formatted response object
 */
const createResponse = (message, data = null, meta = null) => {
  const response = {
    status: 'success',
    message,
    timestamp: new Date().toISOString()
  };

  if (data !== null) {
    response.data = data;
  }

  if (meta !== null) {
    response.meta = meta;
  }

  // Log response creation for notifications
  if (message.includes('Notifications retrieved')) {
    console.log('🔔 createResponse for notifications:', {
      status: response.status,
      message: response.message,
      dataKeys: data ? Object.keys(data) : 'null',
      notificationsCount: data?.notifications?.length
    });
  }

  return response;
};

/**
 * Create a standardized error response
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {Object} details - Additional error details
 * @returns {Object} Formatted error response object
 */
const createErrorResponse = (message, statusCode = 500, details = null) => {
  const response = {
    status: 'error',
    message,
    statusCode,
    timestamp: new Date().toISOString()
  };

  if (details !== null) {
    response.details = details;
  }

  return response;
};

/**
 * Create a paginated response
 * @param {Array} data - Array of data items
 * @param {Object} pagination - Pagination info
 * @param {string} message - Success message
 * @returns {Object} Formatted paginated response
 */
const createPaginatedResponse = (data, pagination, message = 'Data retrieved successfully') => {
  return createResponse(message, data, { pagination });
};

module.exports = {
  createResponse,
  createErrorResponse,
  createPaginatedResponse
};