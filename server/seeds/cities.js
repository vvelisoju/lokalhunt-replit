
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Telangana and Andhra Pradesh districts data
const DEFAULT_CITIES = [
  // Telangana Districts
  { name: 'Hyderabad', state: 'Telangana', country: 'India' },
  { name: 'Warangal', state: 'Telangana', country: 'India' },
  { name: 'Nizamabad', state: 'Telangana', country: 'India' },
  { name: 'Khammam', state: 'Telangana', country: 'India' },
  { name: 'Karimnagar', state: 'Telangana', country: 'India' },
  { name: 'Ramagundam', state: 'Telangana', country: 'India' },
  { name: 'Mahbubnagar', state: 'Telangana', country: 'India' },
  { name: 'Nalgonda', state: 'Telangana', country: 'India' },
  { name: 'Adilabad', state: 'Telangana', country: 'India' },
  { name: 'Suryapet', state: 'Telangana', country: 'India' },
  { name: 'Miryalaguda', state: 'Telangana', country: 'India' },
  { name: 'Jagtial', state: 'Telangana', country: 'India' },
  { name: 'Mancherial', state: 'Telangana', country: 'India' },
  { name: 'Sangareddy', state: 'Telangana', country: 'India' },
  { name: 'Medak', state: 'Telangana', country: 'India' },
  { name: 'Siddipet', state: 'Telangana', country: 'India' },
  { name: 'Jangaon', state: 'Telangana', country: 'India' },
  { name: 'Peddapalli', state: 'Telangana', country: 'India' },
  { name: 'Wanaparthy', state: 'Telangana', country: 'India' },
  { name: 'Kamareddy', state: 'Telangana', country: 'India' },
  { name: 'Vikarabad', state: 'Telangana', country: 'India' },
  { name: 'Gadwal', state: 'Telangana', country: 'India' },
  { name: 'Nagarkurnool', state: 'Telangana', country: 'India' },
  { name: 'Jogulamba Gadwal', state: 'Telangana', country: 'India' },
  { name: 'Rajanna Sircilla', state: 'Telangana', country: 'India' },
  { name: 'Bhadradri Kothagudem', state: 'Telangana', country: 'India' },
  { name: 'Mahabubabad', state: 'Telangana', country: 'India' },
  { name: 'Jayashankar Bhupalpally', state: 'Telangana', country: 'India' },
  { name: 'Mulugu', state: 'Telangana', country: 'India' },
  { name: 'Narayanpet', state: 'Telangana', country: 'India' },
  { name: 'Medchal Malkajgiri', state: 'Telangana', country: 'India' },
  { name: 'Rangareddy', state: 'Telangana', country: 'India' },
  { name: 'Yadadri Bhuvanagiri', state: 'Telangana', country: 'India' },

  // Andhra Pradesh Districts
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', country: 'India' },
  { name: 'Vijayawada', state: 'Andhra Pradesh', country: 'India' },
  { name: 'Guntur', state: 'Andhra Pradesh', country: 'India' },
  { name: 'Nellore', state: 'Andhra Pradesh', country: 'India' },
  { name: 'Kurnool', state: 'Andhra Pradesh', country: 'India' },
  { name: 'Rajahmundry', state: 'Andhra Pradesh', country: 'India' },
  { name: 'Tirupati', state: 'Andhra Pradesh', country: 'India' },
  { name: 'Kadapa', state: 'Andhra Pradesh', country: 'India' },
  { name: 'Kakinada', state: 'Andhra Pradesh', country: 'India' },
  { name: 'Anantapur', state: 'Andhra Pradesh', country: 'India' },
  { name: 'Vizianagaram', state: 'Andhra Pradesh', country: 'India' },
  { name: 'Eluru', state: 'Andhra Pradesh', country: 'India' },
  { name: 'Ongole', state: 'Andhra Pradesh', country: 'India' },
  { name: 'Nandyal', state: 'Andhra Pradesh', country: 'India' },
  { name: 'Machilipatnam', state: 'Andhra Pradesh', country: 'India' },
  { name: 'Adoni', state: 'Andhra Pradesh', country: 'India' },
  { name: 'Tenali', state: 'Andhra Pradesh', country: 'India' },
  { name: 'Chittoor', state: 'Andhra Pradesh', country: 'India' },
  { name: 'Hindupur', state: 'Andhra Pradesh', country: 'India' },
  { name: 'Proddatur', state: 'Andhra Pradesh', country: 'India' },
  { name: 'Bhimavaram', state: 'Andhra Pradesh', country: 'India' },
  { name: 'Madanapalle', state: 'Andhra Pradesh', country: 'India' },
  { name: 'Guntakal', state: 'Andhra Pradesh', country: 'India' },
  { name: 'Dharmavaram', state: 'Andhra Pradesh', country: 'India' },
  { name: 'Gudivada', state: 'Andhra Pradesh', country: 'India' },
  { name: 'Narasaraopet', state: 'Andhra Pradesh', country: 'India' },
  { name: 'Tadipatri', state: 'Andhra Pradesh', country: 'India' },
  { name: 'Mangalagiri', state: 'Andhra Pradesh', country: 'India' },
  { name: 'Chilakaluripet', state: 'Andhra Pradesh', country: 'India' }
];

async function seedCities() {
  try {
    console.log('🏙️  Starting cities seeding...');

    // Check if cities already exist
    const existingCities = await prisma.city.count();
    
    if (existingCities > 0) {
      console.log(`⚠️  Found ${existingCities} existing cities. Skipping seed to avoid duplicates.`);
      console.log('💡 To reseed, please clear cities table first.');
      return;
    }

    // Create cities
    const createdCities = [];
    for (const cityData of DEFAULT_CITIES) {
      const created = await prisma.city.create({
        data: {
          name: cityData.name,
          state: cityData.state,
          country: cityData.country
        }
      });
      createdCities.push(created);
      console.log(`✅ Created city: ${cityData.name}, ${cityData.state}`);
    }

    console.log(`🎯 Successfully created ${createdCities.length} cities`);
    console.log('🏙️  Cities seeding completed!');
    
    return createdCities;
  } catch (error) {
    console.error('❌ Error seeding cities:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Export for use in other files
module.exports = { DEFAULT_CITIES, seedCities };

// Run if called directly
if (require.main === module) {
  seedCities()
    .then(() => {
      console.log('✨ Cities seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Cities seeding failed:', error);
      process.exit(1);
    });
}
