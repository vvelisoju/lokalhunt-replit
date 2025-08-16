const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  { name: 'Driver', description: 'Professional drivers for various vehicles and transportation services' },
  { name: 'Delivery & Courier', description: 'Package delivery, courier services, and logistics support' },
  { name: 'Security Guard', description: 'Security personnel for residential, commercial, and industrial properties' },
  { name: 'Housekeeping & Cleaning', description: 'Residential and commercial cleaning services' },
  { name: 'Cook / Chef / Kitchen Staff', description: 'Kitchen professionals, cooks, chefs, and culinary staff' },
  { name: 'Waiter / Hotel Staff', description: 'Hospitality service staff for restaurants, hotels, and events' },
  { name: 'Labour / Construction Worker', description: 'Construction workers, laborers, and building trades' },
  { name: 'Electrician / Plumber / Technician', description: 'Skilled trades and technical repair services' },
  { name: 'Mechanic / Vehicle Repair', description: 'Automotive mechanics and vehicle maintenance specialists' },
  { name: 'Garments & Textile Worker', description: 'Textile industry workers, tailors, and garment manufacturing' },
  { name: 'Shop Salesman / Retail Staff', description: 'Retail sales associates and shop floor staff' },
  { name: 'Telecalling / BPO Support', description: 'Call center agents, customer support, and BPO services' },
  { name: 'Marketing & Sales Executive', description: 'Sales professionals and marketing executives' },
  { name: 'Medical & Healthcare Support', description: 'Healthcare assistants, medical support staff, and paramedical roles' },
  { name: 'Teacher / Trainer / Tutor', description: 'Educational professionals, trainers, and tutoring services' },
  { name: 'Banking & Office Staff', description: 'Banking professionals and office support staff' },
  { name: 'Administrative & Clerk Roles', description: 'Administrative assistants, clerks, and office support roles' },
  { name: 'IT & Computer Operator', description: 'Computer operators, IT support, and technical assistance' },
  { name: 'Media & Printing', description: 'Print media, publishing, and graphic design services' },
  { name: 'Engineering & Technical', description: 'Engineers, technical specialists, and skilled technical roles' },
  { name: 'Delivery Management / Supervisor', description: 'Supervisory roles in delivery and logistics management' },
  { name: 'Others / Miscellaneous Jobs', description: 'Various other job categories and specialized roles' }
];

async function seedCategories() {
  try {
    console.log('🌱 Starting category seeding...');

    // Check if categories already exist
    const existingCategories = await prisma.jobCategory.count();
    
    if (existingCategories > 0) {
      console.log(`⚠️  Found ${existingCategories} existing categories. Skipping seed to avoid duplicates.`);
      console.log('💡 To reseed, please clear categories table first.');
      return;
    }

    // Create categories
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
    console.log('📊 Categories are now available for job postings.');

  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Export for use in other files
module.exports = { DEFAULT_CATEGORIES, seedCategories };

// Run if called directly
if (require.main === module) {
  seedCategories()
    .then(() => {
      console.log('✨ Category seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}