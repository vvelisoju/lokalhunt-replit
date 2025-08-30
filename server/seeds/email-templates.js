const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Default email templates
const defaultTemplates = [
  {
    type: 'OTP_VERIFICATION',
    subject: 'Complete Your Registration - {{appName}}',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #333; margin-bottom: 10px;">Complete Your Registration</h2>
          <p style="color: #666; margin: 0;">Welcome to {{appName}}!</p>
        </div>

        <p>Hello {{username}},</p>
        <p>Thank you for joining {{appName}}. To complete your registration and secure your account, please use the verification code below:</p>

        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; text-align: center; margin: 30px 0; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <p style="color: white; margin: 0 0 10px 0; font-size: 14px; opacity: 0.9;">Your Verification Code</p>
          <h1 style="color: white; margin: 0; font-size: 36px; letter-spacing: 8px; font-weight: bold;">{{otp}}</h1>
        </div>

        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <p style="margin: 0; color: #856404; font-size: 14px;">
            <strong>Important:</strong> This code will expire in 5 minutes for your security.
          </p>
        </div>

        <p>Enter this code on the verification page along with your password to complete your registration.</p>

        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          If you didn't create an account with {{appName}}, please ignore this email or contact our support team if you have concerns.
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          Best regards,<br>
          The {{appName}} Team
        </p>
      </div>
    `
  },
  {
    type: 'JOB_APPLIED',
    subject: 'Application Received - {{jobTitle}}',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Application Received</h2>
        <p>Dear {{candidateName}},</p>
        <p>Thank you for applying to the position of <strong>{{jobTitle}}</strong> at <strong>{{companyName}}</strong>.</p>
        <p>We have received your application and our team will review it shortly. You will be notified about the next steps within {{reviewTime}} business days.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #495057;">Application Details:</h3>
          <p><strong>Position:</strong> {{jobTitle}}</p>
          <p><strong>Company:</strong> {{companyName}}</p>
          <p><strong>Applied Date:</strong> {{appliedDate}}</p>
          <p><strong>Application ID:</strong> {{applicationId}}</p>
        </div>
        <p>Thank you for your interest in working with us.</p>
        <p>Best regards,<br>{{companyName}} Hiring Team</p>
      </div>
    `
  },
  {
    type: 'SHORTLISTED',
    subject: 'Congratulations! You\'ve been shortlisted - {{jobTitle}}',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #28a745;">Congratulations! You've been shortlisted</h2>
        <p>Dear {{candidateName}},</p>
        <p>We are pleased to inform you that you have been shortlisted for the position of <strong>{{jobTitle}}</strong> at <strong>{{companyName}}</strong>.</p>
        <p>{{nextSteps}}</p>
        <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #c3e6cb;">
          <h3 style="margin-top: 0; color: #155724;">Next Steps:</h3>
          <p>{{interviewDetails}}</p>
        </div>
        <p>Please reply to this email to confirm your availability or if you have any questions.</p>
        <p>We look forward to meeting you!</p>
        <p>Best regards,<br>{{companyName}} Hiring Team</p>
      </div>
    `
  },
  {
    type: 'INTERVIEW_SCHEDULED',
    subject: 'Interview Scheduled - {{jobTitle}} at {{companyName}}',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #007bff;">Interview Scheduled</h2>
        <p>Dear {{candidateName}},</p>
        <p>Your interview has been scheduled for the position of <strong>{{jobTitle}}</strong> at <strong>{{companyName}}</strong>.</p>
        <div style="background-color: #e3f2fd; padding: 20px; border-radius: 5px; margin: 20px 0; border: 1px solid #bbdefb;">
          <h3 style="margin-top: 0; color: #0d47a1;">Interview Details:</h3>
          <p><strong>Date:</strong> {{interviewDate}}</p>
          <p><strong>Time:</strong> {{interviewTime}}</p>
          <p><strong>Duration:</strong> {{duration}}</p>
          <p><strong>Location/Link:</strong> {{location}}</p>
          <p><strong>Interviewer:</strong> {{interviewer}}</p>
          <p><strong>Interview Type:</strong> {{interviewType}}</p>
        </div>
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #ffeaa7;">
          <h3 style="margin-top: 0; color: #856404;">Please bring/prepare:</h3>
          <p>{{requirements}}</p>
        </div>
        <p>If you need to reschedule or have any questions, please contact us immediately.</p>
        <p>Good luck!</p>
        <p>Best regards,<br>{{companyName}} Hiring Team</p>
      </div>
    `
  },
  {
    type: 'JOB_REJECTED',
    subject: 'Update on your application - {{jobTitle}}',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Application Update</h2>
        <p>Dear {{candidateName}},</p>
        <p>Thank you for your interest in the position of <strong>{{jobTitle}}</strong> at <strong>{{companyName}}</strong> and for taking the time to apply.</p>
        <p>After careful consideration, we have decided to move forward with other candidates whose experience more closely matches our current needs.</p>
        <p>This decision was not easy, as we received many qualified applications. We encourage you to apply for future opportunities that match your skills and experience.</p>
        <p>We will keep your profile on file and may reach out if a suitable position becomes available.</p>
        <p>Thank you again for your interest in {{companyName}}.</p>
        <p>Best wishes,<br>{{companyName}} Hiring Team</p>
      </div>
    `
  },
  {
    type: 'WELCOME',
    subject: 'Welcome to {{appName}}!',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #28a745; text-align: center;">Welcome to {{appName}}!</h2>
        <p>Hello {{username}},</p>
        <p>Congratulations! Your account has been successfully created. We're excited to have you join our community.</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #495057;">Getting Started:</h3>
          <ul>
            <li>Complete your profile to get better job recommendations</li>
            <li>Upload your resume to attract employers</li>
            <li>Browse and apply to jobs that match your skills</li>
            <li>Set up job alerts to never miss opportunities</li>
          </ul>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{loginUrl}}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Get Started</a>
        </div>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Happy job hunting!</p>
        <p>Best regards,<br>{{appName}} Team</p>
      </div>
    `
  },
  {
    type: 'PASSWORD_RESET',
    subject: 'Reset Your Password - {{appName}}',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc3545;">Password Reset Request</h2>
        <p>Hello {{username}},</p>
        <p>We received a request to reset your password for your {{appName}} account.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{resetUrl}}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        </div>
        <p>This link will expire in {{expiryTime}} hours for security reasons.</p>
        <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
        <p>Best regards,<br>{{appName}} Team</p>
      </div>
    `
  },
  {
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
  },
  {
    type: 'PASSWORD_RESET_OTP',
    subject: 'Reset Your Password - {{appName}}',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #333; margin-bottom: 10px;">Reset Your Password</h2>
          <p style="color: #666; margin: 0;">{{appName}} Password Reset</p>
        </div>

        <p>Hello {{username}},</p>
        <p>We received a request to reset your password for your {{appName}} account. To reset your password, please use the verification code below:</p>

        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 25px; text-align: center; margin: 30px 0; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <p style="color: white; margin: 0 0 10px 0; font-size: 14px; opacity: 0.9;">Your Password Reset Code</p>
          <h1 style="color: white; margin: 0; font-size: 36px; letter-spacing: 8px; font-weight: bold;">{{otp}}</h1>
        </div>

        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <p style="margin: 0; color: #856404; font-size: 14px;">
            <strong>Important:</strong> This code will expire in 5 minutes for your security.
          </p>
        </div>

        <p>If you didn't request a password reset, please ignore this email or contact our support team if you have concerns.</p>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
          <p style="margin: 0; color: #666; font-size: 12px;">
            This is an automated email from {{appName}}. Please do not reply to this email.
          </p>
        </div>

        <div style="margin-top: 20px; text-align: center;">
          <p style="margin: 0; color: #666; text-align: center;">
            If you didn't request this password reset, please ignore this email.
          </p>
        </div>
      </div>
    `
  }
];

const seedEmailTemplates = async () => {
  try {
    console.log('🌱 Starting email templates seeding...');

    // Clear existing templates
    await prisma.emailTemplate.deleteMany({});
    console.log('🧹 Cleared existing email templates');

    // Insert default templates using Prisma
    for (const template of defaultTemplates) {
      await prisma.emailTemplate.create({
        data: template
      });
    }

    console.log('✅ Default email templates seeded successfully');

    const count = await prisma.emailTemplate.count();
    console.log(`📧 Total email templates: ${count}`);

  } catch (error) {
    console.error('❌ Error seeding email templates:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedEmailTemplates()
    .then(() => {
      console.log('🎉 Email templates seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedEmailTemplates, defaultTemplates };