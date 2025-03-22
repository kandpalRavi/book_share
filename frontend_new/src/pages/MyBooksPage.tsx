import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { Book } from '../types';
import { bookService, userService } from '../services/apiService';
import ProfileBookCard from '../components/ProfileBookCard';
import LoadingSpinner from '../components/LoadingSpinner';

const MyBooksPage = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const [profileData, setProfileData] = useState<any>(null);
  const [myBooks, setMyBooks] = useState<Book[]>([]);
  const [borrowedBooks, setBorrowedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'shared' | 'borrowed' | 'history'>('shared');
  const [bookStats, setBookStats] = useState({
    total: 0,
    available: 0,
    borrowed: 0,
    returned: 0
  });

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) {
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Fetch user profile data
        const profileResponse = await userService.getUserProfile(user.id);
        if (profileResponse.success && profileResponse.data) {
          setProfileData(profileResponse.data);
          
          // Use MongoDB user ID for book queries
          const mongoUserId = profileResponse.data._id;
          
          // Fetch books owned by the user
          const booksResponse = await bookService.getAllBooks({ owner: mongoUserId });
          
          // Check if response has the expected structure
          if (booksResponse.success && Array.isArray(booksResponse.data)) {
            setMyBooks(booksResponse.data);
            
            // Calculate book stats
            const booksArray = booksResponse.data;
            setBookStats({
              total: booksArray.length,
              available: booksArray.filter((book: Book) => book.status === 'Available').length,
              borrowed: booksArray.filter((book: Book) => book.status === 'Borrowed').length,
              returned: 0 // We'll update this when we implement history
            });
          } else {
            // Fallback for backward compatibility
            const booksArray = booksResponse.data?.items || booksResponse.data || [];
            setMyBooks(booksArray);
            setBookStats({
              total: booksArray.length,
              available: booksArray.filter((book: Book) => book.status === 'Available').length,
              borrowed: booksArray.filter((book: Book) => book.status === 'Borrowed').length,
              returned: 0
            });
          }
          
          // Fetch books borrowed by the user
          const borrowedResponse = await bookService.getAllBooks({ currentBorrower: mongoUserId });
          
          // Check if response has the expected structure
          if (borrowedResponse.success && Array.isArray(borrowedResponse.data)) {
            setBorrowedBooks(borrowedResponse.data);
          } else {
            // Fallback for backward compatibility
            setBorrowedBooks(borrowedResponse.data?.items || borrowedResponse.data || []);
          }
        } else {
          // Handle case where user exists in Clerk but not in our database
          console.log('User profile not found in database. Creating profile...');
          setError('Your profile is being set up. Please refresh the page in a few seconds.');
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isLoaded, isSignedIn, user?.id]);

  // Handler for deleting a book
  const handleDeleteBook = async (bookId: string) => {
    try {
      // Find the book in the current state to check its status
      const bookToDelete = myBooks.find(book => book._id === bookId);
      
      // Check if the book is borrowed or reserved before attempting to delete
      if (bookToDelete && bookToDelete.status === 'Borrowed') {
        alert('This book cannot be deleted because it is currently borrowed by someone.');
        return;
      } else if (bookToDelete && bookToDelete.status === 'Reserved') {
        alert('This book cannot be deleted because it is currently reserved.');
        return;
      }
      
      // Call the API to delete the book
      const response = await bookService.deleteBook(bookId);
      
      // If successful, update the UI
      if (response && response.success) {
        // Remove the book from the local state
        setMyBooks(prevBooks => prevBooks.filter(book => book._id !== bookId));
        
        // Update stats
        setBookStats(prev => ({
          ...prev,
          total: prev.total - 1,
          available: bookToDelete?.status === 'Available' ? prev.available - 1 : prev.available,
          borrowed: bookToDelete?.status === 'Borrowed' ? prev.borrowed - 1 : prev.borrowed
        }));
        
        alert('Book deleted successfully');
      } else {
        // The API responded but it wasn't successful
        throw new Error(response.message || 'Failed to delete book');
      }
    } catch (error: any) {
      console.error('Error deleting book:', error);
      
      // Extract error message from the response if available
      let errorMessage = 'Failed to delete book. Please try again.';
      
      if (error.response && error.response.data) {
        // Use the error message from the API response
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.message) {
        // Use the error message directly if available
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    }
  };

  // Handler for returning a borrowed book
  const handleReturnBook = async (bookId: string) => {
    try {
      // Find the book in the borrowed books list
      const bookToReturn = borrowedBooks.find(book => book._id === bookId);
      
      if (!bookToReturn) {
        alert('Book not found in your borrowed list.');
        return;
      }
      
      // Get the borrower ID (current user's MongoDB ID)
      const borrowerId = profileData._id;
      
      if (!borrowerId) {
        alert('User information is missing. Please try again after refreshing the page.');
        return;
      }
      
      // Call the API to return the book
      const response = await bookService.returnBook(bookId, borrowerId);
      
      // If successful, update the UI
      if (response && response.success) {
        // Remove the book from the borrowed books state
        setBorrowedBooks(prevBooks => prevBooks.filter(book => book._id !== bookId));
        
        // Update stats
        setBookStats(prev => ({
          ...prev,
          returned: prev.returned + 1
        }));
        
        alert('Book has been successfully returned. The owner has been notified.');
      } else {
        // The API responded but it wasn't successful
        throw new Error(response.message || 'Failed to return book');
      }
    } catch (error: any) {
      console.error('Error returning book:', error);
      
      // Extract error message from the response if available
      let errorMessage = 'Failed to return book. Please try again.';
      
      if (error.response && error.response.data) {
        // Use the error message from the API response
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.message) {
        // Use the error message directly if available
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    }
  };

  if (!isLoaded) {
    return <LoadingSpinner />;
  }

  if (!isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Please sign in to view your books</h1>
        <Link to="/sign-in" className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Sign In
        </Link>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Dashboard Header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <h1 className="text-3xl font-bold mb-2">My Books Dashboard</h1>
          <p className="text-blue-100 mb-4">
            Manage your shared books and track your borrowing activity
          </p>
        </div>
        
        {/* Statistics Cards */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <h3 className="text-lg font-semibold text-blue-800 mb-1">Total Books</h3>
              <p className="text-3xl font-bold text-blue-600">{bookStats.total}</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <h3 className="text-lg font-semibold text-green-800 mb-1">Available</h3>
              <p className="text-3xl font-bold text-green-600">{bookStats.available}</p>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
              <h3 className="text-lg font-semibold text-orange-800 mb-1">Lent Out</h3>
              <p className="text-3xl font-bold text-orange-600">{bookStats.borrowed}</p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <h3 className="text-lg font-semibold text-purple-800 mb-1">Borrowed</h3>
              <p className="text-3xl font-bold text-purple-600">{borrowedBooks.length}</p>
            </div>
          </div>
          
          <div className="mt-6 flex justify-between">
            <Link
              to="/my-books/requests"
              className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              View Borrow Requests
            </Link>
            <Link
              to="/add-book"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Book
            </Link>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="flex border-b border-gray-200">
          <button
            className={`py-4 px-6 text-sm font-medium ${
              activeTab === 'shared'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('shared')}
          >
            Books I'm Sharing ({myBooks.length})
          </button>
          <button
            className={`py-4 px-6 text-sm font-medium ${
              activeTab === 'borrowed'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('borrowed')}
          >
            Books I've Borrowed ({borrowedBooks.length})
          </button>
          <button
            className={`py-4 px-6 text-sm font-medium ${
              activeTab === 'history'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('history')}
          >
            Borrowing History
          </button>
        </div>
        
        <div className="p-6">
          {/* Shared Books */}
          {activeTab === 'shared' && (
            <>
              {myBooks.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">You haven't added any books yet</h3>
                  <p className="text-gray-500 mb-6">Start sharing your books with the community!</p>
                  <Link
                    to="/add-book"
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add First Book
                  </Link>
                </div>
              ) : (
                <>
                  {/* Filter controls */}
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center">
                      <label htmlFor="status-filter" className="mr-2 text-sm text-gray-600">Filter by:</label>
                      <select
                        id="status-filter"
                        className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                        onChange={(e) => {
                          // Here you would implement filtering logic
                          console.log('Filter by:', e.target.value);
                        }}
                      >
                        <option value="all">All Books</option>
                        <option value="available">Available</option>
                        <option value="borrowed">Borrowed</option>
                        <option value="reserved">Reserved</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center">
                      <label htmlFor="sort-by" className="mr-2 text-sm text-gray-600">Sort by:</label>
                      <select
                        id="sort-by"
                        className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                        onChange={(e) => {
                          // Here you would implement sorting logic
                          console.log('Sort by:', e.target.value);
                        }}
                      >
                        <option value="date-added-desc">Date Added (Newest)</option>
                        <option value="date-added-asc">Date Added (Oldest)</option>
                        <option value="title">Title (A-Z)</option>
                        <option value="author">Author (A-Z)</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Book grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {myBooks.map((book) => (
                      <ProfileBookCard 
                        key={book._id} 
                        book={book} 
                        isOwner={true}
                        onDelete={handleDeleteBook}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
          
          {/* Borrowed Books */}
          {activeTab === 'borrowed' && (
            <>
              {borrowedBooks.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">You haven't borrowed any books yet</h3>
                  <p className="text-gray-500 mb-6">Explore the available books in the community!</p>
                  <Link
                    to="/books"
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Browse Books
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {borrowedBooks.map((book) => (
                    <ProfileBookCard 
                      key={book._id} 
                      book={book} 
                      isOwner={false}
                      onReturn={handleReturnBook}
                    />
                  ))}
                </div>
              )}
            </>
          )}
          
          {/* Book History */}
          {activeTab === 'history' && (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Borrowing History</h3>
              <p className="text-gray-500 mb-6">Your borrowing history will appear here once you start returning books.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Quick Links Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              to="/add-book"
              className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
            >
              <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <div>
                <h3 className="font-medium text-blue-800">Add New Book</h3>
                <p className="text-sm text-blue-600">Share a book from your collection</p>
              </div>
            </Link>
            
            <Link
              to="/my-books/requests"
              className="flex items-center p-4 bg-yellow-50 rounded-lg border border-yellow-100 hover:bg-yellow-100 transition-colors"
            >
              <svg className="w-6 h-6 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <div>
                <h3 className="font-medium text-yellow-800">Book Requests</h3>
                <p className="text-sm text-yellow-600">Manage borrowing requests</p>
              </div>
            </Link>
            
            <Link
              to="/my-requests"
              className="flex items-center p-4 bg-indigo-50 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors"
            >
              <svg className="w-6 h-6 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <div>
                <h3 className="font-medium text-indigo-800">My Requests</h3>
                <p className="text-sm text-indigo-600">Track your borrowing requests</p>
              </div>
            </Link>
            
            <Link
              to="/books"
              className="flex items-center p-4 bg-green-50 rounded-lg border border-green-100 hover:bg-green-100 transition-colors"
            >
              <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <div>
                <h3 className="font-medium text-green-800">Browse Books</h3>
                <p className="text-sm text-green-600">Discover books to borrow</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyBooksPage; 