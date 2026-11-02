import React, { useState } from 'react';
import { Box, Alert, Snackbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { propertyApi } from '../../api/propertyApi';
import { PropertyForm } from '../../components/properties/PropertyForm';
import { PropertyFormData } from '../../utils/validation';

export const AddPropertyPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async (data: PropertyFormData) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const response = await propertyApi.createProperty({
        name: data.name,
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
        // Redirect to edit page so user can upload multiple images immediately
        navigate(`/properties/${response.data.id}/edit?created=true`);
      } else {
        setServerError(response.message || 'Failed to create property.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error occurred while saving property.';
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box>
      {serverError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setServerError(null)}>
          {serverError}
        </Alert>
      )}

      <PropertyForm
        title="Add New Property"
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitButtonText="Create & Continue to Photos"
      />
    </Box>
  );
};
