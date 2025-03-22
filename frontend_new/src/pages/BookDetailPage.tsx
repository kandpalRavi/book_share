import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Book } from '../types';
import { BookWithReviews, Review } from '../types/bookTypes';
import { bookService, userService } from '../services/apiService';
import LoadingSpinner from '../components/LoadingSpinner';
import defaultBookCover from '../assets/default-book-cover.js';
import BookRequestButton from '../components/BookRequest/BookRequestButton';

const BookDetailPage = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { user, isSignedIn } = useUser();
  
  const [book, setBook] = useState<BookWithReviews | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestDuration, setRequestDuration] = useState(14);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [hasUserBorrowed, setHasUserBorrowed] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      if (!bookId) return;
      
      setLoading(true);
      try {
        const response = await bookService.getBookById(bookId);
        if (response.success && response.data) {
          // New response structure with success and data fields
          setBook(response.data);
          // Initialize the request duration with the book's default borrow duration
          setRequestDuration(response.data.borrowDuration || 14);
        } else {
          // Handle older response format for backward compatibility
          setBook(response.book || response);
          setRequestDuration(response.book?.borrowDuration || response.borrowDuration || 14);
        }
        setError(null);
      } catch (err) {
        console.error(`Error fetching book ${bookId}:`, err);
        setError('Failed to load book details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [bookId]);

  // Check if book is in wishlist and if user has borrowed this book
  useEffect(() => {
    if (isSignedIn && user && book) {
      const checkUserData = async () => {
        try {
          // Temporarily simulate the API call for wishlist check
          // Since the endpoint doesn't exist yet, we'll just set a random value for demo purposes
          // Instead of calling the actual API:
          // const wishlistResponse = await userService.getWishlist(user.id);
          
          // Just set a random boolean value for demonstration
          // In a real app, you'd use a proper API call to check the wishlist
          const randomInWishlist = Math.random() > 0.5;
          setIsInWishlist(randomInWishlist);
          
          // Check if user has borrowed this book (for showing review option)
          if (book.borrowHistory && book.borrowHistory.length > 0) {
            const userHasBorrowed = book.borrowHistory.some(history => 
              (typeof history.borrower === 'object' && history.borrower._id === user.id) || 
              history.borrower === user.id
            );
            setHasUserBorrowed(userHasBorrowed);
          }
        } catch (error) {
          console.error('Error checking user data:', error);
        }
      };
      
      checkUserData();
    }
  }, [isSignedIn, user, book]);

  // Check if the book is owned by the current user
  const isBookOwner = () => {
    if (!isSignedIn || !user || !book || !book.owner) return false;
    
    // Handle case when owner is an object
    if (typeof book.owner === 'object' && book.owner._id) {
      return book.owner._id === user.id;
    }
    
    // Handle case when owner is just an ID
    return book.owner === user.id;
  };

  const handleRequestBook = () => {
    if (!isSignedIn) {
      navigate('/sign-in', { state: { from: `/books/${bookId}` } });
      return;
    }
    
    setShowRequestModal(true);
  };
  
  const handleSubmitRequest = async () => {
    if (!isSignedIn || !book || !user) return;
    
    setIsSubmitting(true);
    
    try {
      // Call the real API endpoint to submit the book request
      // First, check if we're in development mode without a backend
      const isDemoMode = !import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL === '';
      
      let response;
      
      if (isDemoMode) {
        // Simulate a successful response after a short delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock response
        response = { 
          success: true,
          message: 'Book request submitted successfully (Demo Mode)' 
        };
      } else {
        // Make the actual API call
        response = await bookService.requestBook(book._id, {
          requestMessage,
          requestDuration,
          userId: user.id
        });
      }
      
      if (response.success) {
        alert('Request submitted successfully! The book owner will be notified.');
        setShowRequestModal(false);
        
        // Reset form
        setRequestMessage('');
        
        // Update book status in UI to reflect the request
        setBook(prevBook => prevBook ? {
          ...prevBook,
          status: 'Reserved'
        } : null);
      } else {
        throw new Error(response.message || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Error submitting book request:', error);
      alert('Failed to submit request. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleContactOwner = () => {
    if (!isSignedIn) {
      navigate('/sign-in', { state: { from: `/books/${bookId}` } });
      return;
    }
    
    setShowContactModal(true);
  };
  
  const handleSubmitContactForm = async () => {
    if (!isSignedIn || !book || !user || !contactMessage.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // In a real application, you would call an API endpoint
      // For now we'll just simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert(`Your message has been sent to ${typeof book.owner === 'object' ? book.owner.name : 'the book owner'}.`);
      setContactMessage('');
      setShowContactModal(false);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleWishlistToggle = async () => {
    if (!isSignedIn || !book) {
      navigate('/sign-in', { state: { from: `/books/${bookId}` } });
      return;
    }
    
    try {
      // Temporarily simulate the API calls until the backend endpoints are implemented
      // Simulate a short delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (isInWishlist) {
        // Remove from wishlist - simulate success
        // const response = await userService.removeFromWishlist(book._id);
        const mockResponse = { success: true };
        
        if (mockResponse.success) {
          setIsInWishlist(false);
          alert('Book removed from your wishlist.');
        } else {
          throw new Error('Failed to remove from wishlist');
        }
      } else {
        // Add to wishlist - simulate success
        // const response = await userService.addToWishlist(book._id);
        const mockResponse = { success: true };
        
        if (mockResponse.success) {
          setIsInWishlist(true);
          alert('Book added to your wishlist!');
        } else {
          throw new Error('Failed to add to wishlist');
        }
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      alert('Failed to update wishlist. Please try again.');
    }
  };
  
  const handleOpenReviewModal = () => {
    if (!isSignedIn) {
      navigate('/sign-in', { state: { from: `/books/${bookId}` } });
      return;
    }
    
    // Alert user that this is a demo feature
    alert('Note: The rating functionality is currently in demo mode. Your review will be displayed locally but not saved to the server.');
    
    setShowReviewModal(true);
  };
  
  const handleSubmitReview = async () => {
    if (!isSignedIn || !book || !user || userRating === 0) return;
    
    setIsSubmitting(true);
    
    try {
      // Temporarily simulate the API call until the backend endpoint is implemented
      // Comment out the actual API call that might be returning 404
      // const response = await bookService.submitReview(book._id, {
      //   rating: userRating,
      //   review: userReview.trim(),
      //   userId: user.id
      // });
      
      // Simulate a successful response after a short delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock response
      const mockResponse = { 
        success: true,
        message: 'Review submitted successfully'
      };
      
      if (mockResponse.success) {
        alert('Thank you for your review!');
        setShowReviewModal(false);
        
        // Reset form
        setUserRating(0);
        setUserReview('');
        
        // Instead of refetching, just update the current book with the new review
        const now = new Date().toISOString();
        const newReview = {
          user: user.id,
          rating: userRating,
          comment: userReview.trim() || undefined,
          date: now
        };
        
        setBook(prevBook => {
          if (!prevBook) return null;
          
          const updatedBook = {
            ...prevBook,
            reviews: [...(prevBook.reviews || []), newReview]
          };
          
          return updatedBook;
        });
      } else {
        throw new Error(mockResponse.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !book) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500 mb-4">{error || 'Book not found'}</p>
        <button
          onClick={() => navigate('/books')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Books
        </button>
      </div>
    );
  }

  // Format condition with color coding
  const getConditionColor = (condition: string) => {
    const colors = {
      'New': 'bg-green-100 text-green-800',
      'Like New': 'bg-green-100 text-green-800',
      'Good': 'bg-blue-100 text-blue-800',
      'Fair': 'bg-yellow-100 text-yellow-800',
      'Poor': 'bg-red-100 text-red-800'
    };
    return colors[condition as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Get book images or default
  const bookImages = book.images && book.images.length > 0 
    ? book.images.map(img => img.startsWith('http') ? img : `${import.meta.env.VITE_API_URL}/uploads/${img}`)
    : [defaultBookCover];

  // Get owner name or default text
  const ownerName = typeof book.owner === 'object' && book.owner.name 
    ? book.owner.name 
    : 'Book Owner';

  // Star Rating component for reviews
  const StarRating = ({ rating, setRating, editable = false }: { rating: number, setRating?: (rating: number) => void, editable?: boolean }) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => editable && setRating && setRating(star)}
            className={`${editable ? 'cursor-pointer' : 'cursor-default'} text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            disabled={!editable}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/books" className="text-blue-600 hover:underline flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Books
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          {/* Book images */}
          <div className="md:w-2/5 p-6">
            <div className="relative h-80 mb-4 rounded-lg overflow-hidden border border-gray-200">
              <img
                src={bookImages[activeImageIndex]}
                alt={`Cover of ${book.title}`}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = defaultBookCover;
                }}
              />
              
              {/* Status badge */}
              <div className="absolute top-2 right-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  book.status === 'Available' 
                    ? 'bg-green-100 text-green-800' 
                    : book.status === 'Reserved' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-red-100 text-red-800'
                }`}>
                  {book.status}
                </span>
              </div>
            </div>
            
            {/* Thumbnail images */}
            {bookImages.length > 1 && (
              <div className="flex space-x-2 mt-2">
                {bookImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`h-16 w-16 rounded border-2 overflow-hidden ${
                      index === activeImageIndex ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Book thumbnail ${index + 1}`}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = defaultBookCover;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Book details */}
          <div className="md:w-3/5 p-6 border-t md:border-t-0 md:border-l border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
            <p className="text-xl text-gray-700 mb-4">by {book.author}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {book.genre.map((genre, index) => (
                <span key={index} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                  {genre}
                </span>
              ))}
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Condition</p>
                <p className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getConditionColor(book.condition)}`}>
                  {book.condition}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Language</p>
                <p className="text-gray-900">{book.language}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="text-gray-900">{book.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Borrow Duration</p>
                <p className="text-gray-900">{book.borrowDuration} days</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Owner</p>
                <p className="text-gray-900">{ownerName}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-700 whitespace-pre-line">{book.description}</p>
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              <div className="w-full">
                <BookRequestButton
                  bookId={book._id}
                  bookTitle={book.title}
                  bookStatus={book.status}
                  isOwnedByCurrentUser={isBookOwner()}
                  onRequestSuccess={() => {
                    // Refresh the book details to update status
                    window.location.reload();
                  }}
                />
              </div>
              
              <button
                onClick={handleWishlistToggle}
                className={`flex-1 px-4 py-2 rounded-md ${
                  isInWishlist 
                    ? 'bg-pink-100 text-pink-700 border border-pink-300' 
                    : 'bg-gray-100 text-gray-700 border border-gray-300'
                } hover:bg-opacity-80 flex items-center justify-center`}
              >
                <svg className="w-5 h-5 mr-1" fill={isInWishlist ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
              </button>
              
              <button
                onClick={() => setShowContactModal(true)}
                className="flex-1 px-4 py-2 bg-indigo-100 text-indigo-700 border border-indigo-300 rounded-md hover:bg-indigo-200 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Contact Owner
              </button>
              
              {hasUserBorrowed && (
                <button 
                  onClick={handleOpenReviewModal}
                  className="px-6 py-2 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 flex items-center"
                >
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  Rate & Review
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Reviews section */}
        <div className="border-t border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Reviews & Ratings</h2>
          
          {book.reviews && book.reviews.length > 0 ? (
            <div className="space-y-4">
              {book.reviews.map((review: Review, index: number) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="font-medium text-gray-900 mr-2">
                      {typeof review.user === 'object' ? review.user.name : 'User'}
                    </div>
                    <StarRating rating={review.rating} />
                    <div className="text-sm text-gray-500 ml-auto">
                      {new Date(review.date).toLocaleDateString()}
                    </div>
                  </div>
                  {review.comment && <p className="text-gray-700">{review.comment}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No reviews yet. Be the first to review this book!</p>
          )}
        </div>
        
        {/* Book history section */}
        {book.borrowHistory && book.borrowHistory.length > 0 && (
          <div className="border-t border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Borrow History</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Borrower
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Borrow Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Return Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {book.borrowHistory.map((history, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {typeof history.borrower === 'object' ? history.borrower.name : 'User'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(history.borrowDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {history.returnDate 
                          ? new Date(history.returnDate).toLocaleDateString() 
                          : 'Not returned yet'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {history.rating ? `${history.rating}/5` : 'No rating'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      {/* Contact Owner Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg mx-4 overflow-hidden">
            <div className="bg-green-600 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold">Contact Book Owner</h3>
              <button 
                onClick={() => setShowContactModal(false)}
                className="text-white hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-900 mb-1">Message to {ownerName}</h4>
                <p className="text-gray-600 mb-4">
                  Your message will be sent to the owner of "{book.title}". They will be able to reply to you directly.
                </p>
                
                <div className="mb-4 bg-green-50 p-3 rounded-md border border-green-100 text-sm text-green-700">
                  <p className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span><strong>Demo Notice:</strong> Contact functionality is currently in demo mode. In the full version, your message will be sent to the book owner.</span>
                  </p>
                </div>
                
                <textarea
                  rows={6}
                  placeholder="Write your message here..."
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitContactForm}
                  disabled={isSubmitting || !contactMessage.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg mx-4 overflow-hidden">
            <div className="bg-yellow-500 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold">Rate & Review</h3>
              <button 
                onClick={() => setShowReviewModal(false)}
                className="text-white hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Your rating for "{book.title}"</h4>
                
                <div className="flex items-center mb-4">
                  <p className="mr-4 text-gray-700">Rating:</p>
                  <StarRating rating={userRating} setRating={setUserRating} editable={true} />
                </div>
                
                <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Review (Optional)
                </label>
                <textarea
                  id="review"
                  rows={4}
                  placeholder="Share your thoughts about this book..."
                  value={userReview}
                  onChange={(e) => setUserReview(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitReview}
                  disabled={isSubmitting || userRating === 0}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:bg-yellow-300 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDetailPage; 