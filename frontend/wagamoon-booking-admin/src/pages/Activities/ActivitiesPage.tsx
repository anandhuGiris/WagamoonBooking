import React, { useEffect, useState, useCallback } from 'react';
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
  TextField,
  InputAdornment,
  TablePagination,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import { useNavigate } from 'react-router-dom';
import { activityApi } from '../../api/activityApi';
import { Activity } from '../../types/Activity';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const ActivitiesPage: React.FC = () => {
  const navigate = useNavigate();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<Activity | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const loadActivities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await activityApi.getActivities({
        page: page + 1,
        pageSize,
        search: search.trim() || undefined,
      });

      if (response.success && response.data) {
        setActivities(response.data.items);
        setTotalCount(response.data.totalCount);
      } else {
        setError('Failed to load activities.');
      }
    } catch {
      setError('Could not connect to the backend server.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const handleToggleStatus = async (activity: Activity) => {
    try {
      const res = await activityApi.toggleActivityStatus(activity.id);
      if (res.success) {
        setSnackbar({
          open: true,
          message: `Activity ${res.data?.isActive ? 'activated' : 'deactivated'} successfully.`,
          severity: 'success',
        });
        loadActivities();
      } else {
        setSnackbar({ open: true, message: res.message || 'Failed to toggle status.', severity: 'error' });
      }
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to toggle status.',
        severity: 'error',
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const res = await activityApi.deleteActivity(deleteTarget.id);
      if (res.success) {
        setSnackbar({ open: true, message: 'Activity deleted successfully.', severity: 'success' });
        loadActivities();
      } else {
        setSnackbar({ open: true, message: res.message || 'Failed to delete activity.', severity: 'error' });
      }
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to delete activity.',
        severity: 'error',
      });
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 4,
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ExploreRoundedIcon sx={{ color: '#0d9488', fontSize: 32 }} />
            Adventure Activities
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Manage adventure tours, treks, safaris, and outdoor experiences showcased on the public website.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddCircleOutlineRoundedIcon />}
          onClick={() => navigate('/activities/new')}
          sx={{
            backgroundColor: '#0d9488',
            '&:hover': { backgroundColor: '#0f766e' },
            borderRadius: 2.5,
            px: 3,
            py: 1,
            fontWeight: 700,
          }}
        >
          Add Activity
        </Button>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 3, borderRadius: 2.5, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
        <CardContent sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder="Search activities by name or location..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
              },
            }}
            size="small"
          />
        </CardContent>
      </Card>

      {/* Content */}
      {loading ? (
        <LoadingState message="Loading adventure activities..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadActivities} />
      ) : (
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table sx={{ minWidth: 700 }}>
                <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ width: 100 }}>Image</TableCell>
                    <TableCell>Activity</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>Status</TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6, color: '#94a3b8' }}>
                        No adventure activities found. Click "Add Activity" to create one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    activities.map((act) => {
                      const hasImage = !!act.primaryImageUrl;

                      return (
                        <TableRow key={act.id} hover>
                          {/* Image */}
                          <TableCell>
                            <Box
                              onClick={() => navigate(`/activities/${act.id}/edit`)}
                              sx={{
                                width: 76,
                                height: 54,
                                borderRadius: 2,
                                backgroundColor: '#f1f5f9',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid #e2e8f0',
                              }}
                            >
                              {hasImage ? (
                                <Box
                                  component="img"
                                  src={act.primaryImageUrl!}
                                  alt={act.name}
                                  sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    transition: 'transform 0.2s ease',
                                    '&:hover': { transform: 'scale(1.05)' },
                                  }}
                                />
                              ) : (
                                <PhotoCameraOutlinedIcon sx={{ color: '#94a3b8', fontSize: 24 }} />
                              )}
                            </Box>
                          </TableCell>

                          {/* Name & Details */}
                          <TableCell>
                            <Typography
                              variant="subtitle2"
                              onClick={() => navigate(`/activities/${act.id}/edit`)}
                              sx={{
                                fontWeight: 700,
                                color: '#0f172a',
                                cursor: 'pointer',
                                '&:hover': { color: '#0d9488' },
                              }}
                            >
                              {act.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                              {act.imageCount} {act.imageCount === 1 ? 'photo' : 'photos'} • Order: {act.displayOrder}
                            </Typography>
                          </TableCell>

                          {/* Location */}
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748b' }}>
                              <LocationOnOutlinedIcon sx={{ fontSize: 16, color: '#0d9488' }} />
                              <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                                {act.location}
                              </Typography>
                            </Box>
                          </TableCell>

                          {/* Duration */}
                          <TableCell sx={{ color: '#475569', fontSize: '0.875rem' }}>
                            {act.duration || '—'}
                          </TableCell>

                          {/* Price */}
                          <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>
                            {act.price ? `₹${act.price.toLocaleString('en-IN')}` : 'Contact for pricing'}
                          </TableCell>

                          {/* Status */}
                          <TableCell sx={{ textAlign: 'center' }}>
                            <Tooltip title={act.isActive ? 'Click to Deactivate' : 'Click to Activate'}>
                              <Chip
                                icon={act.isActive ? <CheckCircleRoundedIcon fontSize="small" /> : <CancelRoundedIcon fontSize="small" />}
                                label={act.isActive ? 'Active' : 'Inactive'}
                                size="small"
                                onClick={() => handleToggleStatus(act)}
                                sx={{
                                  cursor: 'pointer',
                                  backgroundColor: act.isActive ? '#ecfdf5' : '#fef2f2',
                                  color: act.isActive ? '#059669' : '#dc2626',
                                  borderColor: act.isActive ? '#a7f3d0' : '#fecaca',
                                  fontWeight: 700,
                                  borderRadius: 1.5,
                                  '&:hover': { opacity: 0.85 },
                                }}
                                variant="outlined"
                              />
                            </Tooltip>
                          </TableCell>

                          {/* Actions */}
                          <TableCell sx={{ textAlign: 'right' }}>
                            <Tooltip title="Edit Activity">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/activities/${act.id}/edit`)}
                                sx={{ color: '#0d9488', mr: 1, '&:hover': { backgroundColor: 'rgba(13,148,136,0.1)' } }}
                              >
                                <EditOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Activity">
                              <IconButton
                                size="small"
                                onClick={() => setDeleteTarget(act)}
                                sx={{ color: '#ef4444', '&:hover': { backgroundColor: 'rgba(239,68,68,0.1)' } }}
                              >
                                <DeleteOutlineRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={totalCount}
              rowsPerPage={pageSize}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setPageSize(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Activity"
        message={`Are you sure you want to permanently delete "${deleteTarget?.name}"? All associated images will be deleted.`}
        confirmText="Delete"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Snackbar feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
