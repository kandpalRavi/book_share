import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BookList from '../components/BookList';
import LoadingSpinner from '../components/LoadingSpinner';

const BooksPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  // Initialize state from URL query parameters
  const [searchTerm, setSearchTerm] = useState(queryParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(queryParams.get('category') || '');
  const [selectedCondition, setSelectedCondition] = useState(queryParams.get('condition') || '');
  const [selectedLocation, setSelectedLocation] = useState(queryParams.get('location') || '');
  const [selectedStatus, setSelectedStatus] = useState(queryParams.get('status') || 'Available');
  const [isLoading, setIsLoading] = useState(false);

  // Categories for filter
  const categories = [
    'Fiction', 'Non-Fiction', 'Mystery', 'Science Fiction', 
    'Fantasy', 'Romance', 'Thriller', 'Biography', 
    'Self-Help', 'History', 'Science', 'Poetry',
    'Children', 'Young Adult', 'Comics', 'Art'
  ];

  // Conditions for filter
  const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor'];
  
  // Status options
  const statusOptions = ['Available', 'All'];
  
  // Popular locations (in a real app, these could be fetched from an API)
  const popularLocations = [
    'Dehradun', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
    'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'Delhi'
  ];

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedCondition) params.set('condition', selectedCondition);
    if (selectedLocation) params.set('location', selectedLocation);
    if (selectedStatus && selectedStatus !== 'Available') params.set('status', selectedStatus);
    
    navigate({ search: params.toString() }, { replace: true });
  }, [searchTerm, selectedCategory, selectedCondition, selectedLocation, selectedStatus, navigate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // The loading state will be reset by the BookList component after fetching
    setTimeout(() => setIsLoading(false), 500);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedCondition('');
    setSelectedLocation('');
    setSelectedStatus('Available');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg shadow-lg p-8 mb-8">
        <h1 className="text-3xl font-bold mb-4">Discover Books to Borrow</h1>
        <p className="text-lg opacity-90 mb-6">
          Browse through our community's shared collection and find your next great read.
        </p>
        
        {/* Main search bar */}
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Search by title, author, or description..."
            className="w-full px-5 py-4 pr-12 text-gray-900 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters sidebar */}
        <div className="md:w-1/4">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Filters</h2>
            
            <div className="mb-4">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
                Condition
              </label>
              <select
                id="condition"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
              >
                <option value="">Any Condition</option>
                {conditions.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-6">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                id="location"
                placeholder="Enter city or area"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 mb-2"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              />
              
              {/* Popular locations */}
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Popular locations:</p>
                <div className="flex flex-wrap gap-1">
                  {popularLocations.slice(0, 5).map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setSelectedLocation(loc)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded transition duration-200"
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleSearch}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
              >
                Apply Filters
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition duration-200"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
        
        {/* Book list */}
        <div className="md:w-3/4">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {searchTerm ? `Search Results for "${searchTerm}"` : 'Available Books'}
                </h2>
                <p className="text-gray-600">
                  {selectedCategory && `Category: ${selectedCategory}`}
                  {selectedCategory && selectedCondition && ' • '}
                  {selectedCondition && `Condition: ${selectedCondition}`}
                  {(selectedCategory || selectedCondition) && selectedLocation && ' • '}
                  {selectedLocation && `Location: ${selectedLocation}`}
                </p>
              </div>
              
              <BookList
                category={selectedCategory}
                searchTerm={searchTerm}
                condition={selectedCondition}
                location={selectedLocation}
                status={selectedStatus !== 'All' ? selectedStatus : undefined}
                limit={20}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BooksPage; 