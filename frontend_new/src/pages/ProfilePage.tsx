import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Book } from '../types';
import { bookService, userService } from '../services/apiService';
import ProfileBookCard from '../components/ProfileBookCard';
import LoadingSpinner from '../components/LoadingSpinner';
import RequestStatsDashboard from '../components/RequestStatsDashboard';

const ProfilePage = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const [profileData, setProfileData] = useState<any>(null);
  const [myBooks, setMyBooks] = useState<Book[]>([]);
  const [borrowedBooks, setBorrowedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'shared' | 'borrowed'>('shared');
  const [bookRequests, setBookRequests] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);

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
          
          // Use MongoDB user ID for book queries if needed
          const mongoUserId = profileResponse.data._id;
          
          // Fetch books owned by the user
          const booksResponse = await bookService.getAllBooks({ owner: mongoUserId });
          
          // Check if response has the expected structure
          if (booksResponse.success && Array.isArray(booksResponse.data)) {
            setMyBooks(booksResponse.data);
          } else {
            // Fallback for backward compatibility
            setMyBooks(booksResponse.data?.items || booksResponse.data || []);
          }
          
          // Fetch books borrowed by the user - specifically using the currentBorrower parameter
          const borrowedResponse = await bookService.getAllBooks({ currentBorrower: mongoUserId });
          
          // Check if response has the expected structure
          if (borrowedResponse.success && Array.isArray(borrowedResponse.data)) {
            setBorrowedBooks(borrowedResponse.data);
          } else {
            // Fallback for backward compatibility
            setBorrowedBooks(borrowedResponse.data?.items || borrowedResponse.data || []);
          }
          
          // Fetch book requests (as owner)
          try {
            const bookRequestsResponse = await bookService.getBookRequests();
            if (bookRequestsResponse.success) {
              setBookRequests(bookRequestsResponse.data || []);
            }
          } catch (err) {
            console.error('Error fetching book requests:', err);
            setBookRequests([]);
          }
          
          // Fetch my requests (as requester)
          try {
            const myRequestsResponse = await bookService.getMyRequests();
            if (myRequestsResponse.success) {
              setMyRequests(myRequestsResponse.data || []);
            }
          } catch (err) {
            console.error('Error fetching my requests:', err);
            setMyRequests([]);
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
        // Remove the book from the local state
        setBorrowedBooks(prevBooks => prevBooks.filter(book => book._id !== bookId));
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Please sign in to view your profile</h1>
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
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="md:flex">
          {/* User Info Section */}
          <div className="md:w-1/3 p-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-white/30">
                <img
                  src={user.imageUrl || 'https://via.placeholder.com/150?text=User'}
                  alt={user.fullName || 'User'}
                  className="w-full h-full object-cover"
                />
              </div>
              <h1 className="text-2xl font-bold mb-1">{user.fullName}</h1>
              <p className="text-blue-100 mb-4">{user.primaryEmailAddress?.emailAddress}</p>
              
              {profileData?.location && (
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{profileData.location}</span>
                </div>
              )}
              
              {profileData?.createdAt && (
                <div className="flex items-center mb-4">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Member since {new Date(profileData.createdAt).toLocaleDateString()}</span>
                </div>
              )}
              
              {profileData?.bio && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">About</h3>
                  <p className="text-blue-100">{profileData.bio}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* User Stats Section */}
          <div className="md:w-2/3 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Books</h2>
            
            <div className="flex border-b border-gray-200 mb-6">
              <button
                className={`pb-2 px-4 text-sm font-medium ${
                  activeTab === 'shared'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('shared')}
              >
                Books I'm Sharing ({myBooks.length})
              </button>
              <button
                className={`pb-2 px-4 text-sm font-medium ${
                  activeTab === 'borrowed'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('borrowed')}
              >
                Books I've Borrowed ({borrowedBooks.length})
              </button>
            </div>
            
            {/* Book stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <h3 className="text-lg font-semibold text-blue-800 mb-1">Total Books</h3>
                <p className="text-3xl font-bold text-blue-600">{myBooks.length}</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                <h3 className="text-lg font-semibold text-green-800 mb-1">Available</h3>
                <p className="text-3xl font-bold text-green-600">
                  {myBooks.filter(book => book.status === 'Available').length}
                </p>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                <h3 className="text-lg font-semibold text-orange-800 mb-1">Borrowed</h3>
                <p className="text-3xl font-bold text-orange-600">
                  {myBooks.filter(book => book.status === 'Borrowed').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Request Activity Dashboards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <RequestStatsDashboard 
          totalRequests={bookRequests.length}
          pendingRequests={bookRequests.filter(req => req.status === 'Pending').length}
          approvedRequests={bookRequests.filter(req => req.status === 'Approved').length}
          rejectedRequests={bookRequests.filter(req => req.status === 'Rejected').length}
          asOwner={true}
        />
        
        <RequestStatsDashboard 
          totalRequests={myRequests.length}
          pendingRequests={myRequests.filter(req => req.status === 'Pending').length}
          approvedRequests={myRequests.filter(req => req.status === 'Approved').length}
          rejectedRequests={myRequests.filter(req => req.status === 'Rejected').length}
          asOwner={false}
        />
      </div>
      
      {/* Book List Section */}
      <div>
        {activeTab === 'shared' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Books I'm Sharing</h2>
              <a
                href="/add-book"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Book
              </a>
            </div>
            
            {myBooks.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="text-xl font-medium text-gray-900 mb-2">You haven't added any books yet</h3>
                <p className="text-gray-500 mb-6">Start sharing your books with the community!</p>
                <a
                  href="/add-book"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add First Book
                </a>
              </div>
            ) : (
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
            )}
          </>
        )}
        
        {activeTab === 'borrowed' && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Books I've Borrowed</h2>
            
            {borrowedBooks.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="text-xl font-medium text-gray-900 mb-2">You haven't borrowed any books yet</h3>
                <p className="text-gray-500 mb-6">Explore the available books in the community!</p>
                <a
                  href="/books"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Browse Books
                </a>
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
      </div>
    </div>
  );
};

export default ProfilePage; 