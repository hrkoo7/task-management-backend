const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead } = require('../controllers/notificationController');
const {authenticate} = require('../middlewares/auth');

// Get user notifications
router.get('/', authenticate, getNotifications);

// Mark notification as read
router.patch('/:id/read', authenticate, markAsRead);

module.exports = router;