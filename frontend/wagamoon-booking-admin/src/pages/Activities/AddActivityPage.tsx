import React, { useState } from 'react';
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
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CurrencyRupeeRoundedIcon from '@mui/icons-material/CurrencyRupeeRounded';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { activitySchema, ActivityFormData } from '../../utils/validation';
import { activityApi } from '../../api/activityApi';

export const AddActivityPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema) as any,
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      location: 'Wagamon, Kerala',
      duration: '',
      price: undefined,
      whatsAppNumber: '+91',
      isActive: true,
      displayOrder: 1,
    },
  });

  const onSubmit = async (data: ActivityFormData) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const response = await activityApi.createActivity({
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
        navigate(`/activities/${response.data.id}/edit?created=true`);
      } else {
        setServerError(response.message || 'Failed to create activity.');
      }
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Error occurred while saving activity.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
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
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Add Adventure Activity
          </Typography>
        </Box>

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
          {isSubmitting ? 'Saving...' : 'Create & Upload Photos'}
        </Button>
      </Box>

      {serverError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setServerError(null)}>
          {serverError}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              Activity Details
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter information displayed on the public adventure showcase.
            </Typography>

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  {...register('name')}
                  label="Activity Name *"
                  fullWidth
                  placeholder="e.g. Kurisumala Off-Road Jeep Safari"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  {...register('location')}
                  label="Location *"
                  fullWidth
                  placeholder="e.g. Kurisumala Ridge, Wagamon"
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
                  rows={4}
                  placeholder="Describe the adventure itinerary, terrain, scenic viewpoints, safety gear provided, etc..."
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              </Grid>
            </Grid>
          </Card>

          <Card sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              Adventure Specifications
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Optional duration, pricing, and display ordering.
            </Typography>

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  {...register('duration')}
                  label="Duration (Optional)"
                  fullWidth
                  placeholder="e.g. 2 Hours, Half Day, 45 Mins"
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
                  placeholder="e.g. 1500"
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
              Publication Status
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Control whether this activity is publicly visible.
            </Typography>

            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} color="primary" />}
                  label={field.value ? 'Active (Visible on Website)' : 'Inactive (Hidden)'}
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
              label="Slug (Optional)"
              fullWidth
              placeholder="e.g. jeep-safari"
              helperText="Auto-generated from name if left empty."
            />
          </Card>

          {/* WhatsApp Direct Booking */}
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
              label="WhatsApp Number (Optional)"
              fullWidth
              placeholder="+919876543210"
              error={!!errors.whatsAppNumber}
              helperText={errors.whatsAppNumber?.message || 'Leave blank to use general resort WhatsApp.'}
            />
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

