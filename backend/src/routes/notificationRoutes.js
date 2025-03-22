const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Get all notifications for the current user
router.get('/', notificationController.getUserNotifications);

// Mark a notification as read
router.put('/:notificationId/read', notificationController.markAsRead);

// Mark all notifications as read
router.put('/read-all', notificationController.markAllAsRead);

module.exports = router; 