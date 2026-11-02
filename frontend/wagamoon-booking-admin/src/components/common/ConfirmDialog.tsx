import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog
      open={open}
      onClose={isLoading ? undefined : onCancel}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            padding: 1,
            maxWidth: 440,
            width: '100%',
          },
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, pt: 2 }}>
        {isDestructive ? (
          <Box
            sx={{
              backgroundColor: '#fee2e2',
              color: '#ef4444',
              borderRadius: '50%',
              p: 1,
              display: 'flex',
            }}
          >
            <DeleteForeverRoundedIcon />
          </Box>
        ) : (
          <Box
            sx={{
              backgroundColor: '#fef3c7',
              color: '#f59e0b',
              borderRadius: '50%',
              p: 1,
              display: 'flex',
            }}
          >
            <WarningAmberRoundedIcon />
          </Box>
        )}
        <DialogTitle sx={{ p: 0, fontWeight: 700, fontSize: '1.15rem' }}>
          {title}
        </DialogTitle>
      </Box>

      <DialogContent sx={{ px: 2, pt: 2, pb: 1 }}>
        <DialogContentText sx={{ color: 'text.secondary', fontSize: '0.95rem' }}>
          {message}
        </DialogContentText>
        {isDestructive && (
          <Typography
            variant="caption"
            sx={{ color: '#ef4444', fontWeight: 600, display: 'block', mt: 1 }}
          >
            This action cannot be undone.
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 2, pt: 1, gap: 1 }}>
        <Button
          onClick={onCancel}
          disabled={isLoading}
          variant="outlined"
          color="inherit"
          sx={{ borderColor: '#cbd5e1' }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isLoading}
          variant="contained"
          color={isDestructive ? 'error' : 'primary'}
          startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {isLoading ? 'Processing...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
