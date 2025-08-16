const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create cities
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
      where: { name_state: { name: 'Bangalore', state: 'Karnataka' } },
      update: {},
      create: {
        name: 'Bangalore',
        state: 'Karnataka',
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
      where: { name_state: { name: 'Pune', state: 'Maharashtra' } },
      update: {},
      create: {
        name: 'Pune',
        state: 'Maharashtra',
        country: 'India'
      }
    }),
    prisma.city.upsert({
      where: { name_state: { name: 'Hyderabad', state: 'Telangana' } },
      update: {},
      create: {
        name: 'Hyderabad',
        state: 'Telangana',
        country: 'India'
      }
    })
  ]);

  console.log('✅ Cities created');

  // Create skills
  const skills = [
    { name: 'JavaScript', category: 'Technical' },
    { name: 'React', category: 'Technical' },
    { name: 'Node.js', category: 'Technical' },
    { name: 'Python', category: 'Technical' },
    { name: 'Java', category: 'Technical' },
    { name: 'SQL', category: 'Technical' },
    { name: 'Communication', category: 'Soft Skills' },
    { name: 'Leadership', category: 'Soft Skills' },
    { name: 'Project Management', category: 'Soft Skills' },
    { name: 'Sales', category: 'Sales' },
    { name: 'Marketing', category: 'Marketing' },
    { name: 'Data Analysis', category: 'Analytics' }
  ];

  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: {},
      create: skill
    });
  }

  console.log('✅ Skills created');

  // Create job categories
  const jobCategories = [
    { name: 'Software Development', description: 'Programming and software engineering roles' },
    { name: 'Data Science', description: 'Data analysis, machine learning, and analytics' },
    { name: 'Sales & Marketing', description: 'Sales, marketing, and business development' },
    { name: 'Design', description: 'UI/UX design and graphic design roles' },
    { name: 'Operations', description: 'Operations, project management, and administration' }
  ];

  for (const category of jobCategories) {
    await prisma.jobCategory.upsert({
      where: { name: category.name },
      update: {},
      create: category
    });
  }

  console.log('✅ Job categories created');

  // Create Super Admin
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

  console.log('✅ Super Admin created');

  // Create Branch Admins for each city
  const branchAdmins = [];
  for (let i = 0; i < cities.length; i++) {
    const city = cities[i];
    const password = await bcrypt.hash('admin123', 12);
    
    const adminUser = await prisma.user.upsert({
      where: { email: `admin.${city.name.toLowerCase()}@lokalhunt.com` },
      update: {},
      create: {
        name: `${city.name} Branch Admin`,
        email: `admin.${city.name.toLowerCase()}@lokalhunt.com`,
        phone: `+91 888888888${i}`,
        passwordHash: password,
        role: 'BRANCH_ADMIN',
        cityId: city.id
      }
    });

    const branchAdmin = await prisma.branchAdmin.upsert({
      where: { userId: adminUser.id },
      update: {},
      create: {
        userId: adminUser.id,
        assignedCityId: city.id,
        performanceMetrics: {
          adsApproved: 0,
          candidatesScreened: 0,
          allocationsCompleted: 0
        }
      }
    });

    branchAdmins.push(branchAdmin);
  }

  console.log('✅ Branch Admins created');

  // Create sample employers
  const employers = [];
  for (let i = 0; i < 3; i++) {
    const city = cities[i % cities.length];
    const password = await bcrypt.hash('employer123', 12);
    
    const employerUser = await prisma.user.create({
      data: {
        name: `Employer ${i + 1}`,
        email: `employer${i + 1}@company.com`,
        phone: `+91 777777777${i}`,
        passwordHash: password,
        role: 'EMPLOYER',
        cityId: city.id
      }
    });

    const employer = await prisma.employer.create({
      data: {
        userId: employerUser.id,
        contactDetails: {
          companyAddress: `${city.name} Tech Park`,
          contactPerson: `HR Manager ${i + 1}`,
          website: `https://company${i + 1}.com`
        },
        isVerified: true
      }
    });

    // Create company for employer
    const company = await prisma.company.create({
      data: {
        employerId: employer.id,
        name: `TechCorp ${i + 1}`,
        description: `Leading technology company in ${city.name}`,
        cityId: city.id,
        industry: 'Technology',
        size: '51-200',
        website: `https://techcorp${i + 1}.com`
      }
    });

    // Create MOU for employer with branch admin
    const assignedBranchAdmin = branchAdmins.find(ba => ba.assignedCityId === city.id);
    if (assignedBranchAdmin) {
      await prisma.mOU.create({
        data: {
          employerId: employer.id,
          branchAdminId: assignedBranchAdmin.id,
          feeType: i % 2 === 0 ? 'PERCENTAGE' : 'FIXED',
          feeValue: i % 2 === 0 ? 15.0 : 5000.0,
          terms: `Standard terms for ${i % 2 === 0 ? 'percentage' : 'fixed'} fee agreement`,
          notes: `Initial MOU signed for ${company.name}`,
          status: 'APPROVED',
          signedAt: new Date(),
          version: '1.0',
          isActive: true
        }
      });
    }

    employers.push({ employer, company, city });
  }

  console.log('✅ Sample employers created');

  // Create sample candidates
  const candidates = [];
  for (let i = 0; i < 5; i++) {
    const city = cities[i % cities.length];
    const password = await bcrypt.hash('candidate123', 12);
    
    const candidateUser = await prisma.user.create({
      data: {
        name: `Candidate ${i + 1}`,
        email: `candidate${i + 1}@example.com`,
        phone: `+91 666666666${i}`,
        passwordHash: password,
        role: 'CANDIDATE',
        cityId: city.id
      }
    });

    const candidate = await prisma.candidate.create({
      data: {
        userId: candidateUser.id,
        profileData: {
          summary: `Experienced software developer with ${2 + i} years of experience`,
          currentRole: `Software Engineer ${i + 1}`
        },
        education: [
          {
            degree: 'Bachelor of Technology',
            field: 'Computer Science',
            institution: `${city.name} University`,
            year: 2020 + i
          }
        ],
        experience: [
          {
            company: `Previous Company ${i + 1}`,
            role: 'Software Developer',
            duration: `${2 + i} years`,
            description: 'Developed web applications using modern technologies'
          }
        ],
        ratings: {
          'JavaScript': 7 + (i % 3),
          'React': 6 + (i % 4),
          'Communication': 8 + (i % 2)
        },
        overallRating: 7.5 + (i * 0.3),
        tags: ['Quick Learner', 'Team Player', 'Problem Solver'].slice(0, i % 3 + 1)
      }
    });

    candidates.push({ candidate, city });
  }

  console.log('✅ Sample candidates created');

  // Create sample job ads
  for (let i = 0; i < employers.length; i++) {
    const { employer, company, city } = employers[i];
    
    const ad = await prisma.ad.create({
      data: {
        employerId: employer.id,
        companyId: company.id,
        categoryName: 'Jobs',
        title: `Senior Software Engineer - ${city.name}`,
        description: `We are looking for a talented Senior Software Engineer to join our team in ${city.name}. You will be responsible for developing high-quality software solutions and mentoring junior developers.`,
        status: 'APPROVED',
        locationId: city.id,
        categorySpecificFields: {
          skills: ['JavaScript', 'React', 'Node.js'],
          experienceLevel: 'SENIOR_LEVEL',
          employmentType: 'FULL_TIME',
          salaryRange: {
            min: 800000,
            max: 1200000,
            currency: 'INR'
          },
          requirements: [
            '5+ years of experience in software development',
            'Strong knowledge of JavaScript and React',
            'Experience with Node.js and databases',
            'Good communication skills'
          ]
        },
        contactInfo: {
          email: `hr@techcorp${i + 1}.com`,
          phone: `+91 555555555${i}`
        },
        approvedAt: new Date(),
        approvedBy: branchAdmins[i % branchAdmins.length].userId
      }
    });

    // Create some applications for this ad
    for (let j = 0; j < Math.min(3, candidates.length); j++) {
      const { candidate } = candidates[j];
      
      await prisma.allocation.create({
        data: {
          candidateId: candidate.id,
          adId: ad.id,
          employerId: employer.id,
          status: j === 0 ? 'ALLOCATED' : j === 1 ? 'SCREENED' : 'APPLIED',
          feeType: j === 0 ? 'PERCENTAGE' : null,
          feeValue: j === 0 ? 15.0 : null,
          allocatedBy: j === 0 ? branchAdmins[i % branchAdmins.length].userId : null,
          allocatedAt: j === 0 ? new Date() : null
        }
      });
    }
  }

  console.log('✅ Sample job ads and applications created');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Test Accounts Created:');
  console.log('Super Admin: admin@lokalhunt.com / admin123');
  console.log('Branch Admins: admin.[cityname]@lokalhunt.com / admin123');
  console.log('Employers: employer[1-3]@company.com / employer123');
  console.log('Candidates: candidate[1-5]@example.com / candidate123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });