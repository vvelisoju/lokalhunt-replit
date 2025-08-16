const { PrismaClient } = require('@prisma/client');
const bcryptjs = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Seeding sample data...');

    // Create cities
    const cities = await Promise.all([
      prisma.city.upsert({
        where: { name_state: { name: 'Hyderabad', state: 'Telangana' } },
        update: {},
        create: {
          name: 'Hyderabad',
          state: 'Telangana',
          country: 'India'
        }
      }),
      prisma.city.upsert({
        where: { name_state: { name: 'Vijayawada', state: 'Andhra Pradesh' } },
        update: {},
        create: {
          name: 'Vijayawada',
          state: 'Andhra Pradesh',
          country: 'India'
        }
      }),
      prisma.city.upsert({
        where: { name_state: { name: 'Visakhapatnam', state: 'Andhra Pradesh' } },
        update: {},
        create: {
          name: 'Visakhapatnam',
          state: 'Andhra Pradesh',
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

    console.log('✅ Cities created');

    // Create sample employer users first (they need to exist before companies)
    const employerPassword = await bcryptjs.hash('password123', 12);
    const employers = await Promise.all([
      prisma.user.upsert({
        where: { email: 'employer1@techcorp.com' },
        update: {},
        create: {
          name: 'John Smith',
          firstName: 'John',
          lastName: 'Smith',
          email: 'employer1@techcorp.com',
          phone: '+919876543210',
          passwordHash: employerPassword,
          role: 'EMPLOYER',
          cityId: cities[0].id,
          employer: {
            create: {}
          }
        },
        include: { employer: true }
      }),
      prisma.user.upsert({
        where: { email: 'employer2@dmhub.com' },
        update: {},
        create: {
          name: 'Sarah Johnson',
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'employer2@dmhub.com',
          phone: '+919876543211',
          passwordHash: employerPassword,
          role: 'EMPLOYER',
          cityId: cities[1].id,
          employer: {
            create: {}
          }
        },
        include: { employer: true }
      })
    ]);

    console.log('✅ Employers created');

    // Create sample companies using employer IDs
    const companies = await Promise.all([
      prisma.company.create({
        data: {
          name: 'TechCorp Solutions',
          industry: 'Technology',
          size: 'MEDIUM',
          website: 'https://techcorp.com',
          description: 'Leading technology solutions provider',
          cityId: cities[0].id,
          employerId: employers[0].employer.id
        }
      }),
      prisma.company.create({
        data: {
          name: 'Digital Marketing Hub',
          industry: 'Marketing',
          size: 'SMALL',
          website: 'https://dmhub.com',
          description: 'Full-service digital marketing agency',
          cityId: cities[1].id,
          employerId: employers[1].employer.id
        }
      }),
      prisma.company.create({
        data: {
          name: 'HealthCare Plus',
          industry: 'Healthcare',
          size: 'LARGE',
          website: 'https://healthcareplus.com',
          description: 'Comprehensive healthcare services',
          cityId: cities[2].id,
          employerId: employers[0].employer.id
        }
      }),
      prisma.company.create({
        data: {
          name: 'EduTech Innovations',
          industry: 'Education',
          size: 'MEDIUM',
          website: 'https://edutech.com',
          description: 'Educational technology solutions',
          cityId: cities[3].id,
          employerId: employers[1].employer.id
        }
      })
    ]);

    console.log('✅ Companies created');

    // Create sample job ads
    const jobAds = await Promise.all([
      prisma.ad.create({
        data: {
          title: 'Senior Full Stack Developer',
          description: 'We are looking for an experienced Full Stack Developer to join our dynamic team. You will be responsible for developing and maintaining web applications using modern technologies.',
          categoryName: 'Jobs',
          numberOfPositions: 2,
          status: 'APPROVED',
          companyId: companies[0].id,
          locationId: cities[0].id,
          employerId: employers[0].employer.id,
          categorySpecificFields: {
            employmentType: 'FULL_TIME',
            experienceLevel: 'MID_LEVEL',
            skills: ['React', 'Node.js', 'PostgreSQL', 'JavaScript'],
            salaryRange: {
              min: 60000,
              max: 90000,
              currency: 'INR'
            },
            benefits: ['Health Insurance', 'Flexible Hours', 'Work from Home'],
            requirements: [
              '3+ years of experience in full-stack development',
              'Proficiency in React and Node.js',
              'Experience with databases and APIs',
              'Good communication skills'
            ]
          },
          approvedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        }
      }),
      prisma.ad.create({
        data: {
          title: 'Digital Marketing Specialist',
          description: 'Join our marketing team as a Digital Marketing Specialist. You will create and manage digital campaigns, analyze performance metrics, and drive online growth.',
          categoryName: 'Jobs',
          numberOfPositions: 1,
          status: 'APPROVED',
          companyId: companies[1].id,
          locationId: cities[1].id,
          employerId: employers[1].employer.id,
          categorySpecificFields: {
            employmentType: 'FULL_TIME',
            experienceLevel: 'ENTRY_LEVEL',
            skills: ['Digital Marketing', 'SEO', 'Social Media', 'Google Ads'],
            salaryRange: {
              min: 25000,
              max: 40000,
              currency: 'INR'
            },
            benefits: ['Performance Bonus', 'Training Programs', 'Career Growth'],
            requirements: [
              '1-2 years of digital marketing experience',
              'Knowledge of SEO and social media marketing',
              'Analytical mindset',
              'Creative thinking abilities'
            ]
          },
          approvedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      }),
      prisma.ad.create({
        data: {
          title: 'Registered Nurse',
          description: 'We are seeking a compassionate and skilled Registered Nurse to provide excellent patient care in our healthcare facility.',
          categoryName: 'Jobs',
          numberOfPositions: 3,
          status: 'APPROVED',
          companyId: companies[2].id,
          locationId: cities[2].id,
          employerId: employers[0].employer.id, // Using first employer for now
          categorySpecificFields: {
            employmentType: 'FULL_TIME',
            experienceLevel: 'MID_LEVEL',
            skills: ['Patient Care', 'Medical Knowledge', 'Emergency Response', 'Documentation'],
            salaryRange: {
              min: 35000,
              max: 50000,
              currency: 'INR'
            },
            benefits: ['Medical Insurance', 'Professional Development', 'Shift Allowance'],
            requirements: [
              'Valid nursing license',
              '2+ years of clinical experience',
              'Strong communication skills',
              'Ability to work in shifts'
            ]
          },
          approvedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      }),
      prisma.ad.create({
        data: {
          title: 'Python Developer (Remote)',
          description: 'Remote opportunity for a skilled Python Developer to work on cutting-edge educational technology projects.',
          categoryName: 'Jobs',
          numberOfPositions: 2,
          status: 'APPROVED',
          companyId: companies[3].id,
          locationId: cities[3].id,
          employerId: employers[0].employer.id,
          categorySpecificFields: {
            employmentType: 'FULL_TIME',
            experienceLevel: 'SENIOR_LEVEL',
            skills: ['Python', 'Django', 'REST APIs', 'Machine Learning'],
            salaryRange: {
              min: 80000,
              max: 120000,
              currency: 'INR'
            },
            benefits: ['Remote Work', 'Stock Options', 'Learning Budget'],
            requirements: [
              '5+ years of Python development experience',
              'Experience with Django framework',
              'Knowledge of machine learning libraries',
              'Self-motivated and independent'
            ]
          },
          approvedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      }),
      prisma.ad.create({
        data: {
          title: 'UI/UX Designer',
          description: 'Creative UI/UX Designer needed to design intuitive and engaging user interfaces for our web and mobile applications.',
          categoryName: 'Jobs',
          numberOfPositions: 1,
          status: 'APPROVED',
          companyId: companies[0].id,
          locationId: cities[0].id,
          employerId: employers[0].employer.id,
          categorySpecificFields: {
            employmentType: 'FULL_TIME',
            experienceLevel: 'MID_LEVEL',
            skills: ['UI Design', 'UX Research', 'Figma', 'Prototyping'],
            salaryRange: {
              min: 45000,
              max: 70000,
              currency: 'INR'
            },
            benefits: ['Creative Freedom', 'Latest Tools', 'Design Conference'],
            requirements: [
              '3+ years of UI/UX design experience',
              'Proficiency in design tools like Figma',
              'Portfolio showcasing design projects',
              'Understanding of user-centered design'
            ]
          },
          approvedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      }),
      prisma.ad.create({
        data: {
          title: 'Content Writer',
          description: 'We are looking for a talented Content Writer to create engaging content for our digital marketing campaigns and website.',
          categoryName: 'Jobs',
          numberOfPositions: 1,
          status: 'APPROVED',
          companyId: companies[1].id,
          locationId: cities[1].id,
          employerId: employers[1].employer.id,
          categorySpecificFields: {
            employmentType: 'PART_TIME',
            experienceLevel: 'ENTRY_LEVEL',
            skills: ['Content Writing', 'SEO Writing', 'Research', 'Editing'],
            salaryRange: {
              min: 15000,
              max: 25000,
              currency: 'INR'
            },
            benefits: ['Flexible Hours', 'Byline Credit', 'Skill Development'],
            requirements: [
              'Strong writing and editing skills',
              'Knowledge of SEO principles',
              'Ability to research and write on various topics',
              'Attention to detail'
            ]
          },
          approvedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      })
    ]);

    console.log('✅ Job ads created');

    // Create some sample candidates for statistics
    const candidatePassword = await bcryptjs.hash('password123', 12);
    const candidates = [];
    
    for (let i = 1; i <= 10; i++) {
      const candidate = await prisma.user.create({
        data: {
          name: `Candidate ${i}`,
          firstName: `Candidate`,
          lastName: `${i}`,
          email: `candidate${i}@example.com`,
          phone: `+9187654321${i.toString().padStart(2, '0')}`,
          passwordHash: candidatePassword,
          role: 'CANDIDATE',
          cityId: cities[i % cities.length].id,
          candidate: {
            create: {
              profileData: {
                bio: `I am a motivated professional with experience in various fields.`,
                location: cities[i % cities.length].name
              },
              overallRating: Math.random() * 2 + 3, // Random rating between 3-5
            }
          }
        },
        include: { candidate: true }
      });
      candidates.push(candidate);
    }

    console.log('✅ Sample candidates created');

    console.log('🎉 Sample data seeding completed!');
    console.log(`Created: ${cities.length} cities, ${companies.length} companies, ${jobAds.length} job ads, ${candidates.length} candidates`);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });