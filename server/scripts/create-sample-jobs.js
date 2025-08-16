const { PrismaClient } = require('@prisma/client');
const bcryptjs = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Creating comprehensive sample job data...');

    // Get existing cities and companies
    const cities = await prisma.city.findMany({ where: { isActive: true } });
    const companies = await prisma.company.findMany({ where: { isActive: true } });
    const employers = await prisma.employer.findMany();

    if (cities.length === 0 || companies.length === 0) {
      console.log('❌ No cities or companies found. Please run basic seed first.');
      return;
    }

    console.log(`Found ${cities.length} cities and ${companies.length} companies`);

    // Sample job data with various filters
    const sampleJobs = [
      {
        title: 'Senior Frontend Developer',
        description: 'We are looking for an experienced Frontend Developer to join our team. You will work on building responsive web applications using React, TypeScript, and modern CSS frameworks.',
        categoryName: 'Jobs',
        status: 'APPROVED',
        companyId: companies[0]?.id,
        locationId: cities[0]?.id,
        employerId: employers[0]?.id,
        categorySpecificFields: {
          employmentType: 'FULL_TIME',
          experienceLevel: 'SENIOR_LEVEL',
          skills: ['React', 'TypeScript', 'CSS', 'JavaScript', 'HTML'],
          salaryRange: {
            min: 80000,
            max: 120000,
            currency: 'INR'
          },
          numberOfPositions: 2,
          benefits: ['Health Insurance', 'Flexible Hours', 'Remote Work'],
          requirements: [
            '5+ years of frontend development experience',
            'Expert in React and TypeScript',
            'Strong CSS and responsive design skills',
            'Experience with modern build tools'
          ]
        }
      },
      {
        title: 'Digital Marketing Executive',
        description: 'Join our marketing team to create and execute digital marketing campaigns. You will manage social media, SEO, content marketing, and paid advertising campaigns.',
        categoryName: 'Jobs',
        numberOfPositions: 1,
        status: 'APPROVED',
        companyId: companies[1]?.id || companies[0]?.id,
        locationId: cities[1]?.id || cities[0]?.id,
        employerId: employers[0]?.id,
        categorySpecificFields: {
          employmentType: 'FULL_TIME',
          experienceLevel: 'MID_LEVEL',
          skills: ['Digital Marketing', 'SEO', 'Social Media', 'Google Ads', 'Content Marketing'],
          salaryRange: {
            min: 35000,
            max: 55000,
            currency: 'INR'
          },
          benefits: ['Performance Bonus', 'Training Budget', 'Flexible Hours'],
          requirements: [
            '2-4 years of digital marketing experience',
            'Knowledge of SEO and social media platforms',
            'Experience with Google Ads and Analytics',
            'Strong analytical and creative skills'
          ]
        }
      },
      {
        title: 'Part-time Content Writer',
        description: 'We need a talented content writer to create engaging blog posts, website content, and marketing materials. This is a part-time remote position with flexible hours.',
        categoryName: 'Jobs',
        numberOfPositions: 1,
        status: 'APPROVED',
        companyId: companies[0]?.id,
        locationId: cities[2]?.id || cities[0]?.id,
        employerId: employers[0]?.id,
        categorySpecificFields: {
          employmentType: 'PART_TIME',
          experienceLevel: 'ENTRY_LEVEL',
          skills: ['Content Writing', 'SEO Writing', 'Research', 'Editing', 'Copywriting'],
          salaryRange: {
            min: 15000,
            max: 25000,
            currency: 'INR'
          },
          benefits: ['Flexible Schedule', 'Remote Work', 'Byline Credit'],
          requirements: [
            '1-2 years of writing experience',
            'Strong command of English',
            'Knowledge of SEO best practices',
            'Portfolio of published work'
          ]
        }
      },
      {
        title: 'Python Developer (Remote)',
        description: 'Remote position for a skilled Python developer to work on backend systems, APIs, and data processing applications. Experience with Django and PostgreSQL preferred.',
        categoryName: 'Jobs',
        numberOfPositions: 3,
        status: 'APPROVED',
        companyId: companies[0]?.id,
        locationId: cities[3]?.id || cities[0]?.id,
        employerId: employers[0]?.id,
        categorySpecificFields: {
          employmentType: 'FULL_TIME',
          experienceLevel: 'MID_LEVEL',
          skills: ['Python', 'Django', 'PostgreSQL', 'REST APIs', 'Docker'],
          salaryRange: {
            min: 60000,
            max: 100000,
            currency: 'INR'
          },
          benefits: ['Remote Work', 'Health Insurance', 'Learning Budget', 'Flexible Hours'],
          requirements: [
            '3-5 years of Python development experience',
            'Strong knowledge of Django framework',
            'Experience with databases and API development',
            'Ability to work independently in remote environment'
          ]
        }
      },
      {
        title: 'Freelance Graphic Designer',
        description: 'Looking for a creative freelance graphic designer to work on various projects including branding, social media graphics, and print materials.',
        categoryName: 'Jobs',
        numberOfPositions: 2,
        status: 'APPROVED',
        companyId: companies[1]?.id || companies[0]?.id,
        locationId: cities[0]?.id,
        employerId: employers[0]?.id,
        categorySpecificFields: {
          employmentType: 'FREELANCE',
          experienceLevel: 'MID_LEVEL',
          skills: ['Graphic Design', 'Adobe Creative Suite', 'Branding', 'Print Design', 'Web Design'],
          salaryRange: {
            min: 25000,
            max: 50000,
            currency: 'INR'
          },
          benefits: ['Project Based Pay', 'Creative Freedom', 'Portfolio Building'],
          requirements: [
            '2+ years of graphic design experience',
            'Proficiency in Adobe Creative Suite',
            'Strong portfolio showcasing various design work',
            'Good communication and time management skills'
          ]
        }
      },
      {
        title: 'Sales Executive',
        description: 'Join our sales team to drive revenue growth through client acquisition and relationship management. Experience in B2B sales preferred.',
        categoryName: 'Jobs',
        numberOfPositions: 2,
        status: 'APPROVED',
        companyId: companies[0]?.id,
        locationId: cities[1]?.id || cities[0]?.id,
        employerId: employers[0]?.id,
        categorySpecificFields: {
          employmentType: 'FULL_TIME',
          experienceLevel: 'ENTRY_LEVEL',
          skills: ['Sales', 'Communication', 'Negotiation', 'CRM', 'Lead Generation'],
          salaryRange: {
            min: 30000,
            max: 60000,
            currency: 'INR'
          },
          benefits: ['Commission Structure', 'Health Insurance', 'Performance Bonus'],
          requirements: [
            '1-3 years of sales experience',
            'Excellent communication and presentation skills',
            'Goal-oriented with strong work ethic',
            'Experience with CRM tools is a plus'
          ]
        }
      },
      {
        title: 'Data Analyst (Contract)',
        description: 'Contract position for a data analyst to help analyze business data, create reports, and provide insights for decision making.',
        categoryName: 'Jobs',
        numberOfPositions: 1,
        status: 'APPROVED',
        companyId: companies[1]?.id || companies[0]?.id,
        locationId: cities[2]?.id || cities[0]?.id,
        employerId: employers[0]?.id,
        categorySpecificFields: {
          employmentType: 'CONTRACT',
          experienceLevel: 'MID_LEVEL',
          skills: ['Data Analysis', 'SQL', 'Python', 'Excel', 'Power BI', 'Statistics'],
          salaryRange: {
            min: 45000,
            max: 75000,
            currency: 'INR'
          },
          benefits: ['Flexible Schedule', 'Project Based Work', 'Skill Development'],
          requirements: [
            '2-4 years of data analysis experience',
            'Proficiency in SQL and Excel',
            'Knowledge of statistical analysis',
            'Experience with data visualization tools'
          ]
        }
      },
      {
        title: 'Junior UI/UX Designer',
        description: 'Entry-level position for a UI/UX designer to work on web and mobile applications. Great opportunity to learn and grow in a supportive environment.',
        categoryName: 'Jobs',
        numberOfPositions: 1,
        status: 'APPROVED',
        companyId: companies[0]?.id,
        locationId: cities[0]?.id,
        employerId: employers[0]?.id,
        categorySpecificFields: {
          employmentType: 'FULL_TIME',
          experienceLevel: 'ENTRY_LEVEL',
          skills: ['UI Design', 'UX Research', 'Figma', 'Adobe XD', 'Prototyping'],
          salaryRange: {
            min: 25000,
            max: 40000,
            currency: 'INR'
          },
          benefits: ['Mentorship Program', 'Learning Budget', 'Creative Environment'],
          requirements: [
            '0-2 years of design experience',
            'Portfolio showcasing UI/UX projects',
            'Knowledge of design tools like Figma',
            'Understanding of user-centered design principles'
          ]
        }
      }
    ];

    // Create jobs
    const createdJobs = [];
    for (const jobData of sampleJobs) {
      try {
        const job = await prisma.ad.create({
          data: {
            ...jobData,
            approvedAt: new Date(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
          }
        });
        createdJobs.push(job);
        console.log(`✅ Created job: ${job.title}`);
      } catch (error) {
        console.log(`❌ Failed to create job: ${jobData.title}`, error.message);
      }
    }

    console.log(`🎉 Created ${createdJobs.length} sample jobs successfully!`);
    console.log('Jobs include various employment types, experience levels, and salary ranges for testing filters.');

  } catch (error) {
    console.error('❌ Error creating sample jobs:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);