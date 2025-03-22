// Book types
export interface Book {
  _id: string;
  title: string;
  author: string;
  description: string;
  genre: string[];
  language: string;
  condition: 'New' | 'Like New' | 'Good' | 'Fair' | 'Poor';
  images: string[];
  owner: User | string;
  currentBorrower: User | string | null;
  status: 'Available' | 'Borrowed' | 'Reserved';
  location: string;
  isExchangeable: boolean;
  isDonation: boolean;
  borrowDuration: number;
  borrowHistory: BorrowHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface BorrowHistory {
  borrower: User | string;
  borrowDate: string;
  returnDate: string | null;
  rating: number | null;
  review: string | null;
}

// User types
export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  location?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

// Book request types
export interface BookRequest {
  _id: string;
  book: Book | string;
  requester: User | string;
  owner: User | string;
  status: 'Pending' | 'Accepted' | 'Approved' | 'Rejected' | 'Completed' | 'Cancelled' | 'Canceled';
  requestDate: string;
  responseDate?: string;
  borrowDuration: number;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

// Message types
export interface Message {
  _id: string;
  sender: User | string;
  receiver: User | string;
  content: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    totalItems: number;
    currentPage: number;
    totalPages: number;
  };
  message?: string;
} 