
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const skillsData = [
  // Technical Skills
  { name: 'JavaScript', category: 'Technical', description: 'Programming language for web development' },
  { name: 'Python', category: 'Technical', description: 'Programming language for development and data science' },
  { name: 'Java', category: 'Technical', description: 'Object-oriented programming language' },
  { name: 'React', category: 'Technical', description: 'Frontend JavaScript library' },
  { name: 'Node.js', category: 'Technical', description: 'JavaScript runtime for server-side development' },
  { name: 'HTML/CSS', category: 'Technical', description: 'Web markup and styling languages' },
  { name: 'SQL', category: 'Technical', description: 'Database query language' },
  { name: 'Git', category: 'Technical', description: 'Version control system' },
  { name: 'AWS', category: 'Technical', description: 'Amazon Web Services cloud platform' },
  { name: 'Docker', category: 'Technical', description: 'Containerization platform' },
  { name: 'MongoDB', category: 'Technical', description: 'NoSQL database' },
  { name: 'TypeScript', category: 'Technical', description: 'Typed superset of JavaScript' },
  { name: 'Angular', category: 'Technical', description: 'Frontend TypeScript framework' },
  { name: 'Vue.js', category: 'Technical', description: 'Progressive JavaScript framework' },
  { name: 'PHP', category: 'Technical', description: 'Server-side scripting language' },
  { name: 'C++', category: 'Technical', description: 'General-purpose programming language' },
  { name: 'C#', category: 'Technical', description: 'Microsoft programming language' },
  { name: '.NET', category: 'Technical', description: 'Microsoft development framework' },
  
  // Office & Administrative Skills
  { name: 'MS Office', category: 'Office', description: 'Microsoft Office suite' },
  { name: 'Excel', category: 'Office', description: 'Spreadsheet application' },
  { name: 'PowerPoint', category: 'Office', description: 'Presentation software' },
  { name: 'Word', category: 'Office', description: 'Word processing software' },
  { name: 'Data Entry', category: 'Office', description: 'Accurate data input and management' },
  { name: 'Typing', category: 'Office', description: 'Fast and accurate typing skills' },
  { name: 'Email Management', category: 'Office', description: 'Professional email handling' },
  { name: 'File Management', category: 'Office', description: 'Organizing and maintaining files' },
  
  // Local Job Skills
  { name: 'Driving', category: 'Local', description: 'Vehicle operation and navigation' },
  { name: 'Delivery', category: 'Local', description: 'Package and goods delivery' },
  { name: 'Food Service', category: 'Local', description: 'Restaurant and food preparation' },
  { name: 'Retail', category: 'Local', description: 'Customer service in retail environment' },
  { name: 'Security', category: 'Local', description: 'Security and surveillance' },
  { name: 'Housekeeping', category: 'Local', description: 'Cleaning and maintenance services' },
  { name: 'Electrical Work', category: 'Local', description: 'Electrical installation and repair' },
  { name: 'Plumbing', category: 'Local', description: 'Plumbing installation and repair' },
  { name: 'Carpentry', category: 'Local', description: 'Woodworking and construction' },
  { name: 'Painting', category: 'Local', description: 'Interior and exterior painting' },
  { name: 'Cooking', category: 'Local', description: 'Food preparation and cooking' },
  { name: 'Gardening', category: 'Local', description: 'Landscaping and plant care' },
  { name: 'Tailoring', category: 'Local', description: 'Clothing alteration and creation' },
  { name: 'Hair Styling', category: 'Local', description: 'Hair cutting and styling' },
  { name: 'Massage Therapy', category: 'Local', description: 'Therapeutic massage services' },
  
  // Soft Skills
  { name: 'Communication', category: 'Soft Skills', description: 'Effective verbal and written communication' },
  { name: 'Customer Service', category: 'Soft Skills', description: 'Helping and serving customers' },
  { name: 'Sales', category: 'Soft Skills', description: 'Selling products and services' },
  { name: 'Team Leadership', category: 'Soft Skills', description: 'Leading and managing teams' },
  { name: 'Project Management', category: 'Soft Skills', description: 'Planning and executing projects' },
  { name: 'Problem Solving', category: 'Soft Skills', description: 'Analyzing and solving problems' },
  { name: 'Time Management', category: 'Soft Skills', description: 'Efficiently managing time and priorities' },
  { name: 'Multitasking', category: 'Soft Skills', description: 'Handling multiple tasks simultaneously' },
  { name: 'Attention to Detail', category: 'Soft Skills', description: 'Careful and thorough work approach' },
  { name: 'Adaptability', category: 'Soft Skills', description: 'Adjusting to changing circumstances' },
  { name: 'Teamwork', category: 'Soft Skills', description: 'Working effectively with others' },
  { name: 'Negotiation', category: 'Soft Skills', description: 'Reaching mutually beneficial agreements' },
  { name: 'Public Speaking', category: 'Soft Skills', description: 'Speaking confidently to groups' },
  { name: 'Critical Thinking', category: 'Soft Skills', description: 'Analyzing situations objectively' },
  
  // Management & Business
  { name: 'Agile', category: 'Management', description: 'Agile project management methodology' },
  { name: 'Scrum', category: 'Management', description: 'Scrum framework for project management' },
  { name: 'Strategic Planning', category: 'Management', description: 'Long-term business planning' },
  { name: 'Budget Management', category: 'Management', description: 'Financial planning and control' },
  { name: 'Quality Assurance', category: 'Management', description: 'Ensuring product and service quality' },
  { name: 'Process Improvement', category: 'Management', description: 'Optimizing business processes' },
  { name: 'Vendor Management', category: 'Management', description: 'Managing supplier relationships' },
  { name: 'Risk Management', category: 'Management', description: 'Identifying and mitigating risks' },
  
  // Marketing & Content
  { name: 'Digital Marketing', category: 'Marketing', description: 'Online marketing strategies' },
  { name: 'SEO', category: 'Marketing', description: 'Search engine optimization' },
  { name: 'Content Writing', category: 'Marketing', description: 'Creating engaging written content' },
  { name: 'Social Media', category: 'Marketing', description: 'Social media management and marketing' },
  { name: 'Graphic Design', category: 'Marketing', description: 'Visual design and graphics creation' },
  { name: 'Photography', category: 'Marketing', description: 'Professional photography services' },
  { name: 'Video Editing', category: 'Marketing', description: 'Video production and editing' },
  { name: 'Copywriting', category: 'Marketing', description: 'Persuasive marketing copy' },
  { name: 'Brand Management', category: 'Marketing', description: 'Managing brand identity and reputation' },
  
  // Finance & Accounting
  { name: 'Accounting', category: 'Finance', description: 'Financial record keeping and analysis' },
  { name: 'Bookkeeping', category: 'Finance', description: 'Maintaining financial records' },
  { name: 'Tax Preparation', category: 'Finance', description: 'Preparing tax documents and returns' },
  { name: 'Financial Analysis', category: 'Finance', description: 'Analyzing financial data and trends' },
  { name: 'Payroll Management', category: 'Finance', description: 'Managing employee compensation' },
  { name: 'Invoicing', category: 'Finance', description: 'Creating and managing invoices' },
  { name: 'Banking', category: 'Finance', description: 'Banking operations and services' },
  
  // Languages
  { name: 'English Fluency', category: 'Language', description: 'Fluent in English language' },
  { name: 'Hindi', category: 'Language', description: 'Hindi language proficiency' },
  { name: 'Telugu', category: 'Language', description: 'Telugu language proficiency' },
  { name: 'Tamil', category: 'Language', description: 'Tamil language proficiency' },
  { name: 'Kannada', category: 'Language', description: 'Kannada language proficiency' },
  { name: 'Malayalam', category: 'Language', description: 'Malayalam language proficiency' },
  { name: 'Bengali', category: 'Language', description: 'Bengali language proficiency' },
  { name: 'Marathi', category: 'Language', description: 'Marathi language proficiency' },
  { name: 'Gujarati', category: 'Language', description: 'Gujarati language proficiency' }
];

async function seedSkills() {
  console.log('🎯 Seeding Skills...');
  
  try {
    await prisma.skill.createMany({
      data: skillsData,
      skipDuplicates: true
    });
    
    console.log(`✅ ${skillsData.length} skills seeded successfully`);
  } catch (error) {
    console.error('❌ Error seeding skills:', error);
    throw error;
  }
}

module.exports = { seedSkills };

// Run if called directly
if (require.main === module) {
  seedSkills()
    .then(() => {
      console.log('🎉 Skills seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Skills seeding failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
