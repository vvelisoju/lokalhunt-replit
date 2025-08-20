const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createDefaultUsers() {
  console.log('🔐 Creating default users with credentials...');
  
  // Hash the password "123123" for all users
  const passwordHash = await bcrypt.hash('123123', 10);
  
  try {
    // 1. Create Super Admin
    const superAdmin = await prisma.user.upsert({
      where: { email: 'admin@lokalhunt.com' },
      update: {},
      create: {
        name: 'Super Admin',
        firstName: 'Super',
        lastName: 'Admin',
        email: 'admin@lokalhunt.com',
        phone: '+91-9999999999',
        passwordHash: passwordHash,
        role: 'SUPER_ADMIN',
        city: 'Hyderabad'
      }
    });
    console.log('✅ Created Super Admin: admin@lokalhunt.com');

    // 2. Create Branch Admin  
    const branchAdmin = await prisma.user.upsert({
      where: { email: 'branch@lokalhunt.com' },
      update: {},
      create: {
        name: 'Branch Admin',
        firstName: 'Branch',
        lastName: 'Admin',
        email: 'branch@lokalhunt.com',
        phone: '+91-8888888888',
        passwordHash: passwordHash,
        role: 'BRANCH_ADMIN',
        city: 'Hyderabad'
      }
    });
    console.log('✅ Created Branch Admin: branch@lokalhunt.com');

    // First create/find a city for the branch admin
    const city = await prisma.city.upsert({
      where: { 
        name_state: {
          name: 'Hyderabad',
          state: 'Telangana'
        }
      },
      update: {},
      create: {
        name: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        isActive: true
      }
    });

    // Create branch admin profile
    await prisma.branchAdmin.upsert({
      where: { userId: branchAdmin.id },
      update: {},
      create: {
        userId: branchAdmin.id,
        assignedCityId: city.id,
        isActive: true
      }
    });

    // 3. Create Employer
    const employer = await prisma.user.upsert({
      where: { email: 'employer@lokalhunt.com' },
      update: {},
      create: {
        name: 'Test Employer',
        firstName: 'Test',
        lastName: 'Employer',
        email: 'employer@lokalhunt.com',
        phone: '+91-7777777777',
        passwordHash: passwordHash,
        role: 'EMPLOYER',
        city: 'Hyderabad'
      }
    });
    console.log('✅ Created Employer: employer@lokalhunt.com');

    // Create employer profile first
    const employerProfile = await prisma.employer.upsert({
      where: { userId: employer.id },
      update: {},
      create: {
        userId: employer.id,
        isVerified: true
      }
    });

    // Create company for employer
    const company = await prisma.company.create({
      data: {
        employerId: employerProfile.id,
        name: 'Demo Tech Company',
        description: 'A demo technology company for testing purposes',
        industry: 'Technology',
        website: 'https://demo-tech.com',
        cityId: city.id
      }
    });

    // 4. Create Candidate
    const candidate = await prisma.user.upsert({
      where: { email: 'candidate@lokalhunt.com' },
      update: {},
      create: {
        name: 'Test Candidate',
        firstName: 'Test',
        lastName: 'Candidate',
        email: 'candidate@lokalhunt.com',
        phone: '+91-6666666666',
        passwordHash: passwordHash,
        role: 'CANDIDATE',
        city: 'Hyderabad'
      }
    });
    console.log('✅ Created Candidate: candidate@lokalhunt.com');

    // Create candidate profile
    await prisma.candidate.upsert({
      where: { userId: candidate.id },
      update: {},
      create: {
        userId: candidate.id,
        profileData: {
          bio: 'I am a motivated candidate looking for opportunities in the tech industry.',
          skills: ['JavaScript', 'React', 'Node.js', 'Python'],
          languages: ['English', 'Telugu', 'Hindi'],
          preferredJobTypes: ['FULL_TIME'],
          expectedSalaryMin: 300000,
          expectedSalaryMax: 500000,
          openToWork: true,
          profileCompleteness: 85
        },
        experience: [
          {
            company: 'Previous Company',
            position: 'Software Developer',
            duration: '2 years',
            description: 'Worked on web development projects'
          }
        ],
        education: [
          {
            institution: 'Tech University',
            degree: 'Bachelor of Technology',
            field: 'Computer Science',
            year: '2022'
          }
        ]
      }
    });

    console.log('\n🎉 All default users created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Password for ALL users: 123123');
    console.log('');
    console.log('👑 Super Admin: admin@lokalhunt.com');
    console.log('🏢 Branch Admin: branch@lokalhunt.com');  
    console.log('💼 Employer: employer@lokalhunt.com');
    console.log('👤 Candidate: candidate@lokalhunt.com');
    console.log('');

  } catch (error) {
    console.error('Error creating default users:', error);
    throw error;
  }
}

async function main() {
  try {
    await createDefaultUsers();
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { createDefaultUsers };