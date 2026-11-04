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
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import { categoryApi } from '../../api/categoryApi';
import { StayCategory } from '../../types/Category';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<StayCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Add/Edit Dialog State
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<StayCategory | null>(null);
  const [categoryName, setCategoryName] = useState<string>('');
  const [categorySlug, setCategorySlug] = useState<string>('');
  const [categoryDescription, setCategoryDescription] = useState<string>('');
  const [categoryDisplayOrder, setCategoryDisplayOrder] = useState<number>(0);
  const [categoryActive, setCategoryActive] = useState<boolean>(true);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<StayCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await categoryApi.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      } else {
        setError('Failed to load stay categories.');
      }
    } catch {
      setError('Could not connect to the backend server.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategorySlug('');
    setCategoryDescription('');
    setCategoryDisplayOrder(categories.length > 0 ? Math.max(...categories.map((c) => c.displayOrder)) + 1 : 1);
    setCategoryActive(true);
    setDialogError(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (cat: StayCategory) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setCategorySlug(cat.slug);
    setCategoryDescription(cat.description || '');
    setCategoryDisplayOrder(cat.displayOrder);
    setCategoryActive(cat.isActive);
    setDialogError(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!categoryName.trim()) {
      setDialogError('Category name is required.');
      return;
    }

    setIsSaving(true);
    setDialogError(null);
    try {
      if (editingCategory) {
        const res = await categoryApi.updateCategory(editingCategory.id, {
          name: categoryName.trim(),
          slug: categorySlug.trim() || undefined,
          description: categoryDescription.trim() || undefined,
          displayOrder: Number(categoryDisplayOrder) || 0,
          isActive: categoryActive,
        });

        if (res.success) {
          setSnackbar({ open: true, message: 'Category updated successfully.', severity: 'success' });
          setDialogOpen(false);
          loadCategories();
        } else {
          setDialogError(res.message || 'Failed to update category.');
        }
      } else {
        const res = await categoryApi.createCategory({
          name: categoryName.trim(),
          slug: categorySlug.trim() || undefined,
          description: categoryDescription.trim() || undefined,
          displayOrder: Number(categoryDisplayOrder) || 0,
          isActive: categoryActive,
        });

        if (res.success) {
          setSnackbar({ open: true, message: 'Category created successfully.', severity: 'success' });
          setDialogOpen(false);
          loadCategories();
        } else {
          setDialogError(res.message || 'Failed to create category.');
        }
      }
    } catch (err: any) {
      setDialogError(err.response?.data?.message || 'An unexpected error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (cat: StayCategory) => {
    try {
      const res = await categoryApi.toggleCategoryStatus(cat.id);
      if (res.success) {
        setSnackbar({
          open: true,
          message: `Category ${res.data?.isActive ? 'activated' : 'deactivated'} successfully.`,
          severity: 'success',
        });
        loadCategories();
      } else {
        setSnackbar({ open: true, message: res.message || 'Failed to toggle status.', severity: 'error' });
      }
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Could not update category status.',
        severity: 'error',
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.propertyCount > 0) {
      setSnackbar({
        open: true,
        message: `Cannot delete '${deleteTarget.name}' because it has ${deleteTarget.propertyCount} assigned property/properties. Reassign them first.`,
        severity: 'error',
      });
      setDeleteTarget(null);
      return;
    }

    setIsDeleting(true);
    try {
      const res = await categoryApi.deleteCategory(deleteTarget.id);
      if (res.success) {
        setSnackbar({ open: true, message: 'Category deleted successfully.', severity: 'success' });
        loadCategories();
      } else {
        setSnackbar({ open: true, message: res.message || 'Failed to delete category.', severity: 'error' });
      }
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to delete category.',
        severity: 'error',
      });
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  if (loading) {
    return <LoadingState message="Loading stay categories..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadCategories} />;
  }

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
            <CategoryRoundedIcon sx={{ color: '#0d9488', fontSize: 32 }} />
            Stay Categories
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Manage dynamic property categories (Villa, Resort, Cottage, Tree House, etc.) for admin filtering and public booking navigation.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddCircleOutlineRoundedIcon />}
          onClick={handleOpenAdd}
          sx={{
            backgroundColor: '#0d9488',
            '&:hover': { backgroundColor: '#0f766e' },
            borderRadius: 2.5,
            px: 3,
            py: 1,
            fontWeight: 700,
          }}
        >
          Add Category
        </Button>
      </Box>

      {/* Categories Table */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Slug</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569', textAlign: 'center' }}>Order</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569', textAlign: 'center' }}>Properties</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569', textAlign: 'center' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569', textAlign: 'right' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6, color: '#94a3b8' }}>
                      No stay categories found. Click "Add Category" to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((cat) => (
                    <TableRow key={cat.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>{cat.name}</TableCell>
                      <TableCell sx={{ color: '#0d9488', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                        {cat.slug}
                      </TableCell>
                      <TableCell sx={{ color: '#64748b', maxWidth: 300 }}>
                        {cat.description || <Typography variant="caption" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>None</Typography>}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center', color: '#475569', fontWeight: 600 }}>
                        {cat.displayOrder}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Chip
                          label={`${cat.propertyCount} ${cat.propertyCount === 1 ? 'property' : 'properties'}`}
                          size="small"
                          sx={{
                            backgroundColor: cat.propertyCount > 0 ? '#f0fdfa' : '#f1f5f9',
                            color: cat.propertyCount > 0 ? '#0d9488' : '#64748b',
                            fontWeight: 700,
                            borderRadius: 1.5,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Tooltip title={cat.isActive ? 'Click to Deactivate' : 'Click to Activate'}>
                          <Chip
                            icon={cat.isActive ? <CheckCircleRoundedIcon fontSize="small" /> : <CancelRoundedIcon fontSize="small" />}
                            label={cat.isActive ? 'Active' : 'Inactive'}
                            size="small"
                            onClick={() => handleToggleStatus(cat)}
                            sx={{
                              cursor: 'pointer',
                              backgroundColor: cat.isActive ? '#ecfdf5' : '#fef2f2',
                              color: cat.isActive ? '#059669' : '#dc2626',
                              borderColor: cat.isActive ? '#a7f3d0' : '#fecaca',
                              fontWeight: 700,
                              borderRadius: 1.5,
                              '&:hover': {
                                opacity: 0.85,
                              },
                            }}
                            variant="outlined"
                          />
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        <Tooltip title="Edit Category">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEdit(cat)}
                            sx={{ color: '#0d9488', mr: 1, '&:hover': { backgroundColor: 'rgba(13,148,136,0.1)' } }}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={cat.propertyCount > 0 ? 'Cannot delete category with assigned properties' : 'Delete Category'}>
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => setDeleteTarget(cat)}
                              disabled={cat.propertyCount > 0}
                              sx={{
                                color: cat.propertyCount > 0 ? '#cbd5e1' : '#ef4444',
                                '&:hover': { backgroundColor: 'rgba(239,68,68,0.1)' },
                              }}
                            >
                              <DeleteOutlineRoundedIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a', pb: 1 }}>
          {editingCategory ? 'Edit Stay Category' : 'Create New Stay Category'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {dialogError && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
              {dialogError}
            </Alert>
          )}
          <TextField
            autoFocus
            label="Category Name *"
            fullWidth
            value={categoryName}
            onChange={(e) => {
              setCategoryName(e.target.value);
              if (!editingCategory) {
                // Auto slug preview for new categories
                setCategorySlug(
                  e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-')
                    .trim()
                );
              }
            }}
            placeholder="e.g. Tree House, Farm Stay, Cottage, Villa"
            sx={{ mb: 2.5 }}
          />
          <TextField
            label="Slug (URL identifier)"
            fullWidth
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            helperText="Lowercase letters, numbers, and hyphens (auto-generated if empty)."
            placeholder="e.g. tree-house"
            sx={{ mb: 2.5 }}
          />
          <TextField
            label="Description (Optional)"
            fullWidth
            multiline
            rows={3}
            value={categoryDescription}
            onChange={(e) => setCategoryDescription(e.target.value)}
            placeholder="A short summary of what properties in this category offer..."
            sx={{ mb: 2.5 }}
          />
          <TextField
            label="Display Order"
            type="number"
            fullWidth
            value={categoryDisplayOrder}
            onChange={(e) => setCategoryDisplayOrder(parseInt(e.target.value) || 0)}
            helperText="Lower numbers appear first in lists and public filter tabs."
            sx={{ mb: 2.5 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={categoryActive}
                onChange={(e) => setCategoryActive(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Active Category</Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  When active, properties can be assigned to this category and it appears in public filters.
                </Typography>
              </Box>
            }
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: '#64748b', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isSaving}
            sx={{
              backgroundColor: '#0d9488',
              '&:hover': { backgroundColor: '#0f766e' },
              borderRadius: 2,
              px: 3,
              fontWeight: 700,
            }}
          >
            {isSaving ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Category"
        message={`Are you sure you want to delete the category "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Feedback Snackbar */}
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
