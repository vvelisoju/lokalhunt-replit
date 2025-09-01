
const crypto = require('crypto');

/**
 * Generate 6-digit OTP
 * @returns {string} - 6-digit OTP
 */
const generateOTP = () => {
  const environment = process.env.ENVIRONMENT || 'dev';
  
  if (environment === 'dev') {
    console.log('DEV MODE: Using default OTP: 222222');
    return '222222';
  }
  
  // Production mode - generate random OTP
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Calculate OTP expiration time (5 minutes from now)
 * @returns {Date} - Expiration date
 */
const getOTPExpiration = () => {
  return new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
};

/**
 * Check if OTP is expired
 * @param {Date} expiresAt - OTP expiration date
 * @returns {boolean} - True if expired
 */
const isOTPExpired = (expiresAt) => {
  return !expiresAt || new Date() > expiresAt;
};

/**
 * Validate OTP format (6 digits)
 * @param {string} otp - OTP to validate
 * @returns {boolean} - True if valid format
 */
const isValidOTPFormat = (otp) => {
  return /^\d{6}$/.test(otp);
};

module.exports = {
  generateOTP,
  getOTPExpiration,
  isOTPExpired,
  isValidOTPFormat
};
