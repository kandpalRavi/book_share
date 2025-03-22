import React, { useState } from 'react';
import BookRequestModal from './BookRequestModal';
import './BookRequestButton.css';

interface BookRequestButtonProps {
  bookId: string;
  bookTitle: string;
  defaultDuration?: number;
  isDisabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const BookRequestButton: React.FC<BookRequestButtonProps> = ({
  bookId,
  bookTitle,
  defaultDuration = 14,
  isDisabled = false,
  variant = "primary",
  size = "md"
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  
  const getButtonClass = () => {
    let className = 'request-button';
    className += ` request-button-${variant}`;
    className += ` request-button-${size}`;
    return className;
  };
  
  return (
    <>
      <button
        className={getButtonClass()}
        onClick={openModal}
        disabled={isDisabled}
      >
        Request Book
      </button>
      
      {isModalOpen && (
        <BookRequestModal
          isOpen={isModalOpen}
          onClose={closeModal}
          bookId={bookId}
          bookTitle={bookTitle}
          defaultDuration={defaultDuration}
        />
      )}
    </>
  );
};

export default BookRequestButton; 