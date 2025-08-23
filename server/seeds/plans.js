const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const DEFAULT_PLANS = [
  {
    name: "Self-Service",
    description:
      "Free plan - post jobs and hire directly. Manage your recruitment independently.",
    priceMonthly: 0,
    priceYearly: 0,
    maxJobPosts: null,
    maxShortlists: 50,
    features: [
      "Unlimited job posts",
      "Direct hiring",
      "Basic candidate search",
      "Self-managed recruitment"
    ]
  },
  {
    name: "HR-Assist",
    description:
      "Professional HR team handles recruitment - pay only for successful hires. Get pre-screened, interview-ready candidates at an affordable price.",
    pricePerCandidate: 3000,
    maxJobPosts: null, // unlimited
    maxShortlists: null, // unlimited
    features: [
      "Unlimited job posts",
      "Expert HR screening & evaluation",
      "Top 2 pre-qualified candidates per position",
      "Interview-ready final round candidates",
      "Unlimited replacement within 2 months",
      "Emergency hiring support (24-48 hrs)",
      "Pay only for successful hires",
      "Lowest cost per hire in the market",
      "Dedicated recruitment specialist",
      "Quality guarantee with replacement assurance"
    ]
  },
];

async function seedPlans() {
  try {
    console.log("📋 Starting subscription plans seeding...");

    // Check if plans already exist
    const existingPlans = await prisma.plan.count();

    if (existingPlans > 0) {
      console.log(
        `⚠️  Found ${existingPlans} existing plans. Skipping seed to avoid duplicates.`,
      );
      console.log("💡 To reseed, please clear plans table first.");
      return;
    }

    // Create plans
    const createdPlans = [];
    for (const planData of DEFAULT_PLANS) {
      const created = await prisma.plan.create({
        data: {
          name: planData.name,
          description: planData.description,
          priceMonthly: planData.priceMonthly,
          priceYearly: planData.priceYearly,
          pricePerCandidate: planData.pricePerCandidate,
          maxJobPosts: planData.maxJobPosts,
          maxShortlists: planData.maxShortlists,
          isActive: true,
        },
      });
      createdPlans.push(created);
      console.log(`✅ Created plan: ${planData.name}`);
    }

    console.log(
      `🎯 Successfully created ${createdPlans.length} subscription plans`,
    );
    console.log("📋 Plans seeding completed!");

    return createdPlans;
  } catch (error) {
    console.error("❌ Error seeding plans:", error);
    throw error;
  }
}

async function main() {
  await seedPlans();
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

// Export for use in other files
module.exports = { DEFAULT_PLANS, seedPlans };
