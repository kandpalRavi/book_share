const Notification = require('../models/Notification');
const twilio = require('twilio');

// Initialize Twilio client if credentials exist
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

/**
 * Creates a notification for a user and optionally sends an SMS
 * 
 * @param {Object} notificationData - The notification data
 * @param {String} notificationData.userId - The user ID to notify
 * @param {String} notificationData.type - Notification type
 * @param {String} notificationData.message - Notification message
 * @param {String} notificationData.bookId - Related book ID (optional)
 * @param {String} notificationData.requestId - Related request ID (optional)
 * @param {String} notificationData.link - Frontend link for the notification (optional)
 * @param {Boolean} sendSMS - Whether to send SMS notification (defaults to false)
 * @param {String} phoneNumber - User's phone number for SMS (required if sendSMS is true)
 * @returns {Promise<Object>} - The created notification
 */
const createNotification = async (notificationData, sendSMS = false, phoneNumber = null) => {
  try {
    // Create notification in database
    const notification = new Notification({
      user: notificationData.userId,
      type: notificationData.type,
      message: notificationData.message,
      relatedBook: notificationData.bookId || null,
      relatedRequest: notificationData.requestId || null,
      link: notificationData.link || null
    });
    
    await notification.save();
    
    // Send SMS if requested and phone number is available
    if (sendSMS && phoneNumber && twilioClient) {
      try {
        await twilioClient.messages.create({
          body: notificationData.message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phoneNumber
        });
      } catch (error) {
        console.error('Error sending SMS notification:', error);
      }
    }
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Creates a notification for a book owner when someone requests their book
 * 
 * @param {Object} data - Book request data
 * @returns {Promise<Object>} - The created notification
 */
const createBookRequestNotification = async (data) => {
  const message = `${data.requesterName} requested to borrow your book "${data.bookTitle}"`;
  
  return createNotification({
    userId: data.ownerId,
    type: 'book_request',
    message,
    bookId: data.bookId,
    requestId: data.requestId,
    link: '/my-books/requests'
  });
};

/**
 * Creates a notification for a requester when their book request is approved
 * 
 * @param {Object} data - Book request data
 * @returns {Promise<Object>} - The created notification
 */
const createRequestApprovedNotification = async (data) => {
  const message = `${data.ownerName} approved your request to borrow "${data.bookTitle}"`;
  
  return createNotification({
    userId: data.requesterId,
    type: 'request_approved',
    message,
    bookId: data.bookId,
    requestId: data.requestId,
    link: '/my-requests'
  });
};

/**
 * Creates a notification for a requester when their book request is rejected
 * 
 * @param {Object} data - Book request data
 * @returns {Promise<Object>} - The created notification
 */
const createRequestRejectedNotification = async (data) => {
  const message = `${data.ownerName} declined your request to borrow "${data.bookTitle}"`;
  
  return createNotification({
    userId: data.requesterId,
    type: 'request_rejected',
    message,
    bookId: data.bookId,
    requestId: data.requestId,
    link: '/my-requests'
  });
};

/**
 * Creates a notification for a book owner when a request is canceled
 * 
 * @param {Object} data - Book request data
 * @returns {Promise<Object>} - The created notification
 */
const createRequestCanceledNotification = async (data) => {
  const message = `${data.requesterName} canceled their request to borrow "${data.bookTitle}"`;
  
  return createNotification({
    userId: data.ownerId,
    type: 'request_canceled',
    message,
    bookId: data.bookId,
    requestId: data.requestId,
    link: '/my-books/requests'
  });
};

/**
 * Creates a notification for a book owner when their book is returned
 * 
 * @param {Object} data - Book return data
 * @returns {Promise<Object>} - The created notification
 */
const createBookReturnedNotification = async (data) => {
  const message = `${data.borrowerName} returned your book "${data.bookTitle}"`;
  
  return createNotification({
    userId: data.ownerId,
    type: 'book_returned',
    message,
    bookId: data.bookId,
    link: '/my-books'
  });
};

/**
 * Get user notifications
 * 
 * @param {String} userId - User ID
 * @param {Number} limit - Max number of notifications to return
 * @param {Boolean} unreadOnly - Whether to get only unread notifications
 * @returns {Promise<Array>} - Array of notifications
 */
const getUserNotifications = async (userId, limit = 10, unreadOnly = false) => {
  try {
    const query = { user: userId };
    
    if (unreadOnly) {
      query.read = false;
    }
    
    return await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('relatedBook', 'title images')
      .populate('relatedRequest')
      .exec();
  } catch (error) {
    console.error('Error getting user notifications:', error);
    throw error;
  }
};

/**
 * Mark notification as read
 * 
 * @param {String} notificationId - Notification ID
 * @returns {Promise<Object>} - The updated notification
 */
const markNotificationAsRead = async (notificationId) => {
  try {
    return await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all user notifications as read
 * 
 * @param {String} userId - User ID
 * @returns {Promise<Object>} - Result of the update operation
 */
const markAllNotificationsAsRead = async (userId) => {
  try {
    return await Notification.updateMany(
      { user: userId, read: false },
      { read: true }
    );
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

module.exports = {
  createNotification,
  createBookRequestNotification,
  createRequestApprovedNotification,
  createRequestRejectedNotification,
  createRequestCanceledNotification,
  createBookReturnedNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
}; 