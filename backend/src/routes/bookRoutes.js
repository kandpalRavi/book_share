const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const bookRequestController = require('../controllers/bookRequestController');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Get all books
router.get('/', bookController.getAllBooks);

// -------------------- Book Request Routes --------------------
// IMPORTANT: These routes must come BEFORE the '/:bookId' routes
// to prevent Express from treating 'requests' as a bookId

// Get all requests for books owned by the current user
router.get('/requests', bookRequestController.getOwnerBookRequests);

// Respond to a book request (approve)
router.put('/requests/:requestId/approve', bookRequestController.approveBookRequest);

// Respond to a book request (reject)
router.put('/requests/:requestId/reject', bookRequestController.rejectBookRequest);

// Cancel a book request
router.put('/requests/:requestId/cancel', bookRequestController.cancelBookRequest);

// -------------------- Individual Book Routes --------------------
// Get book by ID
router.get('/:bookId', bookController.getBookById);

// Create a new book
router.post('/', upload.array('images', 5), bookController.createBook);

// Update a book
router.put('/:bookId', upload.array('images', 5), bookController.updateBook);

// Delete a book
router.delete('/:bookId', bookController.deleteBook);

// Add a review for a book
router.post('/:bookId/reviews', bookController.addBookReview);

// Return a borrowed book
router.post('/:bookId/return', bookController.returnBook);

// Request to borrow a book
router.post('/:bookId/request', bookRequestController.createBookRequest);

module.exports = router; 