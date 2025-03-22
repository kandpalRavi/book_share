import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 rounded-full bg-blue-200 opacity-20 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 rounded-full bg-indigo-200 opacity-20 blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className={`lg:col-span-6 transition-all duration-1000 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl mb-4">
              <span className="block">Share books with</span>
              <span className="block text-blue-600">your community</span>
            </h1>
            <p className="mt-3 text-base text-gray-600 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
              BookShare connects book lovers in your community. Lend, borrow, and discover new reads while meeting fellow readers.
            </p>
            
            <div className="mt-8 sm:flex">
              <SignedOut>
                <div className="rounded-md shadow">
                  <Link
                    to="/sign-up"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors md:py-4 md:text-lg md:px-10"
                  >
                    Get Started
                  </Link>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Link
                    to="/sign-in"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors md:py-4 md:text-lg md:px-10"
                  >
                    Sign In
                  </Link>
                </div>
              </SignedOut>
              
              <SignedIn>
                <div className="rounded-md shadow">
                  <Link
                    to="/browse"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors md:py-4 md:text-lg md:px-10"
                  >
                    Browse Books
                  </Link>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Link
                    to="/my-books"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors md:py-4 md:text-lg md:px-10"
                  >
                    My Library
                  </Link>
                </div>
              </SignedIn>
            </div>
            
            <div className="mt-6 sm:mt-8">
              <p className="text-sm text-gray-500 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Free to join, community-based book sharing
              </p>
            </div>
          </div>
          
          <div className={`mt-12 lg:mt-0 lg:col-span-6 transition-all duration-1000 delay-300 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="relative">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-200 rounded-full mix-blend-multiply opacity-20 blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-200 rounded-full mix-blend-multiply opacity-20 blur-3xl"></div>
              
              <div className="relative shadow-xl rounded-2xl overflow-hidden transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <img
                  className="w-full"
                  src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"
                  alt="Books on a shelf"
                />
                
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-transparent mix-blend-multiply"></div>
                
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
                  <div className="flex space-x-2 mb-3">
                    {['Romance', 'Fiction', 'Fantasy'].map((category) => (
                      <span key={category} className="text-xs font-semibold px-2 py-1 bg-blue-600/80 text-white rounded-full backdrop-blur-sm">
                        {category}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-white text-xl font-bold">Find books in categories you love</h3>
                  <p className="text-gray-200 text-sm mt-1">Browse by genre, author, or popularity</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero; 