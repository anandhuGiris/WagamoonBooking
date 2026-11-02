import React, { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Sidebar, DRAWER_WIDTH } from './Sidebar';
import { Header } from './Header';
import { GoDaddyPreviewModal } from '../properties/GoDaddyPreviewModal';

interface AdminLayoutProps {
  title?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ title }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [goDaddyModalOpen, setGoDaddyModalOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Header
          onDrawerToggle={handleDrawerToggle}
          title={title}
          onOpenGoDaddyPreview={() => setGoDaddyModalOpen(true)}
        />

        <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 4 } }}>
          <Outlet />
        </Box>
      </Box>

      <GoDaddyPreviewModal
        open={goDaddyModalOpen}
        onClose={() => setGoDaddyModalOpen(false)}
      />
    </Box>
  );
};
