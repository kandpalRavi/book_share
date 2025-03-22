const mongoose = require('mongoose');

const bookRequestSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Approved', 'Rejected', 'Completed', 'Cancelled', 'Canceled'],
    default: 'Pending'
  },
  requestType: {
    type: String,
    enum: ['Borrow', 'Exchange', 'Donation'],
    required: true
  },
  requestMessage: {
    type: String,
    default: ''
  },
  requestDuration: {
    type: Number, // in days
    default: 14
  },
  exchangeBook: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book'
  }
}, { timestamps: true });

module.exports = mongoose.model('BookRequest', bookRequestSchema); 