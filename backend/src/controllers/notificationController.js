const Notification = require('../models/Notification');
const User = require('../models/User');

// Get all notifications for the current user
exports.getUserNotifications = async (req, res) => {
  try {
    // Get user ID from clerk-user-id header
    const clerkUserId = req.headers['x-clerk-user-id'];
    if (!clerkUserId) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required' 
      });
    }
    
    // Get MongoDB user ID from Clerk ID
    const user = await User.findOne({ clerkId: clerkUserId });
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Find all notifications for the user
    const notifications = await Notification.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(20); // Limit to most recent 20 notifications
    
    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Error getting user notifications:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    // Get user ID from clerk-user-id header
    const clerkUserId = req.headers['x-clerk-user-id'];
    if (!clerkUserId) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required' 
      });
    }
    
    // Get MongoDB user ID from Clerk ID
    const user = await User.findOne({ clerkId: clerkUserId });
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Find notification
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ 
        success: false,
        message: 'Notification not found' 
      });
    }
    
    // Check if notification belongs to user
    if (notification.user.toString() !== user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'You are not authorized to mark this notification as read' 
      });
    }
    
    // Update notification
    notification.read = true;
    await notification.save();
    
    res.status(200).json({
      success: true,
      data: notification,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    // Get user ID from clerk-user-id header
    const clerkUserId = req.headers['x-clerk-user-id'];
    if (!clerkUserId) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required' 
      });
    }
    
    // Get MongoDB user ID from Clerk ID
    const user = await User.findOne({ clerkId: clerkUserId });
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Update all unread notifications for the user
    const result = await Notification.updateMany(
      { user: user._id, read: false },
      { $set: { read: true } }
    );
    
    res.status(200).json({
      success: true,
      message: `Marked ${result.modifiedCount} notifications as read`
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
}; 