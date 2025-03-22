import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import BooksPage from './pages/BooksPage';
import BookDetailPage from './pages/BookDetailPage';
import AddBookPage from './pages/AddBookPage';
import MyBooksPage from './pages/MyBooksPage';
import ProfilePage from './pages/ProfilePage';
import BookRequestsPage from './pages/BookRequestsPage';
import MyRequestsPage from './pages/MyRequestsPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import NotFoundPage from './pages/NotFoundPage';
import AboutPage from './pages/AboutPage';

function App() {
  const { user, isSignedIn } = useUser();
  
  // Store the Clerk user ID in localStorage when signed in
  useEffect(() => {
    if (isSignedIn && user) {
      localStorage.setItem('clerk-user-id', user.id);
      console.log('User authenticated, ID stored in localStorage:', user.id);
    } else {
      localStorage.removeItem('clerk-user-id');
    }
  }, [isSignedIn, user]);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/books/:bookId" element={<BookDetailPage />} />
          <Route path="/add-book" element={<AddBookPage />} />
          <Route path="/my-books" element={<MyBooksPage />} />
          <Route path="/my-books/requests" element={<BookRequestsPage />} />
          <Route path="/my-requests" element={<MyRequestsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
