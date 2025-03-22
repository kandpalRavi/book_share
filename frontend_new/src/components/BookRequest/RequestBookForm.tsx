import React, { useState } from 'react';
import { bookService } from '../../services/apiService';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  Snackbar
} from '@mui/material';

interface RequestBookFormProps {
  bookId: string;
  bookTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const durations = [
  { value: 7, label: '1 week' },
  { value: 14, label: '2 weeks' },
  { value: 21, label: '3 weeks' },
  { value: 30, label: '1 month' }
];

const RequestBookForm: React.FC<RequestBookFormProps> = ({
  bookId,
  bookTitle,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [requestMessage, setRequestMessage] = useState('');
  const [requestDuration, setRequestDuration] = useState(14);
  const [requestType, setRequestType] = useState('Borrow');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await bookService.requestBook(bookId, {
        requestMessage,
        requestDuration,
        requestType
      });

      if (response.success) {
        setShowSuccessMessage(true);
        // Reset form
        setRequestMessage('');
        setRequestDuration(14);
        
        // Call the success callback after a delay to show success message
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        setError(response.message || 'Failed to submit request');
      }
    } catch (err) {
      setError('An error occurred while submitting your request');
      console.error('Request submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Request Book: {bookTitle}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Please provide details about your book request.
            </DialogContentText>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <TextField
              autoFocus
              label="Message to the owner"
              fullWidth
              multiline
              rows={4}
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              placeholder="Introduce yourself and explain why you're interested in borrowing this book..."
              margin="normal"
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="duration-select-label">Borrow Duration</InputLabel>
              <Select
                labelId="duration-select-label"
                value={requestDuration}
                label="Borrow Duration"
                onChange={(e) => setRequestDuration(Number(e.target.value))}
              >
                {durations.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                * The owner will review your request and has the option to accept or decline.
              </Typography>
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button 
              onClick={onClose} 
              color="inherit"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              color="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      
      <Snackbar
        open={showSuccessMessage}
        autoHideDuration={3000}
        onClose={() => setShowSuccessMessage(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success">
          Request submitted successfully!
        </Alert>
      </Snackbar>
    </>
  );
};

export default RequestBookForm; 