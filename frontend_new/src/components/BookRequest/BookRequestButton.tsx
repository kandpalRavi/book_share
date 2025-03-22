import React, { useState } from 'react';
import { 
  Button, 
  Typography, 
  Box, 
  Tooltip
} from '@mui/material';
import RequestBookForm from './RequestBookForm';

interface BookRequestButtonProps {
  bookId: string;
  bookTitle: string;
  bookStatus: string;
  isOwnedByCurrentUser: boolean;
  onRequestSuccess?: () => void;
}

const BookRequestButton: React.FC<BookRequestButtonProps> = ({
  bookId,
  bookTitle,
  bookStatus,
  isOwnedByCurrentUser,
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

  // Don't render anything if it's the user's own book
  if (isOwnedByCurrentUser) {
    return null;
  }

  // Render the button differently based on book status
  if (bookStatus !== 'Available') {
    return (
      <Box sx={{ mt: 2 }}>
        <Tooltip title="This book is currently not available for borrowing">
          <span>
            <Button
              variant="contained"
              color="primary"
              disabled
              fullWidth
            >
              {bookStatus === 'Borrowed' ? 'Currently Borrowed' : 'Not Available'}
            </Button>
          </span>
        </Tooltip>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          This book is {bookStatus.toLowerCase()}. Check back later when it becomes available.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpenDialog}
        fullWidth
      >
        Request This Book
      </Button>

      <RequestBookForm
        bookId={bookId}
        bookTitle={bookTitle}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSuccess={handleSuccess}
      />
    </Box>
  );
};

export default BookRequestButton; 