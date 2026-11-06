import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Button,
  Chip,
} from '@mui/material';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { propertyApi } from '../../api/propertyApi';
import { PropertyDetail, PropertyImage } from '../../types/Property';
import { PropertyForm } from '../../components/properties/PropertyForm';
import { PropertyImageUploader } from '../../components/properties/PropertyImageUploader';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { PropertyFormData } from '../../utils/validation';

export const EditPropertyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);

  // Check if just created from query param
  const justCreated = new URLSearchParams(location.search).get('created') === 'true';

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: justCreated,
    message: justCreated ? 'Property created successfully! Upload your photos below.' : '',
    severity: 'success',
  });

  useEffect(() => {
    if (id) {
      loadProperty(id);
    }
  }, [id]);

  const loadProperty = async (propertyId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await propertyApi.getPropertyById(propertyId);
      if (response.success && response.data) {
        setProperty(response.data);
      } else {
        setError(response.message || 'Property not found.');
      }
    } catch (err: any) {
      setError('Could not connect to the backend server.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (data: PropertyFormData) => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      const response = await propertyApi.updateProperty(id, {
        name: data.name,
        categoryId: data.categoryId,
        description: data.description,
        location: data.location,
        bedrooms: data.bedrooms ?? null,
        bathrooms: data.bathrooms ?? null,
        maxGuests: data.maxGuests ?? null,
        whatsAppNumber: data.whatsAppNumber,
        status: data.status,
        facilityIds: data.facilityIds,
      });

      if (response.success && response.data) {
        setProperty(response.data);
        setSnackbar({
          open: true,
          message: 'Property details updated successfully!',
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: response.message || 'Failed to update property.',
          severity: 'error',
        });
      }
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Error updating property.',
        severity: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImagesUpdated = (updatedImages: PropertyImage[]) => {
    if (property) {
      setProperty({
        ...property,
        images: updatedImages,
      });
    }
  };

  if (loading) {
    return <LoadingState message="Loading property details and images..." />;
  }

  if (error || !property) {
    return <ErrorState message={error || 'Property not found.'} onRetry={() => id && loadProperty(id)} />;
  }

  return (
    <Box>
      {/* Top Header */}
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/properties')}
            sx={{ borderColor: '#cbd5e1' }}
          >
            Back
          </Button>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {property.name}
              </Typography>
              <Chip
                label={property.status}
                size="small"
                sx={{
                  backgroundColor:
                    property.status === 'Active' ? '#d1fae5' : property.status === 'Draft' ? '#fef3c7' : '#f1f5f9',
                  color:
                    property.status === 'Active' ? '#065f46' : property.status === 'Draft' ? '#92400e' : '#475569',
                  fontWeight: 700,
                }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              ID: {property.id} • Created {new Date(property.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>

        <Button
          variant="outlined"
          color="secondary"
          startIcon={<LaunchRoundedIcon />}
          component="a"
          href={import.meta.env.VITE_PUBLIC_WEBSITE_URL ? `${import.meta.env.VITE_PUBLIC_WEBSITE_URL}/properties/${property.id}` : `https://wagamoonbooking.com/properties/${property.id}`}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ fontWeight: 700 }}
        >
          View on Website
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
          <Tab label="Edit Property Information" sx={{ fontWeight: 700 }} />
          <Tab
            label={`Manage Photo Gallery (${property.images.length})`}
            sx={{ fontWeight: 700 }}
          />
        </Tabs>
      </Box>

      {/* Tab 0: Information Form */}
      {activeTab === 0 && (
        <PropertyForm
          title=""
          initialValues={{
            id: property.id,
            name: property.name,
            categoryId: property.categoryId,
            description: property.description,
            location: property.location,
            bedrooms: property.bedrooms ?? undefined,
            bathrooms: property.bathrooms ?? undefined,
            maxGuests: property.maxGuests ?? undefined,
            whatsAppNumber: property.whatsAppNumber,
            status: property.status,
            facilityIds: property.facilityIds || property.facilities.map((f) => f.id),
          }}
          onSubmit={handleUpdate}
          isSubmitting={isSubmitting}
          submitButtonText="Save Changes"
        />
      )}

      {/* Tab 1: Image Uploader */}
      {activeTab === 1 && (
        <Card sx={{ p: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
              Property Photo Gallery
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Upload high-resolution property pictures. Reorder them using arrows, or choose which image appears as the Primary cover on the public website.
            </Typography>

            <PropertyImageUploader
              propertyId={property.id}
              images={property.images}
              onImagesUpdated={handleImagesUpdated}
            />
          </CardContent>
        </Card>
      )}

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
