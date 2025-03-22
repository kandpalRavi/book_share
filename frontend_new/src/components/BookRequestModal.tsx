import React, { useState } from 'react';
import { bookService } from '../services/apiService';
import { useUser } from '@clerk/clerk-react';
import './BookRequestModal.css';

interface BookRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  bookTitle: string;
  defaultDuration?: number;
}

const BookRequestModal: React.FC<BookRequestModalProps> = ({
  isOpen,
  onClose,
  bookId,
  bookTitle,
  defaultDuration = 14
}) => {
  const { user } = useUser();
  const [message, setMessage] = useState('');
  const [borrowDuration, setBorrowDuration] = useState(defaultDuration);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  if (!isOpen) return null;
  
  const handleSubmit = async () => {
    if (!user) {
      setErrorMessage('Authentication required. Please sign in to request a book.');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    try {
      const requestData = {
        requesterId: user.id,
        requestMessage: message,
        requestDuration: borrowDuration,
        requestType: 'Borrow'
      };
      
      const response = await bookService.requestBook(bookId, requestData);
      
      if (response.success) {
        setSuccessMessage(`Your request for "${bookTitle}" has been sent to the owner.`);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setErrorMessage(response.message || 'An error occurred. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting book request:', error);
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Request Book</h2>
          <button 
            className="close-button" 
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        
        <div className="modal-body">
          <div className="book-info">
            <strong>You are requesting:</strong>
            <p>{bookTitle}</p>
          </div>
          
          <div className="demo-notice">
            <strong>Demo Mode Notice</strong>
            <p>
              This is a demo feature. In a real application, your request would be sent to the book owner.
            </p>
          </div>
          
          {errorMessage && (
            <div className="error-message">
              {errorMessage}
            </div>
          )}
          
          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="message">Message to the owner</label>
            <textarea
              id="message"
              value={message}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
              placeholder="Introduce yourself and explain why you'd like to borrow this book..."
              rows={4}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="duration">Borrow duration (days)</label>
            <input
              id="duration"
              type="number"
              value={borrowDuration}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBorrowDuration(parseInt(e.target.value))}
              min={1}
              max={30}
            />
          </div>
        </div>
        
        <div className="modal-footer">
          <button 
            className="button button-secondary" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="button button-primary" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Send Request'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookRequestModal; 