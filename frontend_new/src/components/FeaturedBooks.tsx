import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BookCard from './BookCard';
import { Book } from '../types';
import defaultBookCover from '../assets/default-book-cover.js';

// Mock book data with the proper structure matching the Book interface
const mockBooks: Book[] = [
  {
    _id: '1',
    title: 'The Midnight Library',
    author: 'Matt Haig',
    description: 'Between life and death there is a library, and within that library, the shelves go on forever.',
    genre: ['Fiction', 'Fantasy'],
    language: 'English',
    condition: 'New',
    images: [],
    owner: '1',
    currentBorrower: null,
    status: 'Available',
    location: 'New York',
    isExchangeable: true,
    isDonation: false,
    borrowDuration: 14,
    borrowHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '2',
    title: 'Atomic Habits',
    author: 'James Clear',
    description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones',
    genre: ['Self-Help', 'Psychology'],
    language: 'English',
    condition: 'Like New',
    images: [],
    owner: '1',
    currentBorrower: null,
    status: 'Available',
    location: 'Boston',
    isExchangeable: true,
    isDonation: false,
    borrowDuration: 21,
    borrowHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '3',
    title: 'Dune',
    author: 'Frank Herbert',
    description: 'A sweeping tale of destiny, politics, and power in a distant galaxy.',
    genre: ['Sci-Fi', 'Fantasy'],
    language: 'English',
    condition: 'Good',
    images: [],
    owner: '2',
    currentBorrower: '3',
    status: 'Borrowed',
    location: 'Chicago',
    isExchangeable: true,
    isDonation: false,
    borrowDuration: 30,
    borrowHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '4',
    title: 'Where the Crawdads Sing',
    author: 'Delia Owens',
    description: 'A murder mystery, a coming-of-age narrative, and a celebration of nature.',
    genre: ['Fiction', 'Mystery'],
    language: 'English',
    condition: 'Good',
    images: [],
    owner: '2',
    currentBorrower: null,
    status: 'Available',
    location: 'Los Angeles',
    isExchangeable: false,
    isDonation: true,
    borrowDuration: 14,
    borrowHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '5',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    description: 'How we think and make choices.',
    genre: ['Psychology', 'Non-Fiction'],
    language: 'English',
    condition: 'Fair',
    images: [],
    owner: '3',
    currentBorrower: '1',
    status: 'Borrowed',
    location: 'Seattle',
    isExchangeable: true,
    isDonation: false,
    borrowDuration: 21,
    borrowHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '6',
    title: 'The Silent Patient',
    author: 'Alex Michaelides',
    description: 'A psychological thriller about a woman\'s act of violence against her husband.',
    genre: ['Thriller', 'Mystery'],
    language: 'English',
    condition: 'New',
    images: [],
    owner: '3',
    currentBorrower: null,
    status: 'Available',
    location: 'Miami',
    isExchangeable: true,
    isDonation: false,
    borrowDuration: 14,
    borrowHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
];

const FeaturedBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleItems, setVisibleItems] = useState(0);

  // Simulate loading effect
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setBooks(mockBooks);
      setIsLoading(false);
    }, 800);
  }, []);

  // Animation effect for books appearing
  useEffect(() => {
    if (!isLoading && books.length > 0) {
      const interval = setInterval(() => {
        setVisibleItems(prev => {
          const newValue = prev + 1;
          if (newValue >= books.length) {
            clearInterval(interval);
          }
          return newValue;
        });
      }, 150);
      
      return () => clearInterval(interval);
    }
  }, [isLoading, books.length]);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Trending Books
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Discover the most popular books in our community right now
          </p>
        </div>

        {isLoading ? (
          // Loading skeleton
          <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
            {Array(6).fill(0).map((_, index) => (
              <div key={index} className="rounded-xl overflow-hidden shadow-md animate-pulse">
                <div className="h-64 bg-gray-300"></div>
                <div className="p-4">
                  <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                  <div className="flex space-x-1 mb-4">
                    {Array(5).fill(0).map((_, i) => (
                      <div key={i} className="w-4 h-4 bg-gray-300 rounded-full"></div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-4">
                    <div className="h-8 bg-gray-300 rounded w-1/3"></div>
                    <div className="h-8 bg-gray-300 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
            {books.map((book, index) => (
              <div 
                key={book._id} 
                className={`transition-all duration-500 ease-out transform ${
                  index < visibleItems ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
              >
                <BookCard book={book} />
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link 
            to="/books"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            View All Books
            <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedBooks; 