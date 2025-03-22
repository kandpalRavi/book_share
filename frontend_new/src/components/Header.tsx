import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import NotificationBell from './NotificationBell';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-sm shadow-md py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo and Name */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center transform transition-transform group-hover:rotate-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className={`font-bold transition-colors duration-300 ${scrolled ? 'text-gray-900' : 'text-gray-800'} text-xl md:text-2xl`}>BookShare</h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors">Home</Link>
            <Link to="/books" className="text-gray-600 hover:text-blue-600 transition-colors">Browse Books</Link>
            <Link to="/about" className="text-gray-600 hover:text-blue-600 transition-colors">About</Link>
            
            <SignedIn>
              <Link to="/my-books" className="text-gray-600 hover:text-blue-600 transition-colors">My Books</Link>
              <Link to="/profile" className="text-gray-600 hover:text-blue-600 transition-colors">Profile</Link>
              <div className="flex items-center ml-4 space-x-4">
                <NotificationBell />
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
            
            <SignedOut>
              <div className="flex items-center space-x-3">
                <Link to="/sign-in" className="text-blue-600 hover:text-blue-800 transition-colors">
                  Sign In
                </Link>
                <Link to="/sign-up" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-all hover:shadow-lg transform hover:-translate-y-0.5">
                  Sign Up
                </Link>
              </div>
            </SignedOut>
          </div>

          {/* Mobile menu button */}
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-gray-600 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile navigation menu */}
        {menuOpen && (
          <div className="md:hidden mt-4 py-3 border-t border-gray-200 animate-fadeIn">
            <div className="flex flex-col space-y-3">
              <Link to="/" className="text-gray-600 hover:text-blue-600 py-2 transition-colors" onClick={() => setMenuOpen(false)}>
                Home
              </Link>
              <Link to="/books" className="text-gray-600 hover:text-blue-600 py-2 transition-colors" onClick={() => setMenuOpen(false)}>
                Browse Books
              </Link>
              <Link to="/about" className="text-gray-600 hover:text-blue-600 py-2 transition-colors" onClick={() => setMenuOpen(false)}>
                About
              </Link>
              
              <SignedIn>
                <Link to="/my-books" className="text-gray-600 hover:text-blue-600 py-2 transition-colors" onClick={() => setMenuOpen(false)}>
                  My Books
                </Link>
                <Link to="/profile" className="text-gray-600 hover:text-blue-600 py-2 transition-colors" onClick={() => setMenuOpen(false)}>
                  Profile
                </Link>
                <div className="py-2">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
              
              <SignedOut>
                <Link to="/sign-in" className="text-blue-600 hover:text-blue-800 py-2 transition-colors" onClick={() => setMenuOpen(false)}>
                  Sign In
                </Link>
                <Link to="/sign-up" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md inline-block transition-all hover:shadow-lg" onClick={() => setMenuOpen(false)}>
                  Sign Up
                </Link>
              </SignedOut>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 