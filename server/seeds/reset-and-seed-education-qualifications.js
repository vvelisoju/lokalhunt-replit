const { PrismaClient } = require('@prisma/client');
const { seedEducationQualifications } = require('./education-qualifications');

const prisma = new PrismaClient();

async function resetAndSeedEducationQualifications() {
  try {
    console.log('🔄 Starting education qualifications reset and seed process...');

    // Delete all existing education qualifications
    console.log('🗑️  Clearing existing education qualifications...');
    const deletedCount = await prisma.educationQualification.deleteMany({});
    console.log(`✅ Deleted ${deletedCount.count} existing education qualifications`);

    // Seed fresh education qualifications
    console.log('🌱 Seeding fresh education qualifications...');
    await seedEducationQualifications();

    console.log('🎉 Education qualifications reset and seed completed successfully!');
  } catch (error) {
    console.error('❌ Error in reset and seed process:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  resetAndSeedEducationQualifications()
    .then(() => {
      console.log('✨ Process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Process failed:', error);
      process.exit(1);
    });
}

module.exports = { resetAndSeedEducationQualifications };