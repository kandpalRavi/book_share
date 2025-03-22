const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const bookRequestController = require('../controllers/bookRequestController');

// Get current user profile (authenticated)
router.get('/profile', userController.getCurrentUserProfile);

// Get user profile
router.get('/:userId', userController.getUserProfile);

// Update user profile
router.put('/:userId', userController.updateUserProfile);

// Get user's shared books
router.get('/:userId/books/shared', userController.getUserSharedBooks);

// Get user's borrowed books
router.get('/:userId/books/borrowed', userController.getUserBorrowedBooks);

// Create or update user from Clerk webhook
router.post('/clerk-webhook', userController.createOrUpdateUser);

// Get user by Clerk ID
router.get('/clerk/:clerkId', userController.getUserByClerkId);

// Get requests made by the current user
router.get('/requests', bookRequestController.getRequesterBookRequests);

// Cancel a book request
router.put('/requests/:requestId/cancel', bookRequestController.cancelBookRequest);

module.exports = router; 