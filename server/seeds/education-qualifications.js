const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DEFAULT_EDUCATION_QUALIFICATIONS = [
  { name: 'No Formal Education', description: 'No formal educational background', sortOrder: 1 },
  { name: 'Primary School (Up to 5th)', description: 'Primary school education up to 5th standard', sortOrder: 2 },
  { name: 'Below 10th Pass', description: 'School education below 10th standard', sortOrder: 3 },
  { name: '10th Pass / SSC / Matric', description: 'Secondary School Certificate or Matriculation', sortOrder: 4 },
  { name: '12th Pass / HSC / Intermediate', description: 'Higher Secondary Certificate or Intermediate', sortOrder: 5 },
  { name: 'ITI / Vocational Training', description: 'Industrial Training Institute or vocational training programs', sortOrder: 6 },
  { name: 'Polytechnic / Advanced Diploma', description: 'Polytechnic education or advanced diploma courses', sortOrder: 7 },
  { name: 'Diploma', description: 'General diploma in various fields', sortOrder: 8 },
  { name: 'Undergraduate (UG)', description: 'Bachelor\'s degree or undergraduate programs', sortOrder: 9 },
  { name: 'Postgraduate (PG)', description: 'Master\'s degree or postgraduate programs', sortOrder: 10 },
  { name: 'Doctorate / PhD', description: 'Doctoral degree or PhD programs', sortOrder: 11 },
  { name: 'Professional Certification', description: 'Professional certifications and specialized training', sortOrder: 12 },
  { name: 'Others', description: 'Other educational qualifications not listed above', sortOrder: 13 }
];

async function seedEducationQualifications() {
  try {
    console.log('🎓 Starting education qualifications seeding...');

    // Check if education qualifications already exist
    const existingQualifications = await prisma.educationQualification.count();
    
    if (existingQualifications > 0) {
      console.log(`⚠️  Found ${existingQualifications} existing education qualifications. Skipping seed to avoid duplicates.`);
      console.log('💡 To reseed, please clear education_qualifications table first.');
      return;
    }

    // Create education qualifications
    const createdQualifications = [];
    for (const qualification of DEFAULT_EDUCATION_QUALIFICATIONS) {
      const created = await prisma.educationQualification.create({
        data: {
          name: qualification.name,
          description: qualification.description,
          sortOrder: qualification.sortOrder,
          isActive: true
        }
      });
      createdQualifications.push(created);
      console.log(`✅ Created education qualification: ${qualification.name}`);
    }

    console.log(`🎯 Successfully created ${createdQualifications.length} education qualifications`);
    console.log('📚 Education qualifications seeding completed!');
    
    return createdQualifications;
  } catch (error) {
    console.error('❌ Error seeding education qualifications:', error);
    throw error;
  }
}

async function main() {
  await seedEducationQualifications();
}

// Run if called directly
if (require.main === module) {
  main()
    .then(() => {
      console.log('🎉 Education qualifications seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Education qualifications seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedEducationQualifications, DEFAULT_EDUCATION_QUALIFICATIONS };