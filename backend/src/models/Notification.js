const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['book_request', 'request_approved', 'request_rejected', 'request_canceled', 'book_returned'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  relatedBook: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book'
  },
  relatedRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BookRequest'
  },
  link: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema); 