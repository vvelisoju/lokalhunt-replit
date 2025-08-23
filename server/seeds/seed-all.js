const { PrismaClient } = require('@prisma/client');
const { seedCategories } = require('./categories');
const { seedEducationQualifications } = require('./education-qualifications');
const { seedCities, DEFAULT_CITIES } = require('./cities');

const prisma = new PrismaClient();

// New function to seed default plans
async function seedPlans() {
  console.log('\n⭐ Step 4: Seeding Subscription Plans');
  await prisma.plan.createMany({
    data: [
      { name: 'Self-Service', description: 'Free plan, post & hire directly', priceMonthly: 0, priceYearly: 0 },
      { name: 'HR-Assist', description: 'HR shortlists candidates, employer pays per hire', pricePerCandidate: 2000 }
    ],
    skipDuplicates: true
  });
  console.log('✅ Subscription plans seeded.');
}

async function seedAll() {
  try {
    console.log('🌱 Starting comprehensive seeding process...');
    console.log('=====================================');

    // Seed in order: Cities -> Categories -> Education Qualifications -> Plans

    // 1. Seed Cities
    console.log('\n📍 Step 1: Seeding Cities');
    await seedCities();

    // 2. Seed Categories
    console.log('\n📂 Step 2: Seeding Job Categories');
    await seedCategories();

    // 3. Seed Education Qualifications
    console.log('\n🎓 Step 3: Seeding Education Qualifications');
    await seedEducationQualifications();

    // 4. Seed Plans
    await seedPlans();

    console.log('\n=====================================');
    console.log('🎉 All seeding completed successfully!');
    console.log('\n📊 Summary:');

    // Get counts for summary
    const citiesCount = await prisma.city.count();
    const categoriesCount = await prisma.jobCategory.count();
    const educationCount = await prisma.educationQualification.count();
    const plansCount = await prisma.plan.count(); // Get count for plans

    console.log(`🏙️  Cities: ${citiesCount}`);
    console.log(`📂 Job Categories: ${categoriesCount}`);
    console.log(`🎓 Education Qualifications: ${educationCount}`);
    console.log(`⭐ Subscription Plans: ${plansCount}`); // Display plans count

    console.log('\n✨ Your LokalHunt database is now ready with core data!');

  } catch (error) {
    console.error('💥 Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Export for use in other files
module.exports = { seedAll, seedCities, DEFAULT_CITIES };

// Run if called directly
if (require.main === module) {
  seedAll()
    .then(() => {
      console.log('🚀 Seed process completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seed process failed:', error);
      process.exit(1);
    });
}