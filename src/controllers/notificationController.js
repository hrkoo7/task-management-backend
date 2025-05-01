const { prisma } = require('../config/db');
const logger = require('../config/logger');
const { getIO } = require('../services/socketService');

const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    res.json(notifications);
  } catch (error) {
    logger.error(`Notification fetch error: ${error.message}`);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: Number(req.params.id) },
      data: { read: true }
    });

    getIO().emit('notification:read', notification);
    res.json(notification);
  } catch (error) {
    logger.error(`Mark read error: ${error.message}`);
    res.status(500).json({ message: 'Failed to update notification' });
  }
};

const createNotification = async (userId, message, type = 'IN_APP') => {
  try {
    const notification = await prisma.notification.create({
      data: {
        message,
        type,
        userId
      }
    });

    getIO().to(`user_${userId}`).emit('notification:new', notification);
    return notification;
  } catch (error) {
    logger.error(`Notification creation error: ${error.message}`);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  createNotification
};