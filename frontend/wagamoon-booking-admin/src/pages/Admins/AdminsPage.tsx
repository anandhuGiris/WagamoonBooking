import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Tooltip,
  Avatar,
  InputAdornment,
  Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { userApi } from '../../api/userApi';
import { AdminUser, CreateAdminRequest } from '../../types/User';
import { useAuth } from '../../auth/AuthContext';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const AdminsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Quick Add Admin Modal State
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Status Toggle Loading
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userApi.getAdmins();
      if (response.success && response.data) {
        setAdmins(response.data);
      } else {
        setError(response.message || 'Failed to load administrator accounts.');
      }
    } catch {
      setError('Could not connect to the backend server.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddDialog = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setDialogError(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (isSaving) return;
    setDialogOpen(false);
  };

  const handleSaveAdmin = async () => {
    if (!name.trim()) {
      setDialogError('Administrator full name is required.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setDialogError('A valid email address is required.');
      return;
    }
    if (!password || password.length < 6) {
      setDialogError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setDialogError('Passwords do not match.');
      return;
    }

    setIsSaving(true);
    setDialogError(null);

    const payload: CreateAdminRequest = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: 'Admin',
    };

    try {
      const response = await userApi.createAdmin(payload);
      if (response.success && response.data) {
        setSnackbar({
          open: true,
          message: `Administrator "${payload.name}" added successfully.`,
          severity: 'success',
        });
        setDialogOpen(false);
        await loadAdmins();
      } else {
        setDialogError(response.message || 'Failed to create administrator account.');
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || 'Server error while creating administrator.';
      setDialogError(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (admin: AdminUser) => {
    if (admin.id === currentUser?.id || admin.email.toLowerCase() === currentUser?.email?.toLowerCase()) {
      setSnackbar({
        open: true,
        message: 'You cannot deactivate your own administrative account.',
        severity: 'error',
      });
      return;
    }

    setTogglingId(admin.id);
    try {
      const response = await userApi.toggleStatus(admin.id);
      if (response.success) {
        setSnackbar({
          open: true,
          message: response.message || 'Administrator status updated successfully.',
          severity: 'success',
        });
        await loadAdmins();
      } else {
        setSnackbar({
          open: true,
          message: response.message || 'Failed to update administrator status.',
          severity: 'error',
        });
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to update status.';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.id === currentUser?.id || deleteTarget.email.toLowerCase() === currentUser?.email?.toLowerCase()) {
      setSnackbar({
        open: true,
        message: 'You cannot delete your own administrative account.',
        severity: 'error',
      });
      setDeleteTarget(null);
      return;
    }

    setIsDeleting(true);
    try {
      const response = await userApi.deleteAdmin(deleteTarget.id);
      if (response.success) {
        setSnackbar({
          open: true,
          message: `Administrator "${deleteTarget.name}" deleted successfully.`,
          severity: 'success',
        });
        setDeleteTarget(null);
        await loadAdmins();
      } else {
        setSnackbar({
          open: true,
          message: response.message || 'Failed to delete administrator account.',
          severity: 'error',
        });
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Server error while deleting administrator.';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredAdmins = admins.filter((a) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q);
  });

  const activeCount = admins.filter((a) => a.isActive).length;

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'AD';
  };

  const getAvatarBg = (emailStr: string) => {
    const colors = ['#0f766e', '#1e40af', '#6b21a8', '#b45309', '#0369a1', '#15803d'];
    let hash = 0;
    for (let i = 0; i < emailStr.length; i++) {
      hash = emailStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  if (loading) {
    return <LoadingState message="Loading administrator accounts..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadAdmins} />;
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Page Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <AdminPanelSettingsRoundedIcon sx={{ fontSize: 30, color: '#0f766e' }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
              Administrator Accounts
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Manage system administrators with access to the Wagamon Booking portal.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<PersonAddAlt1RoundedIcon />}
            onClick={() => navigate('/admins/new')}
            sx={{
              borderColor: '#0f766e',
              color: '#0f766e',
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 2,
              '&:hover': {
                borderColor: '#0d9488',
                backgroundColor: 'rgba(15, 118, 110, 0.04)',
              },
            }}
          >
            Add via Dedicated Page
          </Button>

          <Button
            variant="contained"
            startIcon={<AddCircleOutlineRoundedIcon />}
            onClick={handleOpenAddDialog}
            sx={{
              backgroundColor: '#0f766e',
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(15, 118, 110, 0.25)',
              '&:hover': {
                backgroundColor: '#0d9488',
              },
            }}
          >
            Quick Add Admin
          </Button>
        </Box>
      </Box>

      {/* KPI Overview Strip */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                Total Administrators
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
                {admins.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                Active Accounts
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#16a34a', mt: 0.5 }}>
                {activeCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                Logged In As
              </Typography>
              <Typography variant="h6" noWrap sx={{ fontWeight: 800, color: '#0f766e', mt: 0.5 }}>
                {currentUser?.name || currentUser?.email || 'Administrator'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Table & Filter Card */}
      <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <CardContent sx={{ p: 2.5 }}>
          {/* Search Bar */}
          <Box sx={{ mb: 2.5, maxWidth: 360 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#f8fafc',
                },
              }}
            />
          </Box>

          {/* Administrators Table */}
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ '& th': { fontWeight: 700, color: '#475569', backgroundColor: '#f8fafc' } }}>
                  <TableCell>Administrator</TableCell>
                  <TableCell>Email Address</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAdmins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
                        {searchQuery ? 'No administrators match your search criteria.' : 'No administrators found.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAdmins.map((admin) => {
                    const isSelf =
                      admin.id === currentUser?.id ||
                      admin.email.toLowerCase() === currentUser?.email?.toLowerCase();

                    return (
                      <TableRow
                        key={admin.id}
                        hover
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                          backgroundColor: isSelf ? 'rgba(15, 118, 110, 0.02)' : 'inherit',
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar
                              sx={{
                                width: 38,
                                height: 38,
                                bgcolor: getAvatarBg(admin.email),
                                fontSize: '0.88rem',
                                fontWeight: 700,
                              }}
                            >
                              {getInitials(admin.name)}
                            </Avatar>
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                                  {admin.name}
                                </Typography>
                                {isSelf && (
                                  <Chip
                                    label="You"
                                    size="small"
                                    sx={{
                                      height: 18,
                                      fontSize: '0.65rem',
                                      fontWeight: 800,
                                      backgroundColor: '#0f766e',
                                      color: '#ffffff',
                                    }}
                                  />
                                )}
                              </Box>
                            </Box>
                          </Box>
                        </TableCell>

                        <TableCell sx={{ color: '#334155', fontWeight: 500 }}>
                          {admin.email}
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={admin.role || 'Admin'}
                            size="small"
                            sx={{
                              backgroundColor: '#e0e7ff',
                              color: '#3730a3',
                              fontWeight: 700,
                              borderRadius: 1.5,
                              fontSize: '0.75rem',
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <Chip
                            icon={
                              admin.isActive ? (
                                <CheckCircleRoundedIcon sx={{ fontSize: '14px !important', color: '#16a34a !important' }} />
                              ) : (
                                <CancelRoundedIcon sx={{ fontSize: '14px !important', color: '#dc2626 !important' }} />
                              )
                            }
                            label={admin.isActive ? 'Active' : 'Inactive'}
                            size="small"
                            sx={{
                              backgroundColor: admin.isActive ? '#f0fdf4' : '#fef2f2',
                              color: admin.isActive ? '#16a34a' : '#dc2626',
                              fontWeight: 700,
                              border: `1px solid ${admin.isActive ? '#bbf7d0' : '#fecaca'}`,
                              borderRadius: 1.5,
                            }}
                          />
                        </TableCell>

                        <TableCell sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                          {new Date(admin.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </TableCell>

                        <TableCell align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                            <Tooltip title={isSelf ? 'Cannot deactivate your own account' : admin.isActive ? 'Deactivate Account' : 'Activate Account'}>
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={() => handleToggleStatus(admin)}
                                  disabled={isSelf || togglingId === admin.id}
                                  sx={{
                                    color: admin.isActive ? '#eab308' : '#16a34a',
                                    '&:hover': {
                                      backgroundColor: admin.isActive ? 'rgba(234, 179, 8, 0.1)' : 'rgba(22, 163, 74, 0.1)',
                                    },
                                  }}
                                >
                                  {admin.isActive ? <CancelRoundedIcon fontSize="small" /> : <CheckCircleRoundedIcon fontSize="small" />}
                                </IconButton>
                              </span>
                            </Tooltip>

                            <Tooltip title={isSelf ? 'Cannot delete your own account' : 'Delete Account'}>
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={() => setDeleteTarget(admin)}
                                  disabled={isSelf}
                                  sx={{
                                    color: '#ef4444',
                                    '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
                                  }}
                                >
                                  <DeleteOutlineRoundedIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Quick Add Admin Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: 3, p: 1 },
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <PersonAddAlt1RoundedIcon sx={{ color: '#0f766e', fontSize: 26 }} />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Add New Administrator
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Create an administrator account with access to manage properties and bookings.
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '16px !important' }}>
          {dialogError && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {dialogError}
            </Alert>
          )}

          <TextField
            label="Full Name *"
            fullWidth
            placeholder="e.g. Anandhu Girish"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSaving}
          />

          <TextField
            label="Email Address *"
            type="email"
            fullWidth
            placeholder="admin@wagamoonbooking.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSaving}
          />

          <TextField
            label="Password *"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            placeholder="Minimum 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSaving}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            label="Confirm Password *"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            placeholder="Repeat password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isSaving}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
          <Button
            onClick={handleCloseDialog}
            disabled={isSaving}
            sx={{ color: '#64748b', fontWeight: 600, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveAdmin}
            variant="contained"
            disabled={isSaving}
            sx={{
              backgroundColor: '#0f766e',
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
              '&:hover': { backgroundColor: '#0d9488' },
            }}
          >
            {isSaving ? 'Creating Account...' : 'Create Admin'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Administrator"
        message={`Are you sure you want to permanently delete administrator account "${deleteTarget?.name}" (${deleteTarget?.email})? This user will immediately lose all system access.`}
        confirmText="Delete Administrator"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Notification Toast */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ borderRadius: 2, fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
