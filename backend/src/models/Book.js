const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  genre: {
    type: [String],
    required: true
  },
  language: {
    type: String,
    required: true
  },
  condition: {
    type: String,
    enum: ['New', 'Like New', 'Good', 'Fair', 'Poor'],
    required: true
  },
  images: {
    type: [String],
    default: []
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  currentBorrower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['Available', 'Borrowed', 'Reserved'],
    default: 'Available'
  },
  location: {
    type: String,
    required: true
  },
  isExchangeable: {
    type: Boolean,
    default: false
  },
  isDonation: {
    type: Boolean,
    default: false
  },
  borrowDuration: {
    type: Number, // in days
    default: 14
  },
  borrowHistory: [{
    borrower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    borrowDate: {
      type: Date
    },
    returnDate: {
      type: Date
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: {
      type: String
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema); 