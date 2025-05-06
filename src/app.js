// app.js
require('dotenv').config();
console.log('[1] Environment variables loaded');

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
console.log('[2] Core modules imported');

// Database and Services
const { prisma, connectDB } = require('./config/db');
//const logger = require('./config/logger');
try {
  const { prisma, connectDB } = require('./config/db');
} catch (error) {
  console.error('[ERROR] Failed to load db module:', error);
  process.exit(1);
}
console.log('[3] Config modules loaded');

// Initialize Express
const app = express();
console.log('[4] Express app created');

// ========== MIDDLEWARE SETUP ========== //
app.use(helmet());
app.disable('x-powered-by');
console.log('[5] Security middleware applied');

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
}));
console.log('[6] CORS configured');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
console.log('[7] Body parsers configured');

// ========== DATABASE CONNECTION ========== //
const initializeDatabase = async () => {
  try {
    console.log('[8] Attempting database connection...');
    await connectDB();
    console.log('[9] Database connected successfully');
    
    // Verify connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('[10] Database ping successful');
  } catch (error) {
    console.error('[ERROR] Database connection failed:', error);
    process.exit(1);
  }
};

// ========== SERVER SETUP ========== //
const startServer = async () => {
  await initializeDatabase();

  // Routes
  const authRoutes = require('./routes/authRoutes');
  console.log("auth routes setup")
  const taskRoutes = require('./routes/taskRoutes');
  const notificationRoutes = require('./routes/notificationRoutes');
  console.log('[11] Routes imported');

  app.use('/api/auth', authRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/notifications', notificationRoutes);
  console.log('[12] Routes mounted');

  // Health Check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Error Handling
  app.use((err, req, res, next) => {
    console.error('[ERROR]', err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
  });

  const server = http.createServer(app);
  console.log('[13] HTTP server created');

  // WebSocket
  const { initializeSocket } = require('./services/socketService');
  initializeSocket(server);
  console.log('[14] WebSocket initialized');

  // Start Server
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`[15] Server listening on port ${PORT}`);
    console.log(`[16] Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

// ========== START APPLICATION ========== //
startServer().catch(error => {
  console.error('[FATAL] Startup failed:', error);
  process.exit(1);
});

// Handle uncaught errors
process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION]', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[UNCAUGHT EXCEPTION]', error);
  process.exit(1);
});
