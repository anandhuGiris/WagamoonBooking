import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import VillaRoundedIcon from '@mui/icons-material/VillaRounded';
import SpaRoundedIcon from '@mui/icons-material/SpaRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import LandscapeRoundedIcon from '@mui/icons-material/LandscapeRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import { useAuth } from '../../auth/AuthContext';

export const DRAWER_WIDTH = 260;

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menuItems = [
    { text: 'Dashboard', path: '/dashboard', icon: <DashboardRoundedIcon /> },
    { text: 'Properties', path: '/properties', icon: <VillaRoundedIcon /> },
    { text: 'Stay Categories', path: '/categories', icon: <CategoryRoundedIcon /> },
    { text: 'Activities', path: '/activities', icon: <ExploreRoundedIcon /> },
    { text: 'Facilities', path: '/facilities', icon: <SpaRoundedIcon /> },
    { text: 'Admins', path: '/admins', icon: <AdminPanelSettingsRoundedIcon /> },
  ];

  const handleNav = (path: string) => {
    navigate(path);
    if (mobileOpen) {
      onClose();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
      }}
    >
      {/* Brand Header */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2.5,
            background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(13, 148, 136, 0.4)',
          }}
        >
          <LandscapeRoundedIcon sx={{ color: '#ffffff', fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1, color: '#ffffff' }}>
            Wagamon
          </Typography>
          <Typography variant="caption" sx={{ color: '#0d9488', fontWeight: 700, letterSpacing: '0.05em' }}>
            BOOKING ADMIN
          </Typography>
        </Box>
      </Box>

      {/* Main Navigation */}
      <Box sx={{ flexGrow: 1, py: 2, px: 2 }}>
        <Typography
          variant="caption"
          sx={{
            px: 1.5,
            color: '#64748b',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            display: 'block',
            mb: 1,
          }}
        >
          Navigation
        </Typography>
        <List sx={{ p: 0 }}>
          {menuItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.75 }}>
                <ListItemButton
                  onClick={() => handleNav(item.path)}
                  sx={{
                    borderRadius: 2.5,
                    py: 1.2,
                    px: 2,
                    backgroundColor: isActive ? 'rgba(13, 148, 136, 0.18)' : 'transparent',
                    color: isActive ? '#14b8a6' : '#94a3b8',
                    border: isActive ? '1px solid rgba(20, 184, 166, 0.3)' : '1px solid transparent',
                    '&:hover': {
                      backgroundColor: isActive ? 'rgba(13, 148, 136, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                      color: isActive ? '#2dd4bf' : '#ffffff',
                    },
                    transition: 'all 0.15s ease',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? '#14b8a6' : '#64748b',
                      minWidth: 38,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography sx={{ fontWeight: isActive ? 700 : 500, fontSize: '0.925rem' }}>
                        {item.text}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Footer / User Profile & Logout */}
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
          <Avatar
            sx={{
              width: 38,
              height: 38,
              bgcolor: '#0d9488',
              fontSize: '0.95rem',
              fontWeight: 700,
            }}
          >
            {user?.name?.charAt(0) || 'A'}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
            >
              {user?.name || 'Administrator'}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: '#94a3b8', display: 'block', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
            >
              {user?.email || 'admin@example.com'}
            </Typography>
          </Box>
        </Box>

        <Tooltip title="Log Out">
          <IconButton
            onClick={handleLogout}
            size="small"
            sx={{
              color: '#94a3b8',
              '&:hover': {
                color: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
              },
            }}
          >
            <LogoutRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, border: 'none' },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Persistent Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, border: 'none' },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
};
