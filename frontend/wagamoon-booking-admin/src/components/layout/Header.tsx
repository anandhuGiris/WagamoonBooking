import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Button,
  Chip,
  Tooltip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import WebhookRoundedIcon from '@mui/icons-material/WebhookRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

interface HeaderProps {
  onDrawerToggle: () => void;
  title?: string;
  onOpenGoDaddyPreview?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onDrawerToggle,
  title = 'Wagamon Booking Admin',
  onOpenGoDaddyPreview,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        color: '#0f172a',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 }, minHeight: 68 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onDrawerToggle}
            sx={{ mr: 1, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
              {title}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
              Property Listing & WhatsApp Enquiry Management
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {onOpenGoDaddyPreview && (
            <Tooltip title="Preview how active properties look on your GoDaddy website">
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                startIcon={<WebhookRoundedIcon />}
                onClick={onOpenGoDaddyPreview}
                sx={{
                  display: { xs: 'none', sm: 'flex' },
                  borderColor: '#c7d2fe',
                  backgroundColor: '#eef2ff',
                  '&:hover': {
                    backgroundColor: '#e0e7ff',
                    borderColor: '#a5b4fc',
                  },
                }}
              >
                GoDaddy Preview
              </Button>
            </Tooltip>
          )}

          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<AddCircleOutlineRoundedIcon />}
            onClick={() => navigate('/properties/new')}
            sx={{ fontWeight: 700 }}
          >
            + Add Property
          </Button>

          <Chip
            label={user?.role || 'Admin'}
            size="small"
            sx={{
              backgroundColor: '#ccfbf1',
              color: '#0f766e',
              fontWeight: 700,
              display: { xs: 'none', md: 'inline-flex' },
            }}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
};
