import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Divider,
  CircularProgress,
  InputAdornment,
  Alert,
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { propertySchema, PropertyFormData } from '../../utils/validation';
import { FacilitySelector } from './FacilitySelector';
import { buildWhatsAppUrl } from '../../utils/whatsapp';

interface PropertyFormProps {
  initialValues?: Partial<PropertyFormData>;
  onSubmit: (data: PropertyFormData) => Promise<void>;
  isSubmitting?: boolean;
  submitButtonText?: string;
  title?: string;
}

export const PropertyForm: React.FC<PropertyFormProps> = ({
  initialValues,
  onSubmit,
  isSubmitting = false,
  submitButtonText = 'Save Property',
  title = 'Property Details',
}) => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema) as any,
    defaultValues: {
      name: initialValues?.name || '',
      description: initialValues?.description || '',
      location: initialValues?.location || '',
      bedrooms: initialValues?.bedrooms ?? undefined,
      bathrooms: initialValues?.bathrooms ?? undefined,
      maxGuests: initialValues?.maxGuests ?? undefined,
      whatsAppNumber: initialValues?.whatsAppNumber || '+91',
      status: initialValues?.status || 'Draft',
      facilityIds: initialValues?.facilityIds || [],
    },
  });

  const watchedPhone = watch('whatsAppNumber');
  const watchedName = watch('name');
  const previewWhatsAppUrl = buildWhatsAppUrl(watchedPhone, watchedName);

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
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
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {title}
          </Typography>
        </Box>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
          sx={{ px: 3, fontWeight: 700 }}
        >
          {isSubmitting ? 'Saving...' : submitButtonText}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                Basic Information
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Primary identifying information visible on public listings.
              </Typography>

              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    {...register('name')}
                    label="Property Name *"
                    fullWidth
                    placeholder="e.g. Lake View Villa"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    {...register('location')}
                    label="Location *"
                    fullWidth
                    placeholder="e.g. Wagamoon Lake Valley, Kerala"
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
                    placeholder="Describe the property ambiance, unique architectural highlights, and surrounding landscape..."
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Property Specifications */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                Property Details (Optional)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Guest capacity and room breakdown.
              </Typography>

              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    {...register('bedrooms', { valueAsNumber: true })}
                    label="Bedrooms"
                    type="number"
                    fullWidth
                    placeholder="e.g. 3"
                    error={!!errors.bedrooms}
                    helperText={errors.bedrooms?.message}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    {...register('bathrooms', { valueAsNumber: true })}
                    label="Bathrooms"
                    type="number"
                    fullWidth
                    placeholder="e.g. 2"
                    error={!!errors.bathrooms}
                    helperText={errors.bathrooms?.message}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    {...register('maxGuests', { valueAsNumber: true })}
                    label="Maximum Guests"
                    type="number"
                    fullWidth
                    placeholder="e.g. 8"
                    error={!!errors.maxGuests}
                    helperText={errors.maxGuests?.message}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Facilities Selector */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                Property Facilities & Amenities
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                Select all features available at this property.
              </Typography>

              <Controller
                name="facilityIds"
                control={control}
                render={({ field }) => (
                  <FacilitySelector
                    selectedIds={field.value}
                    onChange={(ids) => field.onChange(ids)}
                    error={errors.facilityIds?.message}
                  />
                )}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar / WhatsApp & Publication Status */}
        <Grid size={{ xs: 12, md: 4 }}>
          {/* Publication Status Card */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                Publication Status
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Control visibility on the public website.
              </Typography>

              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.status}>
                    <InputLabel id="status-label">Status</InputLabel>
                    <Select {...field} labelId="status-label" label="Status">
                      <MenuItem value="Draft">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                          <span>Draft (Hidden from Public)</span>
                        </Box>
                      </MenuItem>
                      <MenuItem value="Active">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981' }} />
                          <span>Active (Visible on Public Website)</span>
                        </Box>
                      </MenuItem>
                      <MenuItem value="Inactive">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#94a3b8' }} />
                          <span>Inactive (Archived)</span>
                        </Box>
                      </MenuItem>
                    </Select>
                    {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </CardContent>
          </Card>

          {/* WhatsApp Direct Enquiry Card */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <WhatsAppIcon sx={{ color: '#25D366', fontSize: 24 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  WhatsApp Contact
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                Customer clicks on the public website directly open WhatsApp chat with this number.
              </Typography>

              <TextField
                {...register('whatsAppNumber')}
                label="WhatsApp Number *"
                fullWidth
                placeholder="+919876543210"
                error={!!errors.whatsAppNumber}
                helperText={errors.whatsAppNumber?.message}
                sx={{ mb: 2 }}
              />

              {previewWhatsAppUrl && (
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#166534', fontWeight: 700, display: 'block', mb: 0.5 }}>
                    PREVIEW GENERATED LINK:
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#15803d',
                      wordBreak: 'break-all',
                      display: 'block',
                      fontFamily: 'monospace',
                      mb: 1.5,
                    }}
                  >
                    {previewWhatsAppUrl}
                  </Typography>

                  <Button
                    variant="outlined"
                    size="small"
                    href={previewWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<WhatsAppIcon sx={{ color: '#25D366' }} />}
                    sx={{
                      borderColor: '#86efac',
                      color: '#166534',
                      backgroundColor: '#ffffff',
                      '&:hover': {
                        backgroundColor: '#dcfce7',
                      },
                    }}
                  >
                    Test WhatsApp Link
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
