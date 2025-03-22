import { useState, useEffect } from 'react';
import { Book } from '../types';
import { bookService } from '../services/apiService';
import BookCard from './BookCard';
import LoadingSpinner from './LoadingSpinner';

interface BookListProps {
  category?: string;
  searchTerm?: string;
  condition?: string;
  location?: string;
  status?: string;
  limit?: number;
}

const BookList = ({ category, searchTerm, condition, location, status, limit = 12 }: BookListProps) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const params: Record<string, string | number> = { limit };
        if (category) params.genre = category;
        if (searchTerm) params.search = searchTerm;
        if (condition) params.condition = condition;
        if (location) params.location = location;
        if (status) params.status = status;

        const response = await bookService.getAllBooks(params);
        if (response.success && response.data) {
          // New response structure with success and data fields
          setBooks(response.data);
        } else {
          // Handle older response structure for backward compatibility
          setBooks(response.items || response || []);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching books:', err);
        setError('Failed to load books. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [category, searchTerm, condition, location, status, limit]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition duration-200"
        >
          Retry
        </button>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <p className="text-gray-500 mb-2">No books found</p>
        <p className="text-gray-500 text-sm mb-6">
          {searchTerm ? <span>No results for "{searchTerm}"</span> : null}
          {category ? <span>{searchTerm ? ' in ' : 'No books in '}{category}</span> : null}
          {condition ? <span>{searchTerm || category ? ' with ' : 'No books with '}{condition} condition</span> : null}
          {location ? <span>{searchTerm || category || condition ? ' near ' : 'No books near '}{location}</span> : null}
          {!searchTerm && !category && !condition && !location ? 'Try adjusting your filters or adding a new book to share' : null}
        </p>
        <a
          href="/add-book"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Share a Book
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {books.map((book) => (
        <BookCard key={book._id} book={book} />
      ))}
    </div>
  );
};

export default BookList; 