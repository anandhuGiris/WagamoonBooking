import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { facilityApi } from '../../api/facilityApi';
import { Facility } from '../../types/Facility';

interface FacilitySelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  error?: string;
}

export const FacilitySelector: React.FC<FacilitySelectorProps> = ({
  selectedIds,
  onChange,
  error,
}) => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    loadFacilities();
  }, []);

  const loadFacilities = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const response = await facilityApi.getFacilities(true);
      if (response.success && response.data) {
        setFacilities(response.data);
      }
    } catch (err: any) {
      setFetchError('Failed to load facilities.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 2 }}>
        <CircularProgress size={20} color="primary" />
        <Typography variant="body2" color="text.secondary">
          Loading property facilities...
        </Typography>
      </Box>
    );
  }

  if (fetchError) {
    return <Alert severity="warning">{fetchError}</Alert>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155' }}>
          Select Available Facilities
        </Typography>
        <Typography variant="caption" sx={{ color: '#0d9488', fontWeight: 700 }}>
          {selectedIds.length} selected
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {facilities.map((fac) => {
          const isSelected = selectedIds.includes(fac.id);
          return (
            <Chip
              key={fac.id}
              label={fac.name}
              onClick={() => handleToggle(fac.id)}
              icon={isSelected ? <CheckRoundedIcon /> : <AddRoundedIcon />}
              variant={isSelected ? 'filled' : 'outlined'}
              sx={{
                px: 0.5,
                py: 2,
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
                backgroundColor: isSelected ? '#0d9488' : '#ffffff',
                color: isSelected ? '#ffffff' : '#475569',
                borderColor: isSelected ? '#0d9488' : '#cbd5e1',
                '&:hover': {
                  backgroundColor: isSelected ? '#0f766e' : '#f1f5f9',
                },
                '& .MuiChip-icon': {
                  color: isSelected ? '#ffffff !important' : '#64748b !important',
                },
                transition: 'all 0.15s ease-in-out',
              }}
            />
          );
        })}
      </Box>

      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};
