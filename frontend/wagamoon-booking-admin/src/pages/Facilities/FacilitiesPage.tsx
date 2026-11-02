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
  FormControlLabel,
  Switch,
  Snackbar,
  Alert,
  Tooltip,
} from '@mui/material';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { facilityApi } from '../../api/facilityApi';
import { Facility } from '../../types/Facility';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const FacilitiesPage: React.FC = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Add/Edit Dialog State
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [facilityName, setFacilityName] = useState<string>('');
  const [facilityActive, setFacilityActive] = useState<boolean>(true);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<Facility | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    loadFacilities();
  }, []);

  const loadFacilities = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await facilityApi.getFacilities();
      if (response.success && response.data) {
        setFacilities(response.data);
      } else {
        setError('Failed to load facilities.');
      }
    } catch (err: any) {
      setError('Could not connect to the backend server.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingFacility(null);
    setFacilityName('');
    setFacilityActive(true);
    setDialogError(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (fac: Facility) => {
    setEditingFacility(fac);
    setFacilityName(fac.name);
    setFacilityActive(fac.isActive);
    setDialogError(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!facilityName.trim()) {
      setDialogError('Facility name is required.');
      return;
    }

    setIsSaving(true);
    setDialogError(null);
    try {
      if (editingFacility) {
        const res = await facilityApi.updateFacility(editingFacility.id, {
          name: facilityName.trim(),
          isActive: facilityActive,
        });
        if (res.success) {
          setSnackbar({ open: true, message: 'Facility updated successfully.', severity: 'success' });
          setDialogOpen(false);
          loadFacilities();
        } else {
          setDialogError(res.message || 'Failed to update facility.');
        }
      } else {
        const res = await facilityApi.createFacility({
          name: facilityName.trim(),
        });
        if (res.success) {
          setSnackbar({ open: true, message: 'Facility created successfully.', severity: 'success' });
          setDialogOpen(false);
          loadFacilities();
        } else {
          setDialogError(res.message || 'Failed to create facility.');
        }
      }
    } catch (err: any) {
      setDialogError(err.response?.data?.message || 'Error occurred while saving facility.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await facilityApi.deleteFacility(deleteTarget.id);
      if (res.success) {
        setSnackbar({ open: true, message: 'Facility deleted successfully.', severity: 'success' });
        setDeleteTarget(null);
        loadFacilities();
      } else {
        setSnackbar({ open: true, message: res.message || 'Failed to delete facility.', severity: 'error' });
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: 'Error deleting facility.', severity: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Property Facilities
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage reusable amenities that can be attached to Wagamon properties.
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddCircleOutlineRoundedIcon />}
          onClick={handleOpenAdd}
          sx={{ fontWeight: 700 }}
        >
          + Add Facility
        </Button>
      </Box>

      {loading ? (
        <LoadingState message="Loading facilities list..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadFacilities} />
      ) : (
        <Card sx={{ borderRadius: 3 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Facility Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {facilities.map((fac) => (
                  <TableRow key={fac.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {fac.name}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        icon={fac.isActive ? <CheckCircleRoundedIcon /> : <CancelRoundedIcon />}
                        label={fac.isActive ? 'Active' : 'Disabled'}
                        size="small"
                        sx={{
                          backgroundColor: fac.isActive ? '#d1fae5' : '#f1f5f9',
                          color: fac.isActive ? '#065f46' : '#64748b',
                          fontWeight: 700,
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(fac.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Tooltip title="Edit Facility">
                        <IconButton size="small" color="primary" onClick={() => handleOpenEdit(fac)}>
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Facility">
                        <IconButton size="small" color="error" onClick={() => setDeleteTarget(fac)}>
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Add / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingFacility ? 'Edit Facility' : 'Add New Facility'}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {dialogError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {dialogError}
            </Alert>
          )}

          <TextField
            autoFocus
            label="Facility Name"
            fullWidth
            placeholder="e.g. Swimming Pool, WiFi, Campfire"
            value={facilityName}
            onChange={(e) => setFacilityName(e.target.value)}
            sx={{ my: 1.5 }}
          />

          {editingFacility && (
            <FormControlLabel
              control={
                <Switch
                  checked={facilityActive}
                  onChange={(e) => setFacilityActive(e.target.checked)}
                  color="primary"
                />
              }
              label={facilityActive ? 'Active (Available for properties)' : 'Disabled'}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Facility'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Facility?"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        confirmText="Delete"
        isDestructive
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
