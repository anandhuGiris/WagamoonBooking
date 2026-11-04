import React, { useEffect, useState } from 'react';
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
import { categoryApi } from '../../api/categoryApi';
import { StayCategory } from '../../types/Category';

interface PropertyFormProps {
  initialValues?: Partial<PropertyFormData> & { id?: string };
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
  const [categories, setCategories] = useState<StayCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryApi.getCategories(true);
        if (res.success && res.data) {
          setCategories(res.data);
        }
      } catch {
        // Fallback
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

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
      categoryId: initialValues?.categoryId || '',
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
  const previewWhatsAppUrl = buildWhatsAppUrl(watchedPhone, watchedName, initialValues?.id);

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
                  <Controller
                    name="categoryId"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.categoryId}>
                        <InputLabel id="property-category-label">Stay Category *</InputLabel>
                        <Select
                          {...field}
                          labelId="property-category-label"
                          label="Stay Category *"
                          value={field.value || ''}
                          disabled={categoriesLoading}
                        >
                          <MenuItem value="" disabled>
                            <em>{categoriesLoading ? 'Loading categories...' : 'Select a stay category'}</em>
                          </MenuItem>
                          {categories.map((cat) => (
                            <MenuItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.categoryId && (
                          <FormHelperText>{errors.categoryId.message}</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    {...register('location')}
                    label="Location *"
                    fullWidth
                    placeholder="e.g. Wagamon Lake Valley, Kerala"
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
                    <InputLabel id="status-select-label">Status</InputLabel>
                    <Select
                      {...field}
                      labelId="status-select-label"
                      label="Status"
                    >
                      <MenuItem value="Draft">Draft (Hidden)</MenuItem>
                      <MenuItem value="Active">Active (Publicly Visible)</MenuItem>
                      <MenuItem value="Inactive">Inactive (Unlisted)</MenuItem>
                    </Select>
                    {errors.status && (
                      <FormHelperText>{errors.status.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </CardContent>
          </Card>

          {/* WhatsApp Enquiry Configuration */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <WhatsAppIcon sx={{ color: '#25D366' }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  WhatsApp Enquiry
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                Inbound customer enquiries from GoDaddy/Public listings will direct to this number.
              </Typography>

              <TextField
                {...register('whatsAppNumber')}
                label="WhatsApp Phone Number *"
                fullWidth
                placeholder="+919876543210"
                error={!!errors.whatsAppNumber}
                helperText={errors.whatsAppNumber?.message}
                sx={{ mb: 2 }}
              />

              <Divider sx={{ my: 2 }} />

              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1 }}>
                LIVE PREVIEW LINK
              </Typography>
              <Alert severity="info" sx={{ wordBreak: 'break-all', fontSize: '0.75rem', py: 0.5 }}>
                {previewWhatsAppUrl ? (
                  <a
                    href={previewWhatsAppUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#0f766e', textDecoration: 'underline' }}
                  >
                    {previewWhatsAppUrl}
                  </a>
                ) : (
                  'Enter a valid phone number to generate click-to-chat URL.'
                )}
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
