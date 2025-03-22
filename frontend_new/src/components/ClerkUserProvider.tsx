import { ReactNode, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';

interface ClerkUserProviderProps {
  children: ReactNode;
}

const ClerkUserProvider = ({ children }: ClerkUserProviderProps) => {
  const { user, isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn && user?.id) {
        // Store the Clerk user ID in localStorage when signed in
        localStorage.setItem('clerk-user-id', user.id);
        console.log('Stored Clerk user ID in localStorage:', user.id);
        
        // Create or update user in backend database
        const createOrUpdateUser = async () => {
          try {
            // Prepare user data from Clerk
            const userData = {
              id: user.id,
              email_addresses: [{ email_address: user.primaryEmailAddress?.emailAddress }],
              first_name: user.firstName,
              last_name: user.lastName,
              image_url: user.imageUrl
            };
            
            // Send request to backend
            await axios.post(
              `${import.meta.env.VITE_API_URL}/users/clerk-webhook`,
              userData
            );
            console.log('User created or updated successfully in backend database');
          } catch (error) {
            console.error('Error creating/updating user in backend:', error);
          }
        };
        
        createOrUpdateUser();
      } else {
        // Remove the Clerk user ID from localStorage when signed out
        localStorage.removeItem('clerk-user-id');
      }
    }
  }, [isLoaded, isSignedIn, user]);

  return <>{children}</>;
};

export default ClerkUserProvider; 