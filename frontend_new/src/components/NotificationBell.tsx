import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { bookService } from '../services/apiService';

interface Notification {
  _id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

const NotificationBell = () => {
  const { isSignedIn } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Fetch notifications
  useEffect(() => {
    if (!isSignedIn) return;
    
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        // Check if we're in development/demo mode
        const isDemoMode = !import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL === '';
        
        let response;
        
        if (isDemoMode) {
          // Generate mock notifications for demo
          await new Promise(resolve => setTimeout(resolve, 500));
          response = {
            success: true,
            data: generateMockNotifications(3)
          };
        } else {
          // Make actual API call
          try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/notifications`, {
              headers: {
                'x-clerk-user-id': localStorage.getItem('clerk-user-id') || '',
              }
            });
            const data = await res.json();
            response = data;
          } catch (error) {
            console.error('Error fetching notifications from API:', error);
            // Fallback to no notifications instead of mock data
            response = { success: true, data: [] };
          }
        }
        
        if (response.success) {
          setNotifications(response.data);
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
    
    // Poll for new notifications every 2 minutes instead of 30 seconds
    // to reduce notification spam
    const interval = setInterval(fetchNotifications, 120000);
    
    return () => clearInterval(interval);
  }, [isSignedIn]);
  
  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Generate mock notifications for development/demo mode
  const generateMockNotifications = (count: number): Notification[] => {
    const types = ['book_request', 'book_approved', 'book_returned'];
    const mockNotifications: Notification[] = [];
    
    // Add realistic user names
    const mockUsers = [
      { firstName: 'Emma', lastName: 'Johnson' },
      { firstName: 'Noah', lastName: 'Williams' },
      { firstName: 'Olivia', lastName: 'Smith' },
      { firstName: 'Liam', lastName: 'Brown' },
      { firstName: 'Sophia', lastName: 'Davis' },
      { firstName: 'James', lastName: 'Taylor' }
    ];
    
    // Add realistic book titles
    const mockBooks = [
      'The Silent Echo',
      'Midnight Horizons',
      'The Lost Symphony',
      'Beyond the Starlight',
      'Echoes of Tomorrow',
      'The Forgotten Garden'
    ];
    
    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const date = new Date();
      date.setMinutes(date.getMinutes() - Math.floor(Math.random() * 60));
      
      const user = mockUsers[i % mockUsers.length];
      const userName = `${user.firstName} ${user.lastName}`;
      const bookTitle = mockBooks[i % mockBooks.length];
      
      let message = '';
      let link = '';
      
      switch (type) {
        case 'book_request':
          message = `${userName} requested to borrow "${bookTitle}"`;
          link = '/my-books/requests';
          break;
        case 'book_approved':
          message = `Your request to borrow "${bookTitle}" was approved`;
          link = '/profile';
          break;
        case 'book_returned':
          message = `${userName} returned "${bookTitle}"`;
          link = '/my-books';
          break;
      }
      
      mockNotifications.push({
        _id: `mock-notification-${i}`,
        type,
        message,
        read: Math.random() > 0.7,
        createdAt: date.toISOString(),
        link
      });
    }
    
    return mockNotifications;
  };
  
  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const isDemoMode = !import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL === '';
      
      if (!isDemoMode) {
        // Make actual API call in non-demo mode
        await fetch(`${import.meta.env.VITE_API_URL}/notifications/${notificationId}/read`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-clerk-user-id': localStorage.getItem('clerk-user-id') || '',
          }
        });
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };
  
  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const isDemoMode = !import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL === '';
      
      if (!isDemoMode) {
        // Make actual API call in non-demo mode
        await fetch(`${import.meta.env.VITE_API_URL}/notifications/read-all`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-clerk-user-id': localStorage.getItem('clerk-user-id') || '',
          }
        });
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };
  
  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };
  
  if (!isSignedIn) {
    return null;
  }
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative p-1 text-gray-600 hover:text-gray-900 focus:outline-none"
        onClick={() => setShowDropdown(!showDropdown)}
        aria-label="Notifications"
      >
        <svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
          />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>
      
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20">
          <div className="py-2">
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Mark all as read
                </button>
              )}
            </div>
            
            {loading ? (
              <div className="px-4 py-6 text-center text-gray-500">
                <svg className="w-8 h-8 mx-auto animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {notifications.map(notification => (
                  <Link
                    key={notification._id}
                    to={notification.link || '#'}
                    className={`block px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition duration-150 ease-in-out ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => markAsRead(notification._id)}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        {notification.type === 'book_request' ? (
                          <span className="inline-block p-2 rounded-full bg-yellow-100 text-yellow-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </span>
                        ) : notification.type === 'book_approved' ? (
                          <span className="inline-block p-2 rounded-full bg-green-100 text-green-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        ) : (
                          <span className="inline-block p-2 rounded-full bg-blue-100 text-blue-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </span>
                        )}
                      </div>
                      <div className="ml-3 w-0 flex-1">
                        <p className="text-sm text-gray-900">{notification.message}</p>
                        <p className="mt-1 text-xs text-gray-500">{formatRelativeTime(notification.createdAt)}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-center">
              <div className="flex justify-between">
                <Link
                  to="/my-requests"
                  className="text-xs text-blue-600 hover:text-blue-800"
                  onClick={() => setShowDropdown(false)}
                >
                  View my requests
                </Link>
                <Link
                  to="/my-books/requests"
                  className="text-xs text-blue-600 hover:text-blue-800"
                  onClick={() => setShowDropdown(false)}
                >
                  View book requests
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 