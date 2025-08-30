const SibApiV3Sdk = require('sib-api-v3-sdk');
const { PrismaClient } = require('@prisma/client');
const { replacePlaceholders, formatEmailList, isValidEmail } = require('../utils/emailUtils');
const crypto = require('crypto');

const prisma = new PrismaClient();

// In-memory OTP storage (in production, use Redis or database)
const otpStore = new Map();

// Initialize Brevo API client following official documentation
const createBrevoClient = () => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error('BREVO_API_KEY environment variable is required');
  }

  try {
    // Follow the exact pattern from Brevo documentation
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    
    // Instantiate the client
    const apikey = defaultClient.authentications['api-key'];
    apikey.apiKey = apiKey;
    
    // Create API instance
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    
    return apiInstance;
    
  } catch (error) {
    console.error('Error creating Brevo client:', error);
    throw error;
  }
};

/**
 * Generate 6-digit OTP
 * @returns {string} - 6-digit OTP
 */
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Store OTP with expiration (5 minutes)
 * @param {string} email - Email address
 * @param {string} otp - Generated OTP
 */
const storeOTP = (email, otp) => {
  const expiresAt = Date.now() + (5 * 60 * 1000); // 5 minutes
  otpStore.set(email.toLowerCase(), { otp, expiresAt });

  // Clean up expired OTPs periodically
  setTimeout(() => {
    const stored = otpStore.get(email.toLowerCase());
    if (stored && stored.expiresAt <= Date.now()) {
      otpStore.delete(email.toLowerCase());
    }
  }, 5 * 60 * 1000);
};

/**
 * Verify OTP
 * @param {string} email - Email address
 * @param {string} otp - OTP to verify
 * @returns {boolean} - True if valid
 */
const verifyOTP = (email, otp) => {
  const stored = otpStore.get(email.toLowerCase());

  if (!stored) {
    return false; // No OTP found
  }

  if (stored.expiresAt <= Date.now()) {
    otpStore.delete(email.toLowerCase());
    return false; // OTP expired
  }

  if (stored.otp === otp) {
    otpStore.delete(email.toLowerCase()); // Remove OTP after successful verification
    return true;
  }

  return false; // Invalid OTP
};

/**
 * Send email using template and placeholder data
 * @param {string} emailType - Type of email template to use
 * @param {string} to - Recipient email address
 * @param {object} placeholderData - Data to replace placeholders in template
 * @param {array} cc - Optional CC email addresses
 * @returns {object} - Success/error response
 */
