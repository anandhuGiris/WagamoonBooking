import React from 'react';
import { Box, CircularProgress, Typography, Skeleton } from '@mui/material';

interface LoadingStateProps {
  message?: string;
  variant?: 'spinner' | 'skeleton';
  rows?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading properties...',
  variant = 'spinner',
  rows = 4,
}) => {
  if (variant === 'skeleton') {
    return (
      <Box sx={{ width: '100%', py: 2 }}>
        {Array.from(new Array(rows)).map((_, i) => (
          <Skeleton
            key={i}
            variant="rounded"
            height={60}
            sx={{ mb: 1.5, borderRadius: 2 }}
          />
        ))}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        py: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <CircularProgress size={40} thickness={4} sx={{ color: '#0d9488' }} />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};
