import { Book as BaseBook, User } from './index';

// Add Review interface
export interface Review {
  user: User | string;
  rating: number;
  comment?: string;
  date: string;
}

// Extend the Book interface with reviews
export interface BookWithReviews extends BaseBook {
  reviews?: Review[];
} 