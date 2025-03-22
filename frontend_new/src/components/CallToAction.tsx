import { Link } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';

const CallToAction = () => {
  return (
    <section className="relative py-16 sm:py-24">
      {/* Background gradient and decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-800 opacity-90"></div>
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80')] bg-cover bg-center mix-blend-overlay"></div>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <svg className="absolute left-0 top-0 h-full w-48 text-white/5 transform -translate-x-1/2" fill="currentColor" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <polygon points="50,0 100,0 50,100 0,100" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
          Ready to start sharing books?
        </h2>
        <p className="max-w-2xl mx-auto text-xl text-blue-100 mb-10">
          Join our community today and connect with fellow book lovers in your area. Share your collection, borrow new reads, and discover your next favorite book.
        </p>

        <SignedOut>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              to="/sign-up"
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              Create a Free Account
            </Link>
            <Link
              to="/browse"
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-white bg-transparent hover:bg-white/10 border-white transition-colors"
            >
              Browse Books First
            </Link>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              to="/my-books"
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              Go to My Books
            </Link>
            <Link
              to="/add-book"
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-white bg-transparent hover:bg-white/10 border-white transition-colors"
            >
              Add a New Book
            </Link>
          </div>
        </SignedIn>

        {/* Statistics */}
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow-xl p-6">
            <div className="text-4xl font-bold text-white mb-2">10,000+</div>
            <div className="text-blue-100">Books Shared</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow-xl p-6">
            <div className="text-4xl font-bold text-white mb-2">5,000+</div>
            <div className="text-blue-100">Active Members</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow-xl p-6">
            <div className="text-4xl font-bold text-white mb-2">100+</div>
            <div className="text-blue-100">Local Communities</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction; 