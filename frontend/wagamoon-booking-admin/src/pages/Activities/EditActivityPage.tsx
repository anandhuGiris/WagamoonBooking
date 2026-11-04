import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Button,
  FormControlLabel,
  Switch,
  CircularProgress,
  Alert,
  InputAdornment,
  Tabs,
  Tab,
  Snackbar,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CurrencyRupeeRoundedIcon from '@mui/icons-material/CurrencyRupeeRounded';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { activitySchema, ActivityFormData } from '../../utils/validation';
import { activityApi } from '../../api/activityApi';
import { ActivityDetail, ActivityImage } from '../../types/Activity';
import { ActivityImageUploader } from '../../components/activities/ActivityImageUploader';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';

export const EditActivityPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [activity, setActivity] = useState<ActivityDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);

  const justCreated = new URLSearchParams(location.search).get('created') === 'true';

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: justCreated,
    message: justCreated ? 'Activity created successfully! Upload photos in the gallery tab.' : '',
    severity: 'success',
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema) as any,
  });

  useEffect(() => {
    if (id) {
      loadActivity(id);
    }
  }, [id]);

  const loadActivity = async (activityId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await activityApi.getActivityById(activityId);
      if (response.success && response.data) {
        setActivity(response.data);
        reset({
          name: response.data.name,
          slug: response.data.slug,
          description: response.data.description,
          location: response.data.location,
          duration: response.data.duration || '',
          price: response.data.price ?? undefined,
          whatsAppNumber: response.data.whatsAppNumber || '',
          isActive: response.data.isActive,
          displayOrder: response.data.displayOrder,
        });

        if (justCreated) {
          setActiveTab(1); // Jump directly to gallery tab
        }
      } else {
        setError(response.message || 'Activity not found.');
      }
    } catch {
      setError('Could not connect to the backend server.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ActivityFormData) => {
    if (!id) return;
    setIsSubmitting(true);

    try {
      const response = await activityApi.updateActivity(id, {
        name: data.name,
        slug: data.slug || undefined,
        description: data.description,
        location: data.location,
        duration: data.duration || undefined,
        price: data.price ?? null,
        whatsAppNumber: data.whatsAppNumber || undefined,
        isActive: data.isActive,
        displayOrder: Number(data.displayOrder) || 0,
      });

      if (response.success && response.data) {
        setActivity(response.data);
        setSnackbar({ open: true, message: 'Activity details updated successfully!', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: response.message || 'Failed to update activity.', severity: 'error' });
      }
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Error occurred while saving activity.',
        severity: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImagesUpdated = (updatedImages: ActivityImage[]) => {
    if (activity) {
      setActivity({
        ...activity,
        images: updatedImages,
      });
    }
  };

  if (loading) {
    return <LoadingState message="Loading activity details..." />;
  }

  if (error || !activity) {
    return <ErrorState message={error || 'Activity not found.'} onRetry={() => id && loadActivity(id)} />;
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Top Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/activities')}
            sx={{ borderColor: '#cbd5e1' }}
          >
            Back
          </Button>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {activity.name}
            </Typography>
            <Typography variant="caption" sx={{ color: '#0d9488', fontWeight: 600 }}>
              {activity.location} • {activity.isActive ? 'Active' : 'Inactive'}
            </Typography>
          </Box>
        </Box>

        {activeTab === 0 && (
          <Button
            type="button"
            variant="contained"
            size="large"
            disabled={isSubmitting}
            onClick={handleSubmit(onSubmit)}
            startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
            sx={{
              backgroundColor: '#0d9488',
              '&:hover': { backgroundColor: '#0f766e' },
              px: 3,
              fontWeight: 700,
            }}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        )}
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
          <Tab label="Activity Information" sx={{ fontWeight: 700 }} />
          <Tab label={`Photo Gallery (${activity.images.length})`} sx={{ fontWeight: 700 }} />
        </Tabs>
      </Box>

      {/* Tab 0: Information Form */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                Basic Information
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Title, location, and comprehensive experience description.
              </Typography>

              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    {...register('name')}
                    label="Activity Name *"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    {...register('location')}
                    label="Location *"
                    fullWidth
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationOnOutlinedIcon sx={{ color: '#0d9488' }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                    error={!!errors.location}
                    helperText={errors.location?.message}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    {...register('description')}
                    label="Description *"
                    fullWidth
                    multiline
                    rows={5}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                </Grid>
              </Grid>
            </Card>

            <Card sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                Specifications & Pricing
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Duration details and cost per participant.
              </Typography>

              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    {...register('duration')}
                    label="Duration (Optional)"
                    fullWidth
                    placeholder="e.g. 2 Hours, Half Day"
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <AccessTimeRoundedIcon sx={{ color: '#0d9488' }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                    error={!!errors.duration}
                    helperText={errors.duration?.message}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    {...register('price', { valueAsNumber: true })}
                    label="Price (₹ per person/group, Optional)"
                    type="number"
                    fullWidth
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <CurrencyRupeeRoundedIcon sx={{ color: '#0d9488' }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                    error={!!errors.price}
                    helperText={errors.price?.message}
                  />
                </Grid>
              </Grid>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            {/* Status & Ordering Card */}
            <Card sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                Status & URL
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Configure publication status and slug identifier.
              </Typography>

              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} color="primary" />}
                    label={field.value ? 'Active (Publicly Visible)' : 'Inactive (Hidden)'}
                    sx={{ mb: 2 }}
                  />
                )}
              />

              <TextField
                {...register('displayOrder', { valueAsNumber: true })}
                label="Display Order"
                type="number"
                fullWidth
                helperText="Lower numbers appear first."
                sx={{ mb: 2 }}
              />

              <TextField
                {...register('slug')}
                label="Slug (URL identifier)"
                fullWidth
                error={!!errors.slug}
                helperText={errors.slug?.message}
              />
            </Card>

            {/* WhatsApp Contact */}
            <Card sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <WhatsAppIcon sx={{ color: '#25D366' }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  WhatsApp Contact
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                Enquiries for this activity will direct to this number.
              </Typography>

              <TextField
                {...register('whatsAppNumber')}
                label="WhatsApp Phone Number"
                fullWidth
                placeholder="+919876543210"
                error={!!errors.whatsAppNumber}
                helperText={errors.whatsAppNumber?.message}
              />
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab 1: Image Gallery */}
      {activeTab === 1 && (
        <Card sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
          <ActivityImageUploader
            activityId={activity.id}
            images={activity.images}
            onImagesUpdated={handleImagesUpdated}
          />
        </Card>
      )}

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

