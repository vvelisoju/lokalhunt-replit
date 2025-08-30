
/**
 * Replace placeholders in template string with actual values
 * @param {string} template - Template string with {{placeholder}} format
 * @param {object} data - Object containing key-value pairs for replacement
 * @returns {string} - Template string with placeholders replaced
 */
const replacePlaceholders = (template, data) => {
  if (!template || !data) return template;
  
  let result = template;
  
  // Replace all {{key}} patterns with corresponding values from data
  Object.keys(data).forEach(key => {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(placeholder, data[key] || '');
  });
  
  return result;
};

/**
 * Validate email address format
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Format multiple email addresses
 * @param {string|array} emails - Single email or array of emails
 * @returns {array} - Array of valid email addresses
 */
const formatEmailList = (emails) => {
  if (!emails) return [];
  
  const emailArray = Array.isArray(emails) ? emails : [emails];
  return emailArray.filter(email => email && isValidEmail(email));
};

module.exports = {
  replacePlaceholders,
  isValidEmail,
  formatEmailList
};
