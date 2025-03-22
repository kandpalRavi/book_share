import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Tabs, Tab, CircularProgress, Alert } from '@mui/material';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { bookService } from '../services/apiService';
import LoadingSpinner from '../components/LoadingSpinner';
import BookRequestsList from '../components/BookRequest/BookRequestsList';

interface BookRequest {
  _id: string;
  book: {
    _id: string;
    title: string;
    author: string;
    images: string[];
    status: string;
  };
  requester: {
    _id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
    email: string;
  };
  owner: {
    _id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
    email: string;
  };
  status: 'Pending' | 'Accepted' | 'Approved' | 'Rejected' | 'Cancelled' | 'Canceled' | 'Completed';
  requestMessage: string;
  requestDuration: number;
  createdAt: string;
}

const MyRequestsPage: React.FC = () => {
  const { isSignedIn, isLoaded, user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<BookRequest[]>([]);
  const [tabValue, setTabValue] = useState(0);

  const fetchMyRequests = async () => {
    if (!isSignedIn) {
      console.log('User not signed in, skipping API call');
      if (isLoaded) {
        // If authentication is loaded but user is not signed in, redirect to sign-in
        navigate('/sign-in', { state: { from: '/my-requests' } });
      }
      return;
    }

    setLoading(true);
    setError(null);
    
    // Check if Clerk user ID is in localStorage
    const clerkUserId = localStorage.getItem('clerk-user-id');
    if (!clerkUserId && isSignedIn && user?.id) {
      // If not in localStorage but user is signed in, store it
      localStorage.setItem('clerk-user-id', user.id);
      console.log('User authenticated, ID stored in localStorage:', user.id);
    }
    
    try {
      const response = await bookService.getMyRequests();
      if (response.success) {
        setRequests(response.data);
      } else {
        setError(response.message || 'Failed to fetch your book requests');
      }
    } catch (err: any) {
      console.error('Error fetching my requests:', err);
      setError(err.message || 'An error occurred while fetching your book requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!isSignedIn) {
      navigate('/sign-in', { state: { from: '/my-requests' } });
      return;
    }
    
    fetchMyRequests();
  }, [isLoaded, isSignedIn, navigate]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Filter requests based on status
  const pendingRequests = requests.filter(req => req.status === 'Pending');
  const acceptedRequests = requests.filter(req => req.status === 'Accepted');
  const pastRequests = requests.filter(req => ['Rejected', 'Cancelled', 'Completed'].includes(req.status));

  if (!isLoaded) {
    return <LoadingSpinner />;
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Book Requests
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Track the status of books you've requested to borrow from other users.
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            aria-label="my book requests tabs"
          >
            <Tab label={`Pending (${pendingRequests.length})`} />
            <Tab label={`Borrowed (${acceptedRequests.length})`} />
            <Tab label={`Past (${pastRequests.length})`} />
          </Tabs>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {tabValue === 0 && (
              <BookRequestsList 
                requests={pendingRequests}
                type="requester"
                onRequestUpdated={fetchMyRequests}
              />
            )}
            
            {tabValue === 1 && (
              <BookRequestsList 
                requests={acceptedRequests}
                type="requester"
                onRequestUpdated={fetchMyRequests}
              />
            )}
            
            {tabValue === 2 && (
              <BookRequestsList 
                requests={pastRequests}
                type="requester"
                onRequestUpdated={fetchMyRequests}
              />
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

export default MyRequestsPage; 