const springedge = require("springedge");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 * Send OTP SMS using SpringEdge
 * @param {string} to - Phone number to send SMS to
 * @param {string} templateName - SMS template name
 * @param {object} variables - Variables to replace in template
 * @returns {object} - Success/error response
 */
const sendOTPSMS = async (to, templateName, variables = {}) => {
  try {
    // Validate input
    if (!to || !templateName) {
      throw new Error("Phone number and template name are required");
    }

    // Check environment mode
    const environment = process.env.ENVIRONMENT || 'dev';
    
    if (environment === 'dev') {
      console.log(`DEV MODE: Skipping SMS send to ${to}. Using default OTP: 222222`);
      return {
        success: true,
        message: "SMS skipped in development mode",
        data: {
          mode: 'development',
          defaultOtp: '222222',
          to: to,
          template: templateName
        },
      };
    }

    // Production mode - proceed with actual SMS sending
    console.log(`PROD MODE: Sending SMS to ${to} using template '${templateName}'`);

    // Check if SpringEdge API key is configured
    const apiKey = process.env.SPRING_EDGE_API_KEY_ID;
    if (!apiKey) {
      console.warn("SpringEdge API key not configured, skipping SMS");
      return {
        success: false,
        error: "SMS service not configured",
      };
    }

    // Get SMS template from database
    const template = await prisma.smsTemplate.findUnique({
      where: { templateName },
    });

    if (!template) {
      throw new Error(`SMS template '${templateName}' not found`);
    }

    // Replace variables in template message
    let message = template.message;
    Object.keys(variables).forEach((key) => {
      const placeholder = `{{${key.toUpperCase()}}}`;
      message = message.replace(new RegExp(placeholder, "g"), variables[key]);
    });

    // Send SMS using SpringEdge
    const response = await sendSMS(to, message);

    console.log(
      `SMS sent successfully to ${to} using template '${templateName}'`,
    );

    return {
      success: true,
      message: "SMS sent successfully",
      data: response,
    };
  } catch (error) {
    console.error("Error sending OTP SMS:", error);
    return {
      success: false,
      error: error.message || "Failed to send SMS",
    };
  }
};

/**
 * Send SMS using SpringEdge API
 * @param {string} to - Phone number to send SMS to
 * @param {string} message - Message content
 * @returns {Promise} - SpringEdge API response
 */
const sendSMS = async (to, message) => {
  try {
    const apiKey = process.env.SPRING_EDGE_API_KEY_ID;

    if (!apiKey) {
      throw new Error("SpringEdge API key not configured");
    }

    // Ensure phone number is in correct format
    let formattedPhone = to.replace(/\D/g, ""); // Remove non-digits
    if (formattedPhone.length === 10) {
      formattedPhone = "91" + formattedPhone; // Add country code for India
    }

    // SpringEdge SMS configuration
    const smsConfig = {
      apikey: apiKey,
      sender: "CODVEL", // Replace with your approved sender ID
      to: [formattedPhone],
      message: message,
      format: "json",
    };
    console.log("SpringEdge SMS config:", smsConfig);
    // Send SMS using SpringEdge
    return new Promise((resolve, reject) => {
      springedge.messages.send(smsConfig, 5000, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  } catch (error) {
    console.error("SpringEdge SMS error:", error);
    throw error;
  }
};

module.exports = {
  sendOTPSMS,
  sendSMS,
};