const sendEmail = async (emailType, to, placeholderData = {}, cc = []) => {
  try {
    // Validate required parameters
    if (!emailType || !to) {
      throw new Error('Email type and recipient address are required');
    }

    if (!isValidEmail(to)) {
      throw new Error('Invalid recipient email address');
    }

    // Find email template by type using Prisma
    const template = await prisma.emailTemplate.findUnique({
      where: { type: emailType }
    });

    if (!template) {
      throw new Error(`Email template not found for type: ${emailType}`);
    }

    // Replace placeholders in subject and body
    const subject = replacePlaceholders(template.subject, placeholderData);
    const body = replacePlaceholders(template.body, placeholderData);

    // Format CC email list
    const ccEmails = formatEmailList(cc);

    // Create Brevo API client
    const apiInstance = createBrevoClient();

    // Prepare email data for Brevo
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    // Set sender - using a more reliable sender email
    sendSmtpEmail.sender = {
      name: process.env.EMAIL_FROM_NAME || 'LokalHunt Team',
      email: process.env.EMAIL_FROM || 'no-reply@brevo.com'
    };
    
    // Add reply-to for better deliverability
    sendSmtpEmail.replyTo = {
      name: 'LokalHunt Support',
      email: 'support@lokalhunt.com'
    };

    // Set recipient
    sendSmtpEmail.to = [{ email: to }];

    // Set CC if provided
    if (ccEmails.length > 0) {
      sendSmtpEmail.cc = ccEmails.map(email => ({ email }));
    }

    // Set subject and HTML content
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = body;

    // Add tags for tracking (optional)
    sendSmtpEmail.tags = [emailType, 'lokalhunt'];

    // Send email via Brevo API
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log('Email sent successfully via Brevo:', {
      messageId: result.messageId,
      to: to,
      subject: subject,
      emailType: emailType
    });

    return {
      success: true,
      messageId: result.messageId,
      message: 'Email sent successfully via Brevo'
    };

  } catch (error) {
    console.error('Brevo email sending failed:', error);

    // Handle Brevo API specific errors
    let errorMessage = error.message;
    if (error.response && error.response.body) {
      errorMessage = error.response.body.message || errorMessage;
    }

    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Create or update email template
 * @param {object} templateData - Template data (type, subject, body)
 * @returns {object} - Success/error response
 */
const createOrUpdateTemplate = async (templateData) => {
  try {
    const { type, subject, body } = templateData;

    if (!type || !subject || !body) {
      throw new Error('Type, subject, and body are required');
    }

    // Use Prisma upsert to create or update template
    const template = await prisma.emailTemplate.upsert({
      where: { type },
      update: { 
        subject, 
        body,
        updatedAt: new Date()
      },
      create: { 
        type, 
        subject, 
        body 
      }
    });

    return {
      success: true,
      template,
      message: 'Email template saved successfully'
    };

  } catch (error) {
    console.error('Template creation/update failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get all email templates
 * @returns {object} - Success/error response with templates
 */
const getTemplates = async () => {
  try {
    const templates = await prisma.emailTemplate.findMany({
      orderBy: { type: 'asc' }
    });

    return {
      success: true,
      templates,
      count: templates.length
    };
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get email template by type
 * @param {string} type - Template type
 * @returns {object} - Success/error response with template
 */
const getTemplateByType = async (type) => {
  try {
    const template = await prisma.emailTemplate.findUnique({
      where: { type }
    });

    if (!template) {
      return {
        success: false,
        error: `Template not found for type: ${type}`
      };
    }

    return {
      success: true,
      template
    };
  } catch (error) {
    console.error('Failed to fetch template:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Handle send email API request
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const handleSendEmail = async (req, res) => {
  try {
    const { emailType, to, placeholderData, cc } = req.body;

    const result = await sendEmail(emailType, to, placeholderData, cc);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }

  } catch (error) {
    console.error('Send email API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Handle create/update template API request
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const handleCreateTemplate = async (req, res) => {
  try {
    const result = await createOrUpdateTemplate(req.body);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }

  } catch (error) {
    console.error('Create template API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Handle get templates API request
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const handleGetTemplates = async (req, res) => {
  try {
    const result = await getTemplates();

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }

  } catch (error) {
    console.error('Get templates API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Handle get template by type API request
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const handleGetTemplateByType = async (req, res) => {
  try {
    const { type } = req.params;
    const result = await getTemplateByType(type);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }

  } catch (error) {
    console.error('Get template by type API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Send OTP to email address
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const handleSendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Valid email address is required'
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // Store OTP
    storeOTP(email, otp);

    // Send OTP via email
    const result = await sendEmail('OTP_VERIFICATION', email, { 
      otp,
      email 
    });

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
        data: {
          email,
          expiresIn: 300 // 5 minutes in seconds
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Failed to send OTP email'
      });
    }

  } catch (error) {
    console.error('Send OTP API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Verify OTP
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const handleVerifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Email and OTP are required'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Valid email address is required'
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        error: 'OTP must be 6 digits'
      });
    }

    const isValid = verifyOTP(email, otp);

    if (isValid) {
      res.status(200).json({
        success: true,
        message: 'OTP verified successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid or expired OTP'
      });
    }

  } catch (error) {
    console.error('Verify OTP API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

module.exports = {
  sendEmail,
  createOrUpdateTemplate,
  getTemplates,
  getTemplateByType,
  handleSendEmail,
  handleCreateTemplate,
  handleGetTemplates,
  handleGetTemplateByType,
  handleSendOTP,
  handleVerifyOTP,
  generateOTP,
  storeOTP,
  verifyOTP
};