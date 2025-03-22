const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
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
  roomId: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema); 