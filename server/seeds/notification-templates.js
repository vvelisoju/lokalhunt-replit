const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Default notification templates
const defaultNotificationTemplates = [
  // Candidate Notifications
  {
    type: 'WELCOME',
    title: 'Welcome to LokalHunt! 🎉',
    body: 'Hi {candidateName}! Your push notifications are now active. We\'ll keep you updated on new job opportunities!',
    variables: ['candidateName'],
    description: 'Welcome notification sent to new candidates'
  },
  {
    type: 'JOB_ALERT',
    title: 'New job alert: {jobTitle}',
    body: 'New {jobTitle} position at {companyName} in {location}. Salary: {salary}. Apply now!',
    variables: ['jobTitle', 'companyName', 'location', 'salary'],
    description: 'Job matching candidate preferences'
  },
  {
    type: 'APPLICATION_UPDATE',
    title: 'Application update',
    body: 'Your application for {jobTitle} at {companyName} has been {status}.',
    variables: ['jobTitle', 'companyName', 'status'],
    description: 'Application status changes'
  },
  {
    type: 'PROFILE_VIEWED',
    title: 'Profile viewed',
    body: '{companyName} viewed your profile. Increase your visibility by updating your skills and experience!',
    variables: ['companyName'],
    description: 'When employer views candidate profile'
  },

  // Employer Notifications
  {
    type: 'NEW_APPLICATION',
    title: 'New application received',
    body: '{candidateName} applied for {jobTitle}. Review their profile and take action.',
    variables: ['candidateName', 'jobTitle'],
    description: 'When candidate applies for a job'
  },
  {
    type: 'JOB_APPROVED',
    title: 'Job Ad Approved! ✅',
    body: 'Great news! Your job posting "{jobTitle}" has been approved and is now live on LokalHunt. Start receiving applications!',
    variables: ['jobTitle', 'adId'],
    description: 'When branch admin approves a job ad'
  },
  {
    type: 'JOB_REJECTED',
    title: 'Job Ad Needs Review ❌',
    body: 'Your job posting "{jobTitle}" requires some changes. Reason: {reason}. Please edit and resubmit.',
    variables: ['jobTitle', 'adId', 'reason'],
    description: 'When branch admin rejects a job ad'
  },
  {
    type: 'JOB_VIEW_MILESTONE',
    title: 'Job milestone reached! 🎯',
    body: 'Your job "{jobTitle}" has reached {viewCount} views! Keep promoting to get more applications.',
    variables: ['jobTitle', 'viewCount'],
    description: 'Job view count milestones (10, 25, 50, 100)'
  },
  {
    type: 'JOB_BOOKMARKED',
    title: 'Job bookmarked',
    body: '{candidateName} bookmarked your job: {jobTitle}. They might apply soon!',
    variables: ['candidateName', 'jobTitle'],
    description: 'When candidate bookmarks a job'
  },
  {
    type: 'JOB_VIEWED',
    title: 'Job Viewed',
    body: '{candidateName} viewed your job posting: {jobTitle}',
    variables: ['candidateName', 'jobTitle', 'companyName'],
    description: 'Notification sent to employer when a candidate views their job',
    isActive: true
  },
  {
    type: 'JOB_CLOSED',
    title: 'Job Application Closed',
    body: 'The job "{jobTitle}" at {companyName} has been closed. Thank you for your interest!',
    variables: ['jobTitle', 'companyName'],
    description: 'Notification sent to candidates when a job they applied to is closed',
    isActive: true
  },

  // System Notifications
  {
    type: 'SYSTEM',
    title: 'System notification',
    body: '{message}',
    variables: ['message'],
    description: 'General system notifications'
  },
  {
    type: 'TEST',
    title: 'Test notification',
    body: 'This is a test notification to verify your push notification setup is working correctly.',
    variables: [],
    description: 'Test notifications for verification'
  },
  // Branch Admin Notifications
  {
    type: 'ADMIN_ALERT',
    title: 'Admin Alert',
    body: 'System alert: {message}',
    variables: ['message'],
    description: 'General admin system alerts'
  },
  {
    type: 'NEW_EMPLOYER_REGISTERED',
    title: 'New Employer Registration 🏢',
    body: '{employerName} ({employerEmail}) from {companyName} has registered in your city. Please review their profile.',
    variables: ['employerName', 'employerEmail', 'companyName'],
    description: 'When a new employer registers in branch admin\'s city'
  },
  {
    type: 'NEW_CANDIDATE_REGISTERED', 
    title: 'New Candidate Registration 👤',
    body: '{candidateName} ({candidateEmail}) has registered as a job seeker in your city.',
    variables: ['candidateName', 'candidateEmail'],
    description: 'When a new candidate registers in branch admin\'s city'
  },
  {
    type: 'NEW_AD_SUBMITTED',
    title: 'New Job Ad Submitted ✍️',
    body: '{employerName} from {companyName} submitted "{jobTitle}" for approval. Please review the job posting.',
    variables: ['employerName', 'companyName', 'jobTitle', 'adId'],
    description: 'When employer submits a new job ad for branch admin approval'
  },
];

const seedNotificationTemplates = async () => {
  try {
    console.log('🔔 Starting notification templates seeding...');

    // Clear existing templates
    await prisma.notificationTemplate.deleteMany({});
    console.log('🧹 Cleared existing notification templates');

    // Insert default templates
    for (const template of defaultNotificationTemplates) {
      await prisma.notificationTemplate.create({
        data: template
      });
    }

    console.log('✅ Default notification templates seeded successfully');

    const count = await prisma.notificationTemplate.count();
    console.log(`🔔 Total notification templates: ${count}`);

  } catch (error) {
    console.error('❌ Error seeding notification templates:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedNotificationTemplates()
    .then(() => {
      console.log('🎉 Notification templates seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedNotificationTemplates, defaultNotificationTemplates };