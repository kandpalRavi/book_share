const Message = require('../models/Message');
const User = require('../models/User');

// Create a new message
exports.createMessage = async (req, res) => {
  try {
    const { senderId, receiverId, content, relatedBookId, roomId } = req.body;
    
    // Check if sender exists
    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({ message: 'Sender not found' });
    }
    
    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }
    
    // Create new message
    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      content,
      relatedBook: relatedBookId || null,
      roomId
    });
    
    await newMessage.save();
    
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get messages for a room
exports.getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const messages = await Message.find({ roomId })
      .populate('sender', 'firstName lastName profileImage')
      .populate('receiver', 'firstName lastName profileImage')
      .populate('relatedBook', 'title author images')
      .sort({ createdAt: 1 });
    
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error getting room messages:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark messages as read
exports.markMessagesAsRead = async (req, res) => {
  try {
    const { roomId, userId } = req.params;
    
    await Message.updateMany(
      { roomId, receiver: userId, read: false },
      { read: true }
    );
    
    res.status(200).json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's chat rooms
exports.getUserChatRooms = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find all messages where user is sender or receiver
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'firstName lastName profileImage')
      .populate('receiver', 'firstName lastName profileImage')
      .populate('relatedBook', 'title author images');
    
    // Extract unique room IDs and get the latest message for each room
    const roomMap = new Map();
    
    messages.forEach(message => {
      if (!roomMap.has(message.roomId)) {
        roomMap.set(message.roomId, {
          roomId: message.roomId,
          latestMessage: message,
          otherUser: message.sender._id.toString() === userId 
            ? message.receiver 
            : message.sender,
          relatedBook: message.relatedBook,
          unreadCount: message.receiver._id.toString() === userId && !message.read ? 1 : 0
        });
      } else if (!message.read && message.receiver._id.toString() === userId) {
        // Increment unread count for existing room
        const room = roomMap.get(message.roomId);
        room.unreadCount += 1;
      }
    });
    
    // Convert map to array and sort by latest message
    const rooms = Array.from(roomMap.values())
      .sort((a, b) => b.latestMessage.createdAt - a.latestMessage.createdAt);
    
    res.status(200).json(rooms);
  } catch (error) {
    console.error('Error getting user chat rooms:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 