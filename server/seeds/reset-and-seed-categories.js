const { PrismaClient } = require('@prisma/client');
const { DEFAULT_CATEGORIES } = require('./categories.js');

const prisma = new PrismaClient();

async function resetAndSeedCategories() {
  try {
    console.log('🔄 Resetting and seeding categories...');

    // First, delete all existing categories
    const deletedCount = await prisma.jobCategory.deleteMany();
    console.log(`🗑️  Deleted ${deletedCount.count} existing categories`);

    // Now seed the default categories
    const createdCategories = [];
    for (const category of DEFAULT_CATEGORIES) {
      const created = await prisma.jobCategory.create({
        data: {
          name: category.name,
          description: category.description,
          isActive: true
        }
      });
      createdCategories.push(created);
      console.log(`✅ Created category: ${category.name}`);
    }

    console.log(`🎉 Successfully created ${createdCategories.length} categories!`);
    console.log('📊 All default job categories are now available.');

  } catch (error) {
    console.error('❌ Error resetting and seeding categories:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  resetAndSeedCategories()
    .then(() => {
      console.log('✨ Category reset and seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Reset and seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { resetAndSeedCategories };