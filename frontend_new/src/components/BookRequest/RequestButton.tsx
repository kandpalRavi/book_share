import React, { useState } from 'react';
import { Button } from '@mui/material';
import RequestBookForm from './RequestBookForm';

interface RequestButtonProps {
  bookId: string;
  bookTitle: string;
  isAvailable: boolean;
  isOwnBook?: boolean;
  onRequestSuccess?: () => void;
}

const RequestButton: React.FC<RequestButtonProps> = ({
  bookId,
  bookTitle,
  isAvailable,
  isOwnBook = false,
  onRequestSuccess
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleSuccess = () => {
    if (onRequestSuccess) {
      onRequestSuccess();
    }
  };

  // Don't show the button if it's the user's own book or if the book is not available
  if (isOwnBook || !isAvailable) {
    return null;
  }

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpenDialog}
        fullWidth
      >
        Request Book
      </Button>

      <RequestBookForm
        bookId={bookId}
        bookTitle={bookTitle}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSuccess={handleSuccess}
      />
    </>
  );
};

export default RequestButton; 