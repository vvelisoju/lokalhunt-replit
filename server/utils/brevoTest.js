
const { sendEmail, createOrUpdateTemplate } = require('../controllers/emailController');

/**
 * Test Brevo integration by sending a test email
 * @param {string} testEmail - Email address to send test to
 * @returns {object} - Test result
 */
const testBrevoIntegration = async (testEmail) => {
  try {
    // First, ensure TEST template exists
    const testTemplate = {
      type: 'TEST',
      subject: 'Test Email - {{appName}}',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #007bff; text-align: center;">Test Email</h2>
          <p>Hello {{username}},</p>
          <p>This is a test email to verify that your email integration is working correctly.</p>
          <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #c3e6cb;">
            <h3 style="margin-top: 0; color: #155724;">Test Details:</h3>
            <p><strong>Sent At:</strong> {{timestamp}}</p>
            <p><strong>Test ID:</strong> {{testId}}</p>
            <p><strong>Integration:</strong> Brevo API</p>
          </div>
          <p>If you receive this email, your email system is configured correctly!</p>
          <p>Best regards,<br>{{appName}} Team</p>
        </div>
      `
    };

    // Create or update the TEST template
    await createOrUpdateTemplate(testTemplate);

    // Prepare test data
    const placeholderData = {
      username: 'Test User',
      appName: 'LokalHunt',
      timestamp: new Date().toLocaleString(),
      testId: Math.random().toString(36).substr(2, 9).toUpperCase()
    };

    // Send test email
    const result = await sendEmail('TEST', testEmail, placeholderData);

    return result;

  } catch (error) {
    console.error('Brevo test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  testBrevoIntegration
};
