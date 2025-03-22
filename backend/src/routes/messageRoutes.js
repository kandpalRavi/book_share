const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// Create a new message
router.post('/', messageController.createMessage);

// Get messages for a room
router.get('/room/:roomId', messageController.getRoomMessages);

// Mark messages as read
router.put('/room/:roomId/user/:userId/read', messageController.markMessagesAsRead);

// Get user's chat rooms
router.get('/user/:userId/rooms', messageController.getUserChatRooms);

module.exports = router; 