const Book = require('../models/Book');
const User = require('../models/User');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const notificationUtils = require('../utils/notificationUtils');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Get all books
exports.getAllBooks = async (req, res) => {
  try {
    const { genre, location, language, status, search, owner, currentBorrower, limit } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (genre) filter.genre = { $in: genre.split(',') };
    if (location) filter.location = location;
    if (language) filter.language = language;
    if (status) filter.status = status;
    if (owner) filter.owner = owner;
    if (currentBorrower) filter.currentBorrower = currentBorrower;
    
    // Search by title or author
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Set up query
    let query = Book.find(filter)
      .populate('owner', 'firstName lastName profileImage')
      .populate('currentBorrower', 'firstName lastName profileImage')
      .sort({ createdAt: -1 });
      
    // Apply limit if provided
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    const books = await query;
    
    res.status(200).json({
      success: true,
      data: books,
      message: `Found ${books.length} books`
    });
  } catch (error) {
    console.error('Error getting all books:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get book by ID
exports.getBookById = async (req, res) => {
  try {
    const { bookId } = req.params;
    
    const book = await Book.findById(bookId)
      .populate('owner', 'firstName lastName profileImage email')
      .populate('currentBorrower', 'firstName lastName profileImage')
      .populate('borrowHistory.borrower', 'firstName lastName profileImage');
    
    if (!book) {
      return res.status(404).json({ 
        success: false,
        message: 'Book not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: book,
      message: 'Book found'
    });
  } catch (error) {
    console.error('Error getting book by ID:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Create a new book
exports.createBook = async (req, res) => {
  try {
    const { 
      title, author, description, genre, language, condition, 
      location, isExchangeable, isDonation, borrowDuration, clerkId 
    } = req.body;
    
    console.log('Received book creation request with data:', req.body);
    console.log('Files received:', req.files);
    
    // Find the user by Clerk ID
    const owner = await User.findOne({ clerkId });
    
    if (!owner) {
      console.error('User not found with Clerk ID:', clerkId);
      return res.status(404).json({ message: 'User not found with provided Clerk ID' });
    }
    
    // Upload images to Cloudinary if files are provided
    const imageUrls = [];
    
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'book_sharing/books'
        });
        
        imageUrls.push(result.secure_url);
        
        // Remove temp file
        fs.unlinkSync(file.path);
      }
    }
    
    // Create new book
    const newBook = new Book({
      title,
      author,
      description,
      genre: Array.isArray(genre) ? genre : genre.split(','),
      language,
      condition,
      images: imageUrls,
      owner: owner._id, // Use the MongoDB ObjectId from the user document
      location,
      isExchangeable: isExchangeable === 'true',
      isDonation: isDonation === 'true',
      borrowDuration: parseInt(borrowDuration) || 14
    });
    
    const savedBook = await newBook.save();
    console.log('Book saved successfully:', savedBook);
    
    // Add book to owner's shared books
    owner.booksShared.push(newBook._id);
    await owner.save();
    
    // Return a consistent response structure
    res.status(201).json({
      success: true,
      data: savedBook,
      message: 'Book created successfully'
    });
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Update a book
exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { 
      title, author, description, genre, language, condition, 
      location, isExchangeable, isDonation, borrowDuration, status 
    } = req.body;
    
    const book = await Book.findById(bookId);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Update fields if provided
    if (title) book.title = title;
    if (author) book.author = author;
    if (description) book.description = description;
    if (genre) book.genre = genre.split(',');
    if (language) book.language = language;
    if (condition) book.condition = condition;
    if (location) book.location = location;
    if (isExchangeable !== undefined) book.isExchangeable = isExchangeable === 'true';
    if (isDonation !== undefined) book.isDonation = isDonation === 'true';
    if (borrowDuration) book.borrowDuration = parseInt(borrowDuration);
    if (status) book.status = status;
    
    // Upload new images if provided
    if (req.files && req.files.length > 0) {
      const imageUrls = [];
      
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'book_sharing/books'
        });
        
        imageUrls.push(result.secure_url);
        
        // Remove temp file
        fs.unlinkSync(file.path);
      }
      
      book.images = [...book.images, ...imageUrls];
    }
    
    await book.save();
    
    res.status(200).json(book);
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a book
exports.deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    
    const book = await Book.findById(bookId);
    
    if (!book) {
      return res.status(404).json({ 
        success: false,
        message: 'Book not found' 
      });
    }
    
    // Check if the book is currently borrowed
    if (book.status === 'Borrowed') {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot delete a book that is currently borrowed',
        status: book.status
      });
    }
    
    // Check if the book is currently reserved
    if (book.status === 'Reserved') {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot delete a book that is currently reserved',
        status: book.status
      });
    }
    
    // Remove book from owner's shared books
    await User.findByIdAndUpdate(book.owner, {
      $pull: { booksShared: bookId }
    });
    
    // Delete book
    await Book.findByIdAndDelete(bookId);
    
    res.status(200).json({ 
      success: true,
      message: 'Book deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Add a review for a book
exports.addBookReview = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { borrowerId, rating, review } = req.body;
    
    const book = await Book.findById(bookId);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Find the borrow history entry for this borrower
    const borrowHistoryEntry = book.borrowHistory.find(
      entry => entry.borrower.toString() === borrowerId && !entry.rating
    );
    
    if (!borrowHistoryEntry) {
      return res.status(400).json({ message: 'No eligible borrow history found for this user' });
    }
    
    // Update the borrow history entry with rating and review
    borrowHistoryEntry.rating = rating;
    borrowHistoryEntry.review = review;
    
    await book.save();
    
    // Update owner's ratings
    const owner = await User.findById(book.owner);
    
    if (owner) {
      const totalRating = owner.ratings * owner.reviewsCount + parseInt(rating);
      owner.reviewsCount += 1;
      owner.ratings = totalRating / owner.reviewsCount;
      
      await owner.save();
    }
    
    res.status(200).json(book);
  } catch (error) {
    console.error('Error adding book review:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Return a borrowed book
exports.returnBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { borrowerId } = req.body;
    
    // Find the book
    const book = await Book.findById(bookId).populate('owner');
    
    if (!book) {
      return res.status(404).json({ 
        success: false,
        message: 'Book not found' 
      });
    }
    
    // Check if the book is currently borrowed
    if (book.status !== 'Borrowed') {
      return res.status(400).json({ 
        success: false,
        message: `Cannot return a book that is not borrowed (current status: ${book.status})`,
        status: book.status
      });
    }
    
    // Check if the current borrower matches the provided borrowerId
    if (book.currentBorrower && book.currentBorrower.toString() !== borrowerId) {
      return res.status(403).json({ 
        success: false,
        message: 'You are not authorized to return this book',
        currentBorrower: book.currentBorrower.toString()
      });
    }
    
    // Get borrower details for notification
    const borrower = await User.findById(borrowerId);
    if (!borrower) {
      return res.status(404).json({ 
        success: false,
        message: 'Borrower not found' 
      });
    }
    
    // Update book status to 'Available'
    book.status = 'Available';
    
    // Add to borrowHistory if not already present
    const historyEntry = book.borrowHistory.find(
      entry => entry.borrower.toString() === borrowerId && !entry.returnDate
    );
    
    if (historyEntry) {
      historyEntry.returnDate = new Date();
    } else {
      // If no history entry exists, create one
      book.borrowHistory.push({
        borrower: borrowerId,
        borrowDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Assuming borrowed a week ago
        returnDate: new Date()
      });
    }
    
    // Clear currentBorrower
    book.currentBorrower = null;
    
    await book.save();
    
    // Create notification for book owner
    await notificationUtils.createBookReturnedNotification(
      {
        ownerId: book.owner._id,
        borrowerId: borrower._id,
        bookId: book._id,
        bookTitle: book.title,
        borrowerName: `${borrower.firstName} ${borrower.lastName}`
      },
      book.owner.phoneNumber
    );
    
    res.status(200).json({ 
      success: true,
      data: book,
      message: 'Book has been successfully returned'
    });
  } catch (error) {
    console.error('Error returning book:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
}; 