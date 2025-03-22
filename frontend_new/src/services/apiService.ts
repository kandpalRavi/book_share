import axios, { InternalAxiosRequestConfig } from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Include Clerk user ID in header if available from localStorage or window.Clerk
    const clerkUserId = localStorage.getItem('clerk-user-id');
    if (clerkUserId && config.headers) {
      config.headers['x-clerk-user-id'] = clerkUserId;
      // Log the headers for debugging
      console.log('Request headers:', config.headers);
    } else {
      console.warn('No clerk-user-id found in localStorage');
    }
    
    // Include authentication token if available
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('API Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
        config: {
          url: error.response.config.url,
          method: error.response.config.method,
          headers: error.response.config.headers
        }
      });
    }
    return Promise.reject(error);
  }
);

// Book services
export const bookService = {
  getAllBooks: async (params = {}) => {
    try {
      const response = await api.get('/books', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching books:', error);
      throw error;
    }
  },

  getBookById: async (bookId: string) => {
    try {
      const response = await api.get(`/books/${bookId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching book ${bookId}:`, error);
      throw error;
    }
  },

  createBook: async (bookData: FormData) => {
    try {
      console.log('API URL:', import.meta.env.VITE_API_URL);
      console.log('Creating book with FormData containing fields:', 
        Array.from(bookData.entries()).map(([key, value]) => `${key}: ${typeof value === 'string' ? value : 'File'}`));
      
      const response = await api.post('/books', bookData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Book creation response:', response);
      
      // Check if the response has the expected structure and return the book data
      if (response.status === 201 || response.status === 200) {
        // Return the data directly, which should be the book object
        return response.data;
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error creating book:', error);
      throw error;
    }
  },

  updateBook: async (bookId: string, bookData: FormData) => {
    try {
      const response = await api.put(`/books/${bookId}`, bookData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating book ${bookId}:`, error);
      throw error;
    }
  },

  deleteBook: async (bookId: string) => {
    try {
      const response = await api.delete(`/books/${bookId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting book ${bookId}:`, error);
      throw error;
    }
  },

  returnBook: async (bookId: string, borrowerId: string) => {
    try {
      const response = await api.post(`/books/${bookId}/return`, { borrowerId });
      return response.data;
    } catch (error) {
      console.error(`Error returning book ${bookId}:`, error);
      throw error;
    }
  },

  requestBook: async (bookId: string, requestData: any) => {
    const isDemoMode = !import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL === '';
    
    try {
      if (isDemoMode) {
        // Simulate successful response in demo mode
        console.log('Demo mode: Simulating book request', { bookId, requestData });
        return {
          success: true,
          data: {
            _id: `mock-request-${Date.now()}`,
            book: bookId,
            requester: requestData.requesterId || 'current-user',
            status: 'Pending',
            requestMessage: requestData.requestMessage,
            requestDuration: requestData.requestDuration || 14,
            requestDate: new Date().toISOString(),
            requestType: 'Borrow' // Capital B to match backend enum
          },
          message: 'Book request submitted successfully (Demo Mode)'
        };
      }
      
      // Log the exact data being sent for debugging
      console.log('Sending book request with data:', {
        ...requestData,
        bookId,
        requestType: 'Borrow'
      });
      
      // Check if authentication headers are available
      const clerkUserId = localStorage.getItem('clerk-user-id');
      const token = localStorage.getItem('authToken');
      console.log('Authentication info:', { 
        hasClerkUserId: !!clerkUserId, 
        clerkUserId: clerkUserId, // Log the actual ID for debugging
        hasToken: !!token 
      });
      
      // Use correct endpoint path for book requests
      const requestPayload = {
        ...requestData,
        bookId,
        requestType: 'Borrow' // Capital B to match backend enum
      };
      
      console.log('Final request payload:', requestPayload);
      
      const response = await api.post(`/book-requests`, requestPayload);
      return response.data;
    } catch (error) {
      console.error(`Error requesting book ${bookId}:`, error);
      
      // Enhanced error logging
      if (axios.isAxiosError(error) && error.response) {
        console.error('Server response:', error.response.status, error.response.data);
        
        // Return detailed error message to the user
        return {
          success: false,
          message: error.response.data?.message || `Server error: ${error.response.status}`
        };
      }
      
      return {
        success: false,
        message: error instanceof Error ? error.message : `Failed to request book ${bookId}`
      };
    }
  },

  submitReview: async (bookId: string, reviewData: any) => {
    try {
      const response = await api.post(`/books/${bookId}/reviews`, reviewData);
      return response.data;
    } catch (error) {
      console.error(`Error submitting review for book ${bookId}:`, error);
      throw error;
    }
  },

  // Get all book requests for the current user's books
  getBookRequests: async () => {
    const isDemoMode = !import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL === '';
    
    try {
      if (isDemoMode) {
        // Return mock data in demo mode
        return {
          success: true,
          data: [] // The mock data is generated in the BookRequestsPage component
        };
      }
      
      // Use axios instance with the correct path
      const response = await api.get('/book-requests/owner');
      return response.data;
    } catch (error) {
      console.error('Error fetching book requests:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch book requests'
      };
    }
  },
  
  // Get all book requests made by the current user
  getMyRequests: async () => {
    const isDemoMode = !import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL === '';
    
    try {
      if (isDemoMode) {
        // Return mock data in demo mode
        return {
          success: true,
          data: [] // The mock data is generated in the MyRequestsPage component
        };
      }
      
      // Use axios instance instead of direct fetch
      const response = await api.get('/book-requests/requester');
      return response.data;
    } catch (error) {
      console.error('Error fetching my book requests:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch your book requests'
      };
    }
  },
  
  // Cancel a book request
  cancelRequest: async (requestId: string) => {
    const isDemoMode = !import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL === '';
    
    try {
      if (isDemoMode) {
        // Simulate successful response in demo mode
        return {
          success: true
        };
      }
      
      // Use axios instance with the correct path
      const response = await api.put(`/book-requests/${requestId}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Error canceling book request:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to cancel book request'
      };
    }
  },

  // Respond to a book request (approve or reject)
  respondToRequest: async (requestId: string, action: 'approve' | 'reject') => {
    const isDemoMode = !import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL === '';
    
    try {
      if (isDemoMode) {
        // Simulate successful response in demo mode
        return {
          success: true
        };
      }
      
      // Use axios instance with the correct path
      const response = await api.put(`/book-requests/${requestId}/${action}`);
      return response.data;
    } catch (error) {
      console.error(`Error ${action}ing book request:`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : `Failed to ${action} book request`
      };
    }
  },
}

// User services
export const userService = {
  getUserProfile: async (clerkId?: string) => {
    try {
      const params = clerkId ? { clerkId } : {};
      const response = await api.get('/users/profile', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  getWishlist: async (userId: string) => {
    try {
      const response = await api.get(`/users/${userId}/wishlist`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching wishlist for user ${userId}:`, error);
      throw error;
    }
  },

  addToWishlist: async (bookId: string) => {
    try {
      const response = await api.post('/users/wishlist/add', { bookId });
      return response.data;
    } catch (error) {
      console.error(`Error adding book ${bookId} to wishlist:`, error);
      throw error;
    }
  },

  removeFromWishlist: async (bookId: string) => {
    try {
      const response = await api.post('/users/wishlist/remove', { bookId });
      return response.data;
    } catch (error) {
      console.error(`Error removing book ${bookId} from wishlist:`, error);
      throw error;
    }
  }
};

export default api;