import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { bookService } from '../services/apiService';
import LoadingSpinner from '../components/LoadingSpinner';

interface BookFormData {
  title: string;
  author: string;
  description: string;
  genre: string[];
  language: string;
  condition: string;
  location: string;
  borrowDuration: number;
  isExchangeable: boolean;
  isDonation: boolean;
}

const AddBookPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<BookFormData>({
    title: '',
    author: '',
    description: '',
    genre: [],
    language: 'English',
    condition: 'Good',
    location: '',
    borrowDuration: 14,
    isExchangeable: false,
    isDonation: false
  });
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Genre options
  const genreOptions = [
    'Fiction', 'Non-Fiction', 'Mystery', 'Science Fiction', 
    'Fantasy', 'Romance', 'Thriller', 'Biography', 
    'Self-Help', 'History', 'Science', 'Poetry',
    'Children', 'Young Adult', 'Comics', 'Art'
  ];

  // Condition options
  const conditionOptions = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

  // Handle text/select input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle checkbox input changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // Handle genre selection (multiple)
  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions).map(option => option.value);
    setFormData(prev => ({ ...prev, genre: options }));
  };

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      
      // Limit to 5 images
      const selectedFiles = filesArray.slice(0, 5);
      setImages(selectedFiles);
      
      // Create preview URLs
      const newPreviewUrls = selectedFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(newPreviewUrls);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!user) {
      setError('You must be logged in to add a book.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Create FormData object for file upload
      const data = new FormData();
      
      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          // For arrays like genre, append each value with the same key
          value.forEach(item => data.append(key, item));
        } else {
          data.append(key, String(value));
        }
      });
      
      // Append Clerk ID instead of ownerId
      data.append('clerkId', user.id);
      
      // Append images
      images.forEach(image => {
        data.append('images', image);
      });

      console.log('Submitting form data with Clerk ID:', user.id);

      // Submit the form
      const response = await bookService.createBook(data);
      
      console.log('Book creation response received:', response);
      
      // Navigate to the new book's detail page
      if (response.success && response.data && response.data._id) {
        // Response has the expected structure with success and data fields
        navigate(`/books/${response.data._id}`);
      } else if (response && response._id) {
        // Response directly contains the book object (older API format)
        navigate(`/books/${response._id}`);
      } else {
        setError('Error: Received invalid response from server');
        console.error('Invalid response format:', response);
      }
    } catch (err) {
      console.error('Error adding book:', err);
      setError('Failed to add book. Please check if the server is running and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Add New Book</h1>
      
      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Book Title*
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>
            
            {/* Author */}
            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                Author*
              </label>
              <input
                type="text"
                id="author"
                name="author"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.author}
                onChange={handleInputChange}
              />
            </div>
            
            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location*
              </label>
              <input
                type="text"
                id="location"
                name="location"
                required
                placeholder="City, Country"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.location}
                onChange={handleInputChange}
              />
            </div>
            
            {/* Genre */}
            <div>
              <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-1">
                Genre(s)*
              </label>
              <select
                id="genre"
                name="genre"
                required
                multiple
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 h-32"
                value={formData.genre as string[]}
                onChange={handleGenreChange}
              >
                {genreOptions.map(genre => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">Hold Ctrl (or Cmd) to select multiple genres</p>
            </div>
            
            {/* Condition & Language */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
                  Condition*
                </label>
                <select
                  id="condition"
                  name="condition"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.condition}
                  onChange={handleInputChange}
                >
                  {conditionOptions.map(condition => (
                    <option key={condition} value={condition}>
                      {condition}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                  Language*
                </label>
                <input
                  type="text"
                  id="language"
                  name="language"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.language}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            {/* Borrow Duration */}
            <div>
              <label htmlFor="borrowDuration" className="block text-sm font-medium text-gray-700 mb-1">
                Borrow Duration (days)*
              </label>
              <input
                type="number"
                id="borrowDuration"
                name="borrowDuration"
                required
                min={1}
                max={365}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.borrowDuration}
                onChange={handleInputChange}
              />
            </div>
            
            {/* Options */}
            <div className="flex flex-col space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isExchangeable"
                  name="isExchangeable"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={formData.isExchangeable}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor="isExchangeable" className="ml-2 block text-sm text-gray-700">
                  Available for exchange
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isDonation"
                  name="isDonation"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={formData.isDonation}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor="isDonation" className="ml-2 block text-sm text-gray-700">
                  Available for donation
                </label>
              </div>
            </div>
            
            {/* Images */}
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-1">
                Book Images (max 5)
              </label>
              <div className="mt-1 mb-4 px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="images"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload book cover and images</span>
                      <input
                        id="images"
                        name="images"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
              
              {/* Image previews */}
              {previewUrls.length > 0 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selected Images (First image will be the main cover)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="w-32 h-40 relative group">
                        <div className={`absolute inset-0 border-2 rounded ${index === 0 ? 'border-blue-500' : 'border-gray-300'}`}>
                          {index === 0 && (
                            <div className="absolute top-0 left-0 bg-blue-500 text-white text-xs py-1 px-2 rounded-br">
                              Cover
                            </div>
                          )}
                          <img 
                            src={url} 
                            alt={`Book upload preview ${index + 1}`} 
                            className="w-full h-full object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewUrls(previewUrls.filter((_, i) => i !== index));
                              setImages(images.filter((_, i) => i !== index));
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Description */}
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description*
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 mr-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <LoadingSpinner /> : 'Add Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBookPage; 