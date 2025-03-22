const BookRequest = require('../models/BookRequest');
const Book = require('../models/Book');
const User = require('../models/User');
const Notification = require('../models/Notification');
const notificationUtils = require('../utils/notificationUtils');
const twilio = require('twilio');

// Initialize Twilio client if credentials exist
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// Create a new book request
exports.createBookRequest = async (req, res) => {
  try {
    const { 
      bookId, 
      requestMessage, 
      requestDuration,
      requestType 
    } = req.body;
    
    // Check for required requestType
    if (!requestType) {
      return res.status(400).json({ 
        success: false,
        message: 'Request type is required' 
      });
    }
    
    // Get requester ID from authentication
    const clerkUserId = req.headers['x-clerk-user-id'];
    if (!clerkUserId) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required' 
      });
    }
    
    // Get MongoDB user ID from Clerk ID
    const requester = await User.findOne({ clerkId: clerkUserId });
    if (!requester) {
      return res.status(404).json({ 
        success: false,
        message: 'Requester not found' 
      });
    }
    
    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ 
        success: false,
        message: 'Book not found' 
      });
    }
    
    // Check if book is available
    if (book.status !== 'Available') {
      return res.status(400).json({ 
        success: false,
        message: 'Book is not available for request' 
      });
    }
    
    // Check if requester is trying to borrow their own book
    if (book.owner.toString() === requester._id.toString()) {
      return res.status(400).json({ 
        success: false,
        message: 'You cannot request your own book' 
      });
    }
    
    // Create new book request
    const newBookRequest = new BookRequest({
      book: bookId,
      requester: requester._id,
      owner: book.owner,
      requestMessage,
      requestDuration: parseInt(requestDuration) || 14,
      requestType
    });
    
    await newBookRequest.save();
    
    // Update book status to Reserved
    book.status = 'Reserved';
    await book.save();
    
    // Create notification for book owner
    await notificationUtils.createBookRequestNotification({
      ownerId: book.owner,
      requesterId: requester._id,
      bookId: book._id,
      requestId: newBookRequest._id,
      bookTitle: book.title,
      requesterName: `${requester.firstName} ${requester.lastName}`
    });
    
    res.status(201).json({
      success: true,
      data: newBookRequest,
      message: 'Book request submitted successfully'
    });
  } catch (error) {
    console.error('Error creating book request:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get all book requests for a user (as owner or requester)
exports.getUserBookRequests = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type } = req.query; // 'owner' or 'requester'
    
    let filter = {};
    
    if (type === 'owner') {
      filter.owner = userId;
    } else if (type === 'requester') {
      filter.requester = userId;
    } else {
      filter.$or = [{ owner: userId }, { requester: userId }];
    }
    
    const bookRequests = await BookRequest.find(filter)
      .populate('book')
      .populate('requester', 'firstName lastName profileImage email')
      .populate('owner', 'firstName lastName profileImage email')
      .populate('exchangeBook')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: bookRequests
    });
  } catch (error) {
    console.error('Error getting user book requests:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get all book requests for the current user's books (as owner)
exports.getOwnerBookRequests = async (req, res) => {
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
    
    // Find all requests for books owned by the user
    const bookRequests = await BookRequest.find({ owner: user._id })
      .populate({
        path: 'book',
        select: 'title author images status'
      })
      .populate({
        path: 'requester',
        select: 'firstName lastName profileImage email'
      })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: bookRequests
    });
  } catch (error) {
    console.error('Error getting owner book requests:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get all book requests made by the current user (as requester)
exports.getRequesterBookRequests = async (req, res) => {
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
    
    // Find all requests made by the user
    const bookRequests = await BookRequest.find({ requester: user._id })
      .populate({
        path: 'book',
        select: 'title author images status'
      })
      .populate({
        path: 'owner',
        select: 'firstName lastName profileImage email'
      })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: bookRequests
    });
  } catch (error) {
    console.error('Error getting requester book requests:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Update book request status
exports.updateBookRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;
    
    const bookRequest = await BookRequest.findById(requestId)
      .populate('book')
      .populate('requester')
      .populate('owner');
    
    if (!bookRequest) {
      return res.status(404).json({ 
        success: false,
        message: 'Book request not found' 
      });
    }
    
    // Update request status
    bookRequest.status = status;
    await bookRequest.save();
    
    // Update book status based on request status
    const book = await Book.findById(bookRequest.book);
    
    if (status === 'Accepted' || status === 'Approved') {
      book.status = 'Borrowed';
      book.currentBorrower = bookRequest.requester;
      
      // Add borrow history entry
      book.borrowHistory.push({
        borrower: bookRequest.requester,
        borrowDate: new Date()
      });
      
      // Add book to borrower's borrowed books
      await User.findByIdAndUpdate(bookRequest.requester, {
        $push: { booksBorrowed: book._id }
      });
      
      // Create notification for requester
      await notificationUtils.createRequestApprovedNotification(
        {
          ownerId: bookRequest.owner._id,
          requesterId: bookRequest.requester._id,
          bookId: book._id,
          requestId: bookRequest._id,
          bookTitle: book.title,
          ownerName: `${bookRequest.owner.firstName} ${bookRequest.owner.lastName}`
        },
        bookRequest.requester.phoneNumber
      );
    } else if (status === 'Rejected') {
      book.status = 'Available';
      book.currentBorrower = null;
      
      // Create notification for requester
      await notificationUtils.createRequestRejectedNotification(
        {
          ownerId: bookRequest.owner._id,
          requesterId: bookRequest.requester._id,
          bookId: book._id,
          requestId: bookRequest._id,
          bookTitle: book.title,
          ownerName: `${bookRequest.owner.firstName} ${bookRequest.owner.lastName}`
        },
        bookRequest.requester.phoneNumber
      );
    } else if (status === 'Cancelled') {
      book.status = 'Available';
      book.currentBorrower = null;
      
      // Create notification for owner
      await notificationUtils.createRequestCanceledNotification(
        {
          ownerId: bookRequest.owner._id,
          requesterId: bookRequest.requester._id,
          bookId: book._id,
          requestId: bookRequest._id,
          bookTitle: book.title,
          requesterName: `${bookRequest.requester.firstName} ${bookRequest.requester.lastName}`
        },
        bookRequest.owner.phoneNumber
      );
    } else if (status === 'Completed') {
      book.status = 'Available';
      book.currentBorrower = null;
      
      // Update return date in borrow history
      const lastBorrowHistoryEntry = book.borrowHistory[book.borrowHistory.length - 1];
      if (lastBorrowHistoryEntry) {
        lastBorrowHistoryEntry.returnDate = new Date();
      }
      
      // Remove book from borrower's borrowed books
      await User.findByIdAndUpdate(bookRequest.requester, {
        $pull: { booksBorrowed: book._id }
      });
      
      // Create notification for owner
      await notificationUtils.createBookReturnedNotification(
        {
          ownerId: bookRequest.owner._id,
          borrowerId: bookRequest.requester._id,
          bookId: book._id,
          bookTitle: book.title,
          borrowerName: `${bookRequest.requester.firstName} ${bookRequest.requester.lastName}`
        },
        bookRequest.owner.phoneNumber
      );
    }
    
    await book.save();
    
    res.status(200).json({
      success: true,
      data: bookRequest
    });
  } catch (error) {
    console.error('Error updating book request status:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Approve a book request
exports.approveBookRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    // Get book request
    const bookRequest = await BookRequest.findById(requestId)
      .populate('book')
      .populate('requester')
      .populate('owner');
    
    if (!bookRequest) {
      return res.status(404).json({ 
        success: false,
        message: 'Book request not found' 
      });
    }
    
    // Check if request is already processed
    if (bookRequest.status !== 'Pending') {
      return res.status(400).json({ 
        success: false,
        message: `This request has already been ${bookRequest.status.toLowerCase()}` 
      });
    }
    
    // Check if current user is the book owner
    const clerkUserId = req.headers['x-clerk-user-id'];
    const currentUser = await User.findOne({ clerkId: clerkUserId });
    
    if (!currentUser || bookRequest.owner._id.toString() !== currentUser._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'You are not authorized to approve this request' 
      });
    }
    
    // Get the book
    const book = await Book.findById(bookRequest.book._id);
    if (!book) {
      return res.status(404).json({ 
        success: false,
        message: 'Book not found' 
      });
    }
    
    // Update request status
    bookRequest.status = 'Accepted';
    bookRequest.responseDate = new Date();
    await bookRequest.save();
    
    // Update book status
    book.status = 'Borrowed';
    book.currentBorrower = bookRequest.requester._id;
    
    // Add borrow history entry
    book.borrowHistory = book.borrowHistory || [];
    book.borrowHistory.push({
      borrower: bookRequest.requester._id,
      borrowDate: new Date()
    });
    
    await book.save();
    
    // Create notification for requester
    await notificationUtils.createRequestApprovedNotification({
      ownerId: bookRequest.owner._id,
      requesterId: bookRequest.requester._id,
      bookId: book._id,
      requestId: bookRequest._id,
      bookTitle: book.title,
      ownerName: `${bookRequest.owner.firstName} ${bookRequest.owner.lastName}`
    });
    
    res.status(200).json({
      success: true,
      data: bookRequest,
      message: 'Book request accepted successfully'
    });
  } catch (error) {
    console.error('Error accepting book request:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Reject a book request
exports.rejectBookRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    // Get book request
    const bookRequest = await BookRequest.findById(requestId)
      .populate('book')
      .populate('requester')
      .populate('owner');
    
    if (!bookRequest) {
      return res.status(404).json({ 
        success: false,
        message: 'Book request not found' 
      });
    }
    
    // Check if request is already processed
    if (bookRequest.status !== 'Pending') {
      return res.status(400).json({ 
        success: false,
        message: `This request has already been ${bookRequest.status.toLowerCase()}` 
      });
    }
    
    // Check if current user is the book owner
    const clerkUserId = req.headers['x-clerk-user-id'];
    const currentUser = await User.findOne({ clerkId: clerkUserId });
    
    if (!currentUser || bookRequest.owner._id.toString() !== currentUser._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'You are not authorized to reject this request' 
      });
    }
    
    // Get the book
    const book = await Book.findById(bookRequest.book._id);
    if (!book) {
      return res.status(404).json({ 
        success: false,
        message: 'Book not found' 
      });
    }
    
    // Update request status
    bookRequest.status = 'Rejected';
    bookRequest.responseDate = new Date();
    await bookRequest.save();
    
    // Update book status back to Available if no other pending requests
    const pendingRequests = await BookRequest.find({
      book: book._id,
      status: 'Pending'
    });
    
    if (pendingRequests.length === 0) {
      book.status = 'Available';
      await book.save();
    }
    
    // Create notification for requester
    await notificationUtils.createRequestRejectedNotification({
      ownerId: bookRequest.owner._id,
      requesterId: bookRequest.requester._id,
      bookId: book._id,
      requestId: bookRequest._id,
      bookTitle: book.title,
      ownerName: `${bookRequest.owner.firstName} ${bookRequest.owner.lastName}`
    });
    
    res.status(200).json({
      success: true,
      data: bookRequest,
      message: 'Book request rejected successfully'
    });
  } catch (error) {
    console.error('Error rejecting book request:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Cancel a book request
exports.cancelBookRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    // Get book request
    const bookRequest = await BookRequest.findById(requestId)
      .populate('book')
      .populate('requester')
      .populate('owner');
    
    if (!bookRequest) {
      return res.status(404).json({ 
        success: false,
        message: 'Book request not found' 
      });
    }
    
    // Check if request is already processed
    if (bookRequest.status !== 'Pending') {
      return res.status(400).json({ 
        success: false,
        message: `This request cannot be canceled because it has already been ${bookRequest.status.toLowerCase()}` 
      });
    }
    
    // Check if current user is the requester
    const clerkUserId = req.headers['x-clerk-user-id'];
    const currentUser = await User.findOne({ clerkId: clerkUserId });
    
    if (!currentUser || bookRequest.requester._id.toString() !== currentUser._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'You are not authorized to cancel this request' 
      });
    }
    
    // Get the book
    const book = await Book.findById(bookRequest.book._id);
    if (!book) {
      return res.status(404).json({ 
        success: false,
        message: 'Book not found' 
      });
    }
    
    // Update request status
    bookRequest.status = 'Canceled';
    bookRequest.responseDate = new Date();
    await bookRequest.save();
    
    // Update book status back to Available if no other pending requests
    const pendingRequests = await BookRequest.find({
      book: book._id,
      status: 'Pending'
    });
    
    if (pendingRequests.length === 0) {
      book.status = 'Available';
      await book.save();
    }
    
    // Create notification for owner
    await notificationUtils.createRequestCanceledNotification({
      ownerId: bookRequest.owner._id,
      requesterId: bookRequest.requester._id,
      bookId: book._id,
      requestId: bookRequest._id,
      bookTitle: book.title,
      requesterName: `${bookRequest.requester.firstName} ${bookRequest.requester.lastName}`
    });
    
    res.status(200).json({
      success: true,
      data: bookRequest,
      message: 'Book request canceled successfully'
    });
  } catch (error) {
    console.error('Error canceling book request:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get book request by ID
exports.getBookRequestById = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const bookRequest = await BookRequest.findById(requestId)
      .populate('book')
      .populate('requester', 'firstName lastName profileImage email phoneNumber')
      .populate('owner', 'firstName lastName profileImage email phoneNumber')
      .populate('exchangeBook');
    
    if (!bookRequest) {
      return res.status(404).json({ 
        success: false,
        message: 'Book request not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: bookRequest
    });
  } catch (error) {
    console.error('Error getting book request by ID:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
}; 