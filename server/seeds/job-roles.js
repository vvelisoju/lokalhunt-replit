
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Default job roles data
const DEFAULT_JOB_ROLES = [
  // Local Jobs
  { name: 'Delivery Driver', category: 'local', description: 'Deliver products and packages to customers', isActive: true, sortOrder: 1 },
  { name: 'Sales Executive', category: 'local', description: 'Drive sales and customer acquisition', isActive: true, sortOrder: 2 },
  { name: 'Customer Support', category: 'local', description: 'Provide customer service and support', isActive: true, sortOrder: 3 },
  { name: 'Retail Associate', category: 'local', description: 'Assist customers in retail stores', isActive: true, sortOrder: 4 },
  { name: 'Food Service', category: 'local', description: 'Prepare and serve food in restaurants', isActive: true, sortOrder: 5 },
  { name: 'Security Guard', category: 'local', description: 'Provide security services for premises', isActive: true, sortOrder: 6 },
  { name: 'Electrician', category: 'local', description: 'Install and maintain electrical systems', isActive: true, sortOrder: 7 },
  { name: 'Data Entry Operator', category: 'local', description: 'Enter and maintain database information', isActive: true, sortOrder: 8 },
  { name: 'House Keeping', category: 'local', description: 'Maintain cleanliness and organization', isActive: true, sortOrder: 9 },
  { name: 'Driver', category: 'local', description: 'Operate vehicles for transportation services', isActive: true, sortOrder: 10 },
  { name: 'Field Sales', category: 'local', description: 'Conduct sales activities in the field', isActive: true, sortOrder: 11 },
  { name: 'Telecaller', category: 'local', description: 'Make outbound calls for sales or support', isActive: true, sortOrder: 12 },
  { name: 'Receptionist', category: 'local', description: 'Greet visitors and handle front desk duties', isActive: true, sortOrder: 13 },
  { name: 'Cashier', category: 'local', description: 'Handle cash transactions and customer checkout', isActive: true, sortOrder: 14 },
  { name: 'Warehouse Worker', category: 'local', description: 'Manage inventory and warehouse operations', isActive: true, sortOrder: 15 },
  { name: 'Cook', category: 'local', description: 'Prepare meals in restaurants and kitchens', isActive: true, sortOrder: 16 },
  { name: 'Cleaner', category: 'local', description: 'Maintain cleanliness of buildings and facilities', isActive: true, sortOrder: 17 },
  { name: 'Helper', category: 'local', description: 'Provide general assistance in various tasks', isActive: true, sortOrder: 18 },
  { name: 'Packer', category: 'local', description: 'Pack products for shipping and delivery', isActive: true, sortOrder: 19 },
  { name: 'Lab Assistant', category: 'local', description: 'Assist in laboratory operations and testing', isActive: true, sortOrder: 20 },

  // Tech Jobs (optional - can be removed as per requirement)
  { name: 'Software Engineer', category: 'tech', description: 'Develop and maintain software applications', isActive: true, sortOrder: 101 },
  { name: 'Web Developer', category: 'tech', description: 'Build and maintain websites and web applications', isActive: true, sortOrder: 102 },
  { name: 'Mobile Developer', category: 'tech', description: 'Develop mobile applications for iOS and Android', isActive: true, sortOrder: 103 },
  { name: 'Data Scientist', category: 'tech', description: 'Analyze data to extract business insights', isActive: true, sortOrder: 104 },
  { name: 'Product Manager', category: 'tech', description: 'Manage product development and strategy', isActive: true, sortOrder: 105 },
  { name: 'UI/UX Designer', category: 'tech', description: 'Design user interfaces and experiences', isActive: true, sortOrder: 106 },
  { name: 'DevOps Engineer', category: 'tech', description: 'Manage development and operations infrastructure', isActive: true, sortOrder: 107 },
  { name: 'Quality Assurance', category: 'tech', description: 'Test software applications for quality', isActive: true, sortOrder: 108 },
  { name: 'Business Analyst', category: 'tech', description: 'Analyze business requirements and processes', isActive: true, sortOrder: 109 },
  { name: 'Digital Marketing', category: 'tech', description: 'Manage online marketing campaigns and strategy', isActive: true, sortOrder: 110 }
];

async function seedJobRoles() {
  try {
    console.log('🎯 Starting job roles seeding...');

    // Check if job roles already exist
    const existingRoles = await prisma.jobRole.count();
    
    if (existingRoles > 0) {
      console.log(`⚠️  Found ${existingRoles} existing job roles. Skipping seed to avoid duplicates.`);
      console.log('💡 To reseed, please clear job_roles table first.');
      return;
    }

    // Create job roles
    const createdRoles = [];
    for (const role of DEFAULT_JOB_ROLES) {
      const created = await prisma.jobRole.create({
        data: {
          name: role.name,
          category: role.category,
          description: role.description,
          isActive: role.isActive,
          sortOrder: role.sortOrder
        }
      });
      createdRoles.push(created);
      console.log(`✅ Created job role: ${role.name} (${role.category})`);
    }

    const localJobsCount = createdRoles.filter(r => r.category === 'local').length;
    const techJobsCount = createdRoles.filter(r => r.category === 'tech').length;

    console.log(`🎯 Successfully created ${createdRoles.length} job roles`);
    console.log(`📍 Local jobs: ${localJobsCount}`);
    console.log(`💻 Tech jobs: ${techJobsCount}`);
    console.log('🚀 Job roles seeding completed!');
    
    return createdRoles;
  } catch (error) {
    console.error('❌ Error seeding job roles:', error);
    throw error;
  }
}

async function main() {
  await seedJobRoles();
}

// Run if called directly
if (require.main === module) {
  main()
    .then(() => {
      console.log('✨ Job roles seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Job roles seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedJobRoles, DEFAULT_JOB_ROLES };
