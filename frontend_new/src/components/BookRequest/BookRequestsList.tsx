import React, { useState } from 'react';
import { 
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Stack,
  Divider,
  Avatar,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert
} from '@mui/material';
import { bookService } from '../../services/apiService';
import { formatDistanceToNow } from 'date-fns';

// Define the structure of a book request
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

interface BookRequestsListProps {
  requests: BookRequest[];
  type: 'owner' | 'requester';
  onRequestUpdated: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending':
      return 'warning';
    case 'Accepted':
    case 'Approved':
      return 'success';
    case 'Rejected':
      return 'error';
    case 'Cancelled':
    case 'Canceled':
      return 'default';
    case 'Completed':
      return 'info';
    default:
      return 'default';
  }
};

const BookRequestsList: React.FC<BookRequestsListProps> = ({ 
  requests, 
  type,
  onRequestUpdated
}) => {
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<'approve' | 'reject' | 'cancel' | null>(null);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [alertMessage, setAlertMessage] = useState({ type: 'success', message: '' });
  const [alertOpen, setAlertOpen] = useState(false);

  // Function to open the confirmation dialog
  const openActionDialog = (requestId: string, action: 'approve' | 'reject' | 'cancel') => {
    setCurrentRequestId(requestId);
    setCurrentAction(action);
    setActionDialogOpen(true);
  };

  // Function to handle request actions
  const handleRequestAction = async () => {
    if (!currentRequestId || !currentAction) return;
    
    setIsProcessing(true);
    
    try {
      let response;
      
      if (currentAction === 'approve' || currentAction === 'reject') {
        response = await bookService.respondToRequest(currentRequestId, currentAction);
      } else if (currentAction === 'cancel') {
        response = await bookService.cancelRequest(currentRequestId);
      }
      
      if (response?.success) {
        setAlertMessage({ 
          type: 'success', 
          message: `Request ${
            currentAction === 'approve' ? 'approved' : 
            currentAction === 'reject' ? 'rejected' : 'cancelled'
          } successfully!` 
        });
        setAlertOpen(true);
        onRequestUpdated();
      } else {
        setAlertMessage({ 
          type: 'error', 
          message: response?.message || 'Failed to update request' 
        });
        setAlertOpen(true);
      }
    } catch (err) {
      console.error(`Error ${currentAction}ing request:`, err);
      setAlertMessage({ 
        type: 'error', 
        message: 'An error occurred while processing your request' 
      });
      setAlertOpen(true);
    } finally {
      setIsProcessing(false);
      setActionDialogOpen(false);
      setCurrentRequestId(null);
      setCurrentAction(null);
    }
  };

  if (requests.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          {type === 'owner' 
            ? 'No one has requested your books yet.'
            : 'You haven\'t requested any books yet.'
          }
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Stack spacing={3}>
        {requests.map((request) => (
          <Card key={request._id} sx={{ overflow: 'visible' }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={8}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Avatar 
                      src={type === 'owner' ? request.requester.profileImage : request.book.images?.[0]} 
                      alt={type === 'owner' ? `${request.requester.firstName} ${request.requester.lastName}` : request.book.title}
                    >
                      {type === 'owner' ? request.requester.firstName[0] : request.book.title[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        {type === 'owner' 
                          ? `${request.requester.firstName} ${request.requester.lastName}` 
                          : request.book.title
                        }
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {type === 'owner' 
                          ? `Requesting: ${request.book.title}` 
                          : `Owner: ${request.owner.firstName} ${request.owner.lastName}`
                        }
                      </Typography>
                    </Box>
                  </Stack>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <Typography variant="body2" paragraph>
                    <strong>Message:</strong> {request.requestMessage || 'No message provided'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Duration:</strong> {request.requestDuration} days
                  </Typography>
                  <Typography variant="body2">
                    <strong>Requested:</strong> {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                    <Chip 
                      label={request.status} 
                      color={getStatusColor(request.status) as any}
                      sx={{ alignSelf: 'flex-end', mb: 2 }}
                    />
                    
                    {request.status === 'Pending' && (
                      <Stack spacing={1} sx={{ mt: 'auto' }}>
                        {type === 'owner' && (
                          <>
                            <Button 
                              variant="contained" 
                              color="success" 
                              onClick={() => openActionDialog(request._id, 'approve')}
                            >
                              Approve
                            </Button>
                            <Button 
                              variant="outlined" 
                              color="error"
                              onClick={() => openActionDialog(request._id, 'reject')}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        
                        {type === 'requester' && (
                          <Button 
                            variant="outlined" 
                            color="error"
                            onClick={() => openActionDialog(request._id, 'cancel')}
                          >
                            Cancel Request
                          </Button>
                        )}
                      </Stack>
                    )}
                    
                    {(request.status === 'Accepted' || request.status === 'Approved') && type === 'owner' && (
                      <Button 
                        variant="contained" 
                        color="primary"
                        onClick={() => {
                          // Implement mark as completed/returned functionality
                          console.log('Mark as returned');
                        }}
                      >
                        Mark as Returned
                      </Button>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Confirmation Dialog */}
      <Dialog
        open={actionDialogOpen}
        onClose={() => setActionDialogOpen(false)}
      >
        <DialogTitle>
          {currentAction === 'approve' && 'Approve Book Request'}
          {currentAction === 'reject' && 'Reject Book Request'}
          {currentAction === 'cancel' && 'Cancel Book Request'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {currentAction === 'approve' && 'Are you sure you want to approve this request? The book will be marked as borrowed.'}
            {currentAction === 'reject' && 'Are you sure you want to reject this request?'}
            {currentAction === 'cancel' && 'Are you sure you want to cancel your request?'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setActionDialogOpen(false)} 
            color="inherit"
            disabled={isProcessing}
          >
            No
          </Button>
          <Button 
            onClick={handleRequestAction} 
            color={currentAction === 'approve' ? 'success' : 'primary'}
            variant="contained"
            disabled={isProcessing}
            autoFocus
          >
            {isProcessing ? 'Processing...' : 'Yes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alert Snackbar */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={() => setAlertOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setAlertOpen(false)} 
          severity={alertMessage.type === 'success' ? 'success' : 'error'}
        >
          {alertMessage.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default BookRequestsList;