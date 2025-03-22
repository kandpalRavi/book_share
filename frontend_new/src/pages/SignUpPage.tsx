import React from 'react';
import { SignUp } from '@clerk/clerk-react';
import { useLocation } from 'react-router-dom';

const SignUpPage: React.FC = () => {
  const location = useLocation();
  
  // Extract the "from" pathname from location state (the page that redirected to sign-up)
  const from = location.state?.from || '/';
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <a href="/sign-in" className="font-medium text-blue-600 hover:text-blue-500">
              sign in to your existing account
            </a>
          </p>
        </div>
        
        <div className="mt-8">
          <SignUp 
            routing="hash"
            signInUrl="/sign-in"
            redirectUrl={from}
          />
        </div>
      </div>
    </div>
  );
};

export default SignUpPage; 