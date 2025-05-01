// app.js
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const { prisma, connectDB } = require('./config/db');
const logger = require('./config/logger');
const { initializeSocket, getIO } = require('./services/socketService');
const { scheduleRecurringTasks, scheduleLogCleanup } = require('./services/cronService');
const { authLimiter, apiLimiter } = require('./middlewares/rateLimit');

// Import routes
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Initialize Express app
const app = express();

// Security Middleware
app.use(helmet());
app.disable('x-powered-by');

// CORS Configuration
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
}));

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate Limiting
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

// Database Connection
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: prisma._engine.connected ? 'connected' : 'disconnected'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  logger.error(`Global error: ${err.stack}`);
  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Create HTTP Server
const server = http.createServer(app);

// Initialize WebSocket Service
initializeSocket(server);

// Schedule Background Jobs
if (process.env.NODE_ENV !== 'test') {
  scheduleRecurringTasks();
  scheduleLogCleanup();
}

// Server Startup
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Graceful Shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

module.exports = app;