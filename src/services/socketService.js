const socketio = require('socket.io');
const { prisma } = require('../config/db');
const logger = require('../config/logger');

let io = null;

const initializeSocket = (server) => {
  io = socketio(server, {
    cors: {
      origin:"http://localhost:3000",
      
      methods: ['GET', 'POST'],
      credentials: true 
    }
  });

  io.on('connection', (socket) => {
    logger.info(`New client connected: ${socket.id}`);

    // Join user-specific room
    socket.on('joinUserRoom', (userId) => {
      socket.join(`user_${userId}`);
      logger.info(`User ${userId} joined their channel`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });

    // Error handling
    socket.on('error', (error) => {
      logger.error(`Socket error: ${error.message}`);
    });
  });
};

const emitNotification = (userId, notification) => {
  io.to(`user_${userId}`).emit('newNotification', notification);
};

const emitNotificationRead = (userId, notificationId) => {
  io.to(`user_${userId}`).emit('notificationRead', notificationId);
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized!');
  return io;
};

module.exports = {
  initializeSocket,
  getIO,
  emitNotification,
  emitNotificationRead
};