let prisma = null;

try {
  const { PrismaClient } = require('@prisma/client');
  prisma = new PrismaClient();
} catch (error) {
  console.warn('Prisma not initialised. Set DATABASE_URL to enable DB features.');
}

module.exports = prisma;
