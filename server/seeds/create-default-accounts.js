const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createDefaultAccounts() {
  console.log('🔧 Creating default accounts for each role...');

  try {
    // Ensure we have cities first
    const cities = await Promise.all([
      prisma.city.upsert({
        where: { name_state: { name: 'Mumbai', state: 'Maharashtra' } },
        update: {},
        create: {
          name: 'Mumbai',
          state: 'Maharashtra',
          country: 'India'
        }
      }),
      prisma.city.upsert({
        where: { name_state: { name: 'Delhi', state: 'Delhi' } },
        update: {},
        create: {
          name: 'Delhi',
          state: 'Delhi',
          country: 'India'
        }
      }),
      prisma.city.upsert({
        where: { name_state: { name: 'Bangalore', state: 'Karnataka' } },
        update: {},
        create: {
          name: 'Bangalore',
          state: 'Karnataka',
          country: 'India'
        }
      })
    ]);

    console.log('✅ Cities ready');

    // 1. Create Super Admin
    const superAdminPassword = await bcrypt.hash('admin123', 12);
    const superAdmin = await prisma.user.upsert({
      where: { email: 'admin@lokalhunt.com' },
      update: {},
      create: {
        name: 'Super Admin',
        email: 'admin@lokalhunt.com',
        phone: '+91 9999999999',
        passwordHash: superAdminPassword,
        role: 'SUPER_ADMIN',
        cityId: cities[0].id
      }
    });

    console.log('✅ Super Admin: admin@lokalhunt.com / admin123');

    // 2. Create Branch Admin
    const branchAdminPassword = await bcrypt.hash('admin123', 12);
    const branchAdminUser = await prisma.user.upsert({
      where: { email: 'admin.mumbai@lokalhunt.com' },
      update: {},
      create: {
        name: 'Mumbai Branch Admin',
        email: 'admin.mumbai@lokalhunt.com',
        phone: '+91 8888888880',
        passwordHash: branchAdminPassword,
        role: 'BRANCH_ADMIN',
        cityId: cities[0].id
      }
    });

    // Create branch admin profile
    await prisma.branchAdmin.upsert({
      where: { userId: branchAdminUser.id },
      update: {},
      create: {
        userId: branchAdminUser.id,
        assignedCityId: cities[0].id,
        performanceMetrics: {
          adsApproved: 0,
          candidatesScreened: 0,
          allocationsCompleted: 0
        }
      }
    });

    console.log('✅ Branch Admin: admin.mumbai@lokalhunt.com / admin123');

    // 3. Create Employer
    const employerPassword = await bcrypt.hash('employer123', 12);
    const employerUser = await prisma.user.upsert({
      where: { email: 'employer@techcorp.com' },
      update: {},
      create: {
        name: 'Tech Corp Employer',
        email: 'employer@techcorp.com',
        phone: '+91 7777777770',
        passwordHash: employerPassword,
        role: 'EMPLOYER',
        cityId: cities[0].id
      }
    });

    // Create employer profile
    const employer = await prisma.employer.upsert({
      where: { userId: employerUser.id },
      update: {},
      create: {
        userId: employerUser.id,
        contactDetails: {
          companyAddress: 'Mumbai Tech Park, Powai',
          contactPerson: 'HR Manager',
          website: 'https://techcorp.com'
        },
        isVerified: true
      }
    });

    // Create company for employer
    const existingCompany = await prisma.company.findFirst({
      where: { 
        employerId: employer.id,
        name: 'TechCorp Solutions'
      }
    });

    if (!existingCompany) {
      await prisma.company.create({
        data: {
          employerId: employer.id,
          name: 'TechCorp Solutions',
          description: 'Leading technology solutions provider',
          cityId: cities[0].id,
          industry: 'Technology',
          size: '51-200',
          website: 'https://techcorp.com'
        }
      });
    }

    console.log('✅ Employer: employer@techcorp.com / employer123');

    // 4. Create Candidate
    const candidatePassword = await bcrypt.hash('candidate123', 12);
    const candidateUser = await prisma.user.upsert({
      where: { email: 'candidate@example.com' },
      update: {},
      create: {
        name: 'John Doe',
        email: 'candidate@example.com',
        phone: '+91 6666666660',
        passwordHash: candidatePassword,
        role: 'CANDIDATE',
        cityId: cities[0].id
      }
    });

    // Create candidate profile
    await prisma.candidate.upsert({
      where: { userId: candidateUser.id },
      update: {},
      create: {
        userId: candidateUser.id,
        profileData: {
          summary: 'Experienced full-stack developer with 5 years of experience',
          currentRole: 'Senior Software Engineer'
        },
        education: [
          {
            degree: 'Bachelor of Technology',
            field: 'Computer Science',
            institution: 'Mumbai University',
            year: 2019
          }
        ],
        experience: [
          {
            company: 'Previous Tech Company',
            role: 'Software Developer',
            duration: '3 years',
            description: 'Developed web applications using React and Node.js'
          }
        ],
        ratings: {
          'JavaScript': 9,
          'React': 8,
          'Node.js': 8,
          'Communication': 9
        },
        overallRating: 8.5,
        tags: ['Quick Learner', 'Team Player', 'Problem Solver']
      }
    });

    console.log('✅ Candidate: candidate@example.com / candidate123');

    console.log('\n🎉 Default accounts created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('┌─────────────────┬──────────────────────────────┬─────────────┐');
    console.log('│ Role            │ Email                        │ Password    │');
    console.log('├─────────────────┼──────────────────────────────┼─────────────┤');
    console.log('│ Super Admin     │ admin@lokalhunt.com          │ admin123    │');
    console.log('│ Branch Admin    │ admin.mumbai@lokalhunt.com   │ admin123    │');
    console.log('│ Employer        │ employer@techcorp.com        │ employer123 │');
    console.log('│ Candidate       │ candidate@example.com        │ candidate123│');
    console.log('└─────────────────┴──────────────────────────────┴─────────────┘');

  } catch (error) {
    console.error('❌ Error creating default accounts:', error);
    throw error;
  }
}

// Run the script
createDefaultAccounts()
  .catch((e) => {
    console.error('❌ Script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('\n💾 Database connection closed');
  });