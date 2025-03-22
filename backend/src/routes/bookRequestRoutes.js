const express = require('express');
const router = express.Router();
const bookRequestController = require('../controllers/bookRequestController');

// Create a new book request
router.post('/', bookRequestController.createBookRequest);

// Get all book requests for a user
router.get('/user/:userId', bookRequestController.getUserBookRequests);

// Get all book requests for the current user's books (as owner)
router.get('/owner', bookRequestController.getOwnerBookRequests);

// Get all book requests made by the current user (as requester)
router.get('/requester', bookRequestController.getRequesterBookRequests);

// Get book request by ID
router.get('/:requestId', bookRequestController.getBookRequestById);

// Update book request status
router.put('/:requestId/status', bookRequestController.updateBookRequestStatus);

// Approve a book request
router.put('/:requestId/approve', bookRequestController.approveBookRequest);

// Reject a book request
router.put('/:requestId/reject', bookRequestController.rejectBookRequest);

// Cancel a book request
router.put('/:requestId/cancel', bookRequestController.cancelBookRequest);

module.exports = router; 