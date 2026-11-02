import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No properties found',
  description = 'No properties match your current filters or none have been added yet.',
  actionText,
  onAction,
  icon,
}) => {
  return (
    <Box
      sx={{
        py: 8,
        px: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        borderRadius: 3,
        backgroundColor: '#f8fafc',
        border: '2px dashed #e2e8f0',
        my: 2,
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          backgroundColor: '#e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748b',
          mb: 2,
        }}
      >
        {icon || <HomeWorkOutlinedIcon sx={{ fontSize: 32 }} />}
      </Box>

      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
        {title}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420, mb: actionText ? 2.5 : 0 }}>
        {description}
      </Typography>

      {actionText && onAction && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddCircleOutlineRoundedIcon />}
          onClick={onAction}
          sx={{ mt: 1 }}
        >
          {actionText}
        </Button>
      )}
    </Box>
  );
};
