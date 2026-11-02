import React from 'react';
import { Alert, AlertTitle, Button, Box } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'An unexpected error occurred while loading data.',
  onRetry,
}) => {
  return (
    <Box sx={{ my: 3 }}>
      <Alert
        severity="error"
        action={
          onRetry ? (
            <Button
              color="inherit"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={onRetry}
            >
              Retry
            </Button>
          ) : undefined
        }
        sx={{ borderRadius: 3 }}
      >
        <AlertTitle sx={{ fontWeight: 700 }}>Operation Failed</AlertTitle>
        {message}
      </Alert>
    </Box>
  );
};
