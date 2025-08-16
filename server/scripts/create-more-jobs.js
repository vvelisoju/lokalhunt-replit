const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Creating additional sample jobs...');

    // Get existing cities and companies
    const cities = await prisma.city.findMany({ where: { isActive: true } });
    const companies = await prisma.company.findMany({ where: { isActive: true } });
    const employers = await prisma.employer.findMany();

    if (cities.length === 0 || companies.length === 0) {
      console.log('❌ No cities or companies found. Please run basic seed first.');
      return;
    }

    // Simple job data without numberOfPositions field
    const jobs = [
      {
        title: 'Senior Frontend Developer',
        description: 'We are looking for an experienced Frontend Developer to join our team.',
        categoryName: 'Jobs',
        status: 'APPROVED',
        companyId: companies[0]?.id,
        locationId: cities[0]?.id,
        employerId: employers[0]?.id,
        categorySpecificFields: {
          employmentType: 'FULL_TIME',
          experienceLevel: 'SENIOR_LEVEL',
          skills: ['React', 'TypeScript', 'CSS'],
          salaryRange: { min: 80000, max: 120000, currency: 'INR' },
          numberOfPositions: 2
        }
      },
      {
        title: 'Digital Marketing Executive',
        description: 'Join our marketing team to create digital campaigns.',
        categoryName: 'Jobs',
        status: 'APPROVED',
        companyId: companies[1]?.id || companies[0]?.id,
        locationId: cities[1]?.id || cities[0]?.id,
        employerId: employers[0]?.id,
        categorySpecificFields: {
          employmentType: 'FULL_TIME',
          experienceLevel: 'MID_LEVEL',
          skills: ['Digital Marketing', 'SEO', 'Social Media'],
          salaryRange: { min: 35000, max: 55000, currency: 'INR' },
          numberOfPositions: 1
        }
      },
      {
        title: 'Part-time Content Writer',
        description: 'We need a talented content writer for blog posts.',
        categoryName: 'Jobs',
        status: 'APPROVED',
        companyId: companies[0]?.id,
        locationId: cities[2]?.id || cities[0]?.id,
        employerId: employers[0]?.id,
        categorySpecificFields: {
          employmentType: 'PART_TIME',
          experienceLevel: 'ENTRY_LEVEL',
          skills: ['Content Writing', 'SEO Writing', 'Research'],
          salaryRange: { min: 15000, max: 25000, currency: 'INR' },
          numberOfPositions: 1
        }
      },
      {
        title: 'Remote Python Developer',
        description: 'Remote position for a skilled Python developer.',
        categoryName: 'Jobs',
        status: 'APPROVED',
        companyId: companies[0]?.id,
        locationId: cities[3]?.id || cities[0]?.id,
        employerId: employers[0]?.id,
        categorySpecificFields: {
          employmentType: 'REMOTE',
          experienceLevel: 'MID_LEVEL',
          skills: ['Python', 'Django', 'PostgreSQL'],
          salaryRange: { min: 60000, max: 100000, currency: 'INR' },
          numberOfPositions: 3
        }
      },
      {
        title: 'Freelance Graphic Designer',
        description: 'Looking for a creative freelance graphic designer.',
        categoryName: 'Jobs',
        status: 'APPROVED',
        companyId: companies[1]?.id || companies[0]?.id,
        locationId: cities[0]?.id,
        employerId: employers[0]?.id,
        categorySpecificFields: {
          employmentType: 'FREELANCE',
          experienceLevel: 'MID_LEVEL',
          skills: ['Graphic Design', 'Adobe Creative Suite'],
          salaryRange: { min: 25000, max: 50000, currency: 'INR' },
          numberOfPositions: 2
        }
      },
      {
        title: 'Sales Executive',
        description: 'Join our sales team to drive revenue growth.',
        categoryName: 'Jobs',
        status: 'APPROVED',
        companyId: companies[0]?.id,
        locationId: cities[1]?.id || cities[0]?.id,
        employerId: employers[0]?.id,
        categorySpecificFields: {
          employmentType: 'FULL_TIME',
          experienceLevel: 'ENTRY_LEVEL',
          skills: ['Sales', 'Communication', 'Negotiation'],
          salaryRange: { min: 30000, max: 60000, currency: 'INR' },
          numberOfPositions: 2
        }
      }
    ];

    // Create jobs
    let created = 0;
    for (const jobData of jobs) {
      try {
        const job = await prisma.ad.create({
          data: {
            ...jobData,
            approvedAt: new Date(),
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
          }
        });
        console.log(`✅ Created: ${job.title}`);
        created++;
      } catch (error) {
        console.log(`❌ Failed: ${jobData.title} - ${error.message}`);
      }
    }

    console.log(`🎉 Successfully created ${created} jobs!`);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);