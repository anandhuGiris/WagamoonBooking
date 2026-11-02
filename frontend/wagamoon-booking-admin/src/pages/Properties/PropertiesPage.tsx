import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Snackbar,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import { useNavigate } from 'react-router-dom';
import { propertyApi } from '../../api/propertyApi';
import { Property, PropertyStatus } from '../../types/Property';
import { PropertyTable } from '../../components/properties/PropertyTable';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';

export const PropertiesPage: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Snackbar notifications
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const loadProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const statusParam = statusFilter === 'ALL' ? undefined : (statusFilter as PropertyStatus);
      const response = await propertyApi.getProperties({
        page,
        pageSize,
        search: search.trim() || undefined,
        status: statusParam,
      });

      if (response.success && response.data) {
        setProperties(response.data.items);
        setTotalCount(response.data.totalCount);
      } else {
        setError(response.message || 'Failed to load properties.');
      }
    } catch (err: any) {
      setError('Could not connect to the backend server.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusFilter]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadProperties();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [loadProperties]);

  const handleStatusChange = async (id: string, newStatus: PropertyStatus) => {
    try {
      const res = await propertyApi.updatePropertyStatus(id, newStatus);
      if (res.success) {
        setSnackbar({
          open: true,
          message: `Property status updated to ${newStatus}. ${newStatus === 'Active' ? 'Now visible on public GoDaddy site!' : 'Hidden from public site.'}`,
          severity: 'success',
        });
        loadProperties();
      } else {
        setSnackbar({ open: true, message: res.message || 'Failed to update status.', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Error updating status.', severity: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await propertyApi.deleteProperty(id);
      if (res.success) {
        setSnackbar({
          open: true,
          message: 'Property and associated media deleted successfully.',
          severity: 'success',
        });
        loadProperties();
      } else {
        setSnackbar({ open: true, message: res.message || 'Failed to delete property.', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Error deleting property.', severity: 'error' });
    }
  };

  return (
    <Box>
      {/* Title & Add CTA */}
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
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Property Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage Wagamoon villas, photos, amenities, WhatsApp direct contact, and live status.
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddCircleOutlineRoundedIcon />}
          onClick={() => navigate('/properties/new')}
          sx={{ fontWeight: 700 }}
        >
          + Add Property
        </Button>
      </Box>

      {/* Filters Toolbar */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', md: 'center' },
          gap: 2,
          mb: 2.5,
        }}
      >
        {/* Status Filter Tabs */}
        <Tabs
          value={statusFilter}
          onChange={(_, val) => {
            setStatusFilter(val);
            setPage(1);
          }}
          sx={{
            minHeight: 44,
            '& .MuiTab-root': {
              minHeight: 44,
              fontWeight: 700,
              fontSize: '0.875rem',
              textTransform: 'none',
            },
          }}
        >
          <Tab value="ALL" label="All Properties" />
          <Tab value="Active" label="Active (Public)" />
          <Tab value="Draft" label="Drafts" />
          <Tab value="Inactive" label="Inactive" />
        </Tabs>

        {/* Search Field */}
        <TextField
          placeholder="Search by name or location..."
          size="small"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#94a3b8' }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{ width: { xs: '100%', md: 320 } }}
        />
      </Box>

      {/* Main Content Area */}
      {loading ? (
        <LoadingState variant="skeleton" rows={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={loadProperties} />
      ) : properties.length === 0 ? (
        <EmptyState
          title="No properties found"
          description={
            search || statusFilter !== 'ALL'
              ? 'No properties match your current search criteria. Try resetting filters.'
              : 'Start by creating your first property listing for Wagamoon Booking.'
          }
          actionText={search || statusFilter !== 'ALL' ? undefined : '+ Add Property'}
          onAction={() => navigate('/properties/new')}
        />
      ) : (
        <PropertyTable
          properties={properties}
          totalCount={totalCount}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      )}

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
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
