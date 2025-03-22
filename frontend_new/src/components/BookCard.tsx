import { Link } from 'react-router-dom';
import { Book } from '../types';
import defaultBookCover from '../assets/default-book-cover.js';

interface BookCardProps {
  book: Book;
}

const BookCard = ({ book }: BookCardProps) => {
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

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
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

export default BookCard; 