// Package scripts for database operations
module.exports = {
  scripts: {
    'db:seed:categories': 'node seeds/categories.js',
    'db:seed:all': 'node seeds/categories.js',
    'db:push': 'npx prisma db push',
    'db:migrate': 'npx prisma migrate dev',
    'db:studio': 'npx prisma studio',
    'db:reset': 'npx prisma migrate reset'
  }
};