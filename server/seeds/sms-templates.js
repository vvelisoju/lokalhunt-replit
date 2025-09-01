const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Default SMS templates
const defaultSmsTemplates = [
  {
    templateName: "register_otp",
    message:
      "Your OTP for logging into Lokalhunt is {{OTP}}. Do not share this with anyone.	",
  },
  {
    templateName: "forgot_password_otp",
    message:
      "Your OTP for logging into Lokalhunt is {{OTP}}. Do not share this with anyone.	",
  },
  {
    templateName: "login_otp",
    message:
      "Your OTP for logging into Lokalhunt is {{OTP}}. Do not share this with anyone.	",
  },
];

const seedSmsTemplates = async () => {
  try {
    console.log("📱 Starting SMS templates seeding...");

    // Clear existing templates
    await prisma.smsTemplate.deleteMany({});
    console.log("🧹 Cleared existing SMS templates");

    // Insert default templates
    for (const template of defaultSmsTemplates) {
      await prisma.smsTemplate.create({
        data: template,
      });
    }

    console.log("✅ Default SMS templates seeded successfully");

    const count = await prisma.smsTemplate.count();
    console.log(`📱 Total SMS templates: ${count}`);
  } catch (error) {
    console.error("❌ Error seeding SMS templates:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedSmsTemplates()
    .then(() => {
      console.log("🎉 SMS templates seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Seeding failed:", error);
      process.exit(1);
    });
}

module.exports = { seedSmsTemplates, defaultSmsTemplates };
