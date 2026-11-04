import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme/theme';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { AdminLayout } from './components/layout/AdminLayout';

// Pages
import { LoginPage } from './pages/Login/LoginPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { PropertiesPage } from './pages/Properties/PropertiesPage';
import { AddPropertyPage } from './pages/Properties/AddPropertyPage';
import { EditPropertyPage } from './pages/Properties/EditPropertyPage';
import { FacilitiesPage } from './pages/Facilities/FacilitiesPage';
import { CategoriesPage } from './pages/Categories/CategoriesPage';
import { ActivitiesPage } from './pages/Activities/ActivitiesPage';
import { AddActivityPage } from './pages/Activities/AddActivityPage';
import { EditActivityPage } from './pages/Activities/EditActivityPage';
import { AdminsPage } from './pages/Admins/AdminsPage';
import { AddAdminPage } from './pages/Admins/AddAdminPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Admin Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="properties" element={<PropertiesPage />} />
              <Route path="properties/new" element={<AddPropertyPage />} />
              <Route path="properties/:id/edit" element={<EditPropertyPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="activities" element={<ActivitiesPage />} />
              <Route path="activities/new" element={<AddActivityPage />} />
              <Route path="activities/:id/edit" element={<EditActivityPage />} />
              <Route path="facilities" element={<FacilitiesPage />} />
              <Route path="admins" element={<AdminsPage />} />
              <Route path="admins/new" element={<AddAdminPage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
