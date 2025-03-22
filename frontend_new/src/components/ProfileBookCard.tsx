import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Book } from '../types';
import { bookService } from '../services/apiService';
import defaultBookCover from '../assets/default-book-cover.js';

interface ProfileBookCardProps {
  book: Book;
  isOwner?: boolean;
  onDelete?: (bookId: string) => void;
  onReturn?: (bookId: string) => void;
}

const ProfileBookCard = ({ book, isOwner = true, onDelete, onReturn }: ProfileBookCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReturning, setIsReturning] = useState(false);

  // Get the first image or use a default image
  const coverImage = book.images && book.images.length > 0 
    ? (book.images[0].startsWith('http') ? book.images[0] : `${import.meta.env.VITE_API_URL}/uploads/${book.images[0]}`)
    : defaultBookCover;

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

  // Format status with color coding
  const getStatusColor = (status: string) => {
    const colors = {
      'Available': 'bg-green-100 text-green-800',
      'Borrowed': 'bg-red-100 text-red-800',
      'Reserved': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${book.title}"?`)) {
      if (onDelete) {
        setIsDeleting(true);
        try {
          const response = await bookService.deleteBook(book._id);
          
          // Check if response indicates success
          if (response && response.success) {
            // Call the parent component's onDelete handler
            onDelete(book._id);
          } else {
            // If we received a response but it wasn't successful
            throw new Error(response.message || 'Failed to delete book');
          }
        } catch (error: any) {
          console.error('Error deleting book:', error);
          
          // Extract error message from the response if available
          let errorMessage = 'Failed to delete book. Please try again later.';
          
          if (error.response && error.response.data) {
            // Use the error message from the API response
            errorMessage = error.response.data.message || errorMessage;
          } else if (error.message) {
            // Use the error message directly if available
            errorMessage = error.message;
          }
          
          // Show appropriate error message
          alert(errorMessage);
        } finally {
          setIsDeleting(false);
        }
      }
    }
  };

  const handleReturn = async () => {
    if (window.confirm(`Are you sure you want to return "${book.title}"?`)) {
      if (onReturn) {
        setIsReturning(true);
        try {
          // Get the current borrower ID
          let borrowerId = '';
          
          if (typeof book.currentBorrower === 'string') {
            borrowerId = book.currentBorrower;
          } else if (book.currentBorrower && typeof book.currentBorrower === 'object') {
            borrowerId = book.currentBorrower._id;
          } else {
            throw new Error('Current borrower information is missing');
          }
          
          // Call the API to return the book
          const response = await bookService.returnBook(book._id, borrowerId);
          
          // Check if response indicates success
          if (response && response.success) {
            // Call the parent component's onReturn handler
            onReturn(book._id);
            
            // Show success message
            alert(`You've successfully returned "${book.title}". The book owner has been notified.`);
          } else {
            // If we received a response but it wasn't successful
            throw new Error(response.message || 'Failed to return book');
          }
        } catch (error: any) {
          console.error('Error returning book:', error);
          
          // Extract error message from the response if available
          let errorMessage = 'Failed to return book. Please try again or contact the book owner directly.';
          
          if (error.response && error.response.data) {
            // Use the error message from the API response
            errorMessage = error.response.data.message || errorMessage;
          } else if (error.message) {
            // Use the error message directly if available
            errorMessage = error.message;
          }
          
          // Show appropriate error message
          alert(errorMessage);
        } finally {
          setIsReturning(false);
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <Link to={`/books/${book._id}`}>
          <div className="h-48 overflow-hidden relative">
            <img
              src={coverImage}
              alt={`Cover of ${book.title}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = defaultBookCover;
              }}
            />
            <div className="absolute top-2 right-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(book.status)}`}>
                {book.status}
              </span>
            </div>
          </div>
        </Link>

        {/* Action buttons overlaid at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 flex justify-end">
          {isOwner ? (
            <button 
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-white bg-red-500 hover:bg-red-600 p-1 rounded-full"
              title="Delete book"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          ) : (
            <button 
              onClick={handleReturn}
              disabled={isReturning}
              className="text-white bg-green-500 hover:bg-green-600 p-1 rounded-full"
              title="Return book"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <Link to={`/books/${book._id}`}>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{book.title}</h3>
          <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
          
          <div className="flex flex-wrap gap-1 mb-2">
            {book.genre.slice(0, 2).map((genre, index) => (
              <span key={index} className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">
                {genre}
              </span>
            ))}
            {book.genre.length > 2 && (
              <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">
                +{book.genre.length - 2}
              </span>
            )}
          </div>
          
          <div className="flex justify-between items-center mt-3">
            <span className={`px-2 py-1 rounded text-xs font-medium ${getConditionColor(book.condition)}`}>
              {book.condition}
            </span>
            <span className="text-sm text-gray-500">{book.location}</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProfileBookCard; 