const { PrismaClient } = require('@prisma/client');
const logger = require('./logger');

const prisma = new PrismaClient({
  log: [
    { level: 'warn', emit: 'event' },
    { level: 'info', emit: 'event' },
    { level: 'error', emit: 'event' },
  ],
});

// Add Prisma logging
prisma.$on('warn', (e) => logger.warn(e.message));
prisma.$on('info', (e) => logger.info(e.message));
prisma.$on('error', (e) => logger.error(e.message));

// Database connection handler
const connectDB = async () => {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { prisma, connectDB };