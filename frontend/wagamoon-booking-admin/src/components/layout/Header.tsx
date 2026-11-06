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
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

interface HeaderProps {
  onDrawerToggle: () => void;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onDrawerToggle,
  title = 'Wagamon Booking Admin',
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const publicWebsiteUrl = import.meta.env.VITE_PUBLIC_WEBSITE_URL || 'https://wagamoonbooking.com';

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
          <Tooltip title="Open customer-facing public website">
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              startIcon={<LaunchRoundedIcon />}
              component="a"
              href={publicWebsiteUrl}
              target="_blank"
              rel="noopener noreferrer"
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
              View Website
            </Button>
          </Tooltip>

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
