// Example db.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const connectDB = async () => {
  await prisma.$connect();
};

module.exports = { prisma, connectDB };