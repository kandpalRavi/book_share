const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  profileImage: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  interests: {
    type: [String],
    default: []
  },
  booksShared: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book'
  }],
  booksBorrowed: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book'
  }],
  ratings: {
    type: Number,
    default: 0
  },
  reviewsCount: {
    type: Number,
    default: 0
  },
  phoneNumber: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema); 