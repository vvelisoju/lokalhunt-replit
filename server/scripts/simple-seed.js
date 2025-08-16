const { PrismaClient } = require('@prisma/client');
const bcryptjs = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Creating simple sample data...');

    // Create cities
    const cities = [];
    const cityData = [
      { name: 'Hyderabad', state: 'Telangana' },
      { name: 'Vijayawada', state: 'Andhra Pradesh' },
      { name: 'Visakhapatnam', state: 'Andhra Pradesh' },
      { name: 'Bangalore', state: 'Karnataka' }
    ];

    for (const cityInfo of cityData) {
      const city = await prisma.city.findFirst({
        where: { name: cityInfo.name, state: cityInfo.state }
      });
      
      if (!city) {
        const newCity = await prisma.city.create({
          data: {
            name: cityInfo.name,
            state: cityInfo.state,
            country: 'India'
          }
        });
        cities.push(newCity);
      } else {
        cities.push(city);
      }
    }

    console.log('✅ Cities ready');

    // Create sample candidates for statistics
    const candidatePassword = await bcryptjs.hash('password123', 12);
    
    for (let i = 1; i <= 5; i++) {
      const existingUser = await prisma.user.findFirst({
        where: { email: `candidate${i}@example.com` }
      });
      
      if (!existingUser) {
        await prisma.user.create({
          data: {
            name: `Test Candidate ${i}`,
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
                overallRating: Math.random() * 2 + 3,
              }
            }
          }
        });
      }
    }

    console.log('✅ Sample candidates created');
    console.log('🎉 Basic data ready!');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);