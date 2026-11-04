import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  TablePagination,
  Button,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import PauseCircleOutlineRoundedIcon from '@mui/icons-material/PauseCircleOutlineRounded';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import { useNavigate } from 'react-router-dom';
import { Property, PropertyStatus } from '../../types/Property';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface PropertyTableProps {
  properties: Property[];
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newPageSize: number) => void;
  onStatusChange: (id: string, newStatus: PropertyStatus) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const PropertyTable: React.FC<PropertyTableProps> = ({
  properties,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onStatusChange,
  onDelete,
}) => {
  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusChip = (status: PropertyStatus) => {
    switch (status) {
      case 'Active':
        return (
          <Chip
            label="Active"
            size="small"
            sx={{
              backgroundColor: '#d1fae5',
              color: '#065f46',
              fontWeight: 700,
              fontSize: '0.75rem',
            }}
          />
        );
      case 'Draft':
        return (
          <Chip
            label="Draft"
            size="small"
            sx={{
              backgroundColor: '#fef3c7',
              color: '#92400e',
              fontWeight: 700,
              fontSize: '0.75rem',
            }}
          />
        );
      case 'Inactive':
      default:
        return (
          <Chip
            label="Inactive"
            size="small"
            sx={{
              backgroundColor: '#f1f5f9',
              color: '#475569',
              fontWeight: 700,
              fontSize: '0.75rem',
            }}
          />
        );
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Box>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
        }}
      >
        <Table sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 100 }}>Image</TableCell>
              <TableCell>Property</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Facilities</TableCell>
              <TableCell>Updated</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {properties.map((property) => {
              const hasImage = !!property.primaryImageUrl;
              const isActive = property.status === 'Active';

              return (
                <TableRow key={property.id} hover>
                  {/* Thumbnail */}
                  <TableCell>
                    <Box
                      onClick={() => navigate(`/properties/${property.id}/edit`)}
                      sx={{
                        width: 76,
                        height: 54,
                        borderRadius: 2,
                        backgroundColor: '#f1f5f9',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      {hasImage ? (
                        <Box
                          component="img"
                          src={property.primaryImageUrl!}
                          alt={property.name}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.2s ease',
                            '&:hover': { transform: 'scale(1.05)' },
                          }}
                        />
                      ) : (
                        <PhotoCameraOutlinedIcon sx={{ color: '#94a3b8', fontSize: 24 }} />
                      )}
                    </Box>
                  </TableCell>

                  {/* Name */}
                  <TableCell>
                    <Typography
                      variant="subtitle2"
                      onClick={() => navigate(`/properties/${property.id}/edit`)}
                      sx={{
                        fontWeight: 700,
                        color: '#0f172a',
                        cursor: 'pointer',
                        '&:hover': { color: '#0d9488' },
                      }}
                    >
                      {property.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {property.bedrooms ? `${property.bedrooms} Bed` : ''}
                      {property.bedrooms && property.maxGuests ? ' • ' : ''}
                      {property.maxGuests ? `Max ${property.maxGuests} Guests` : ''}
                    </Typography>
                  </TableCell>

                  {/* Category */}
                  <TableCell>
                    <Chip
                      label={property.categoryName || 'Standard'}
                      size="small"
                      sx={{
                        backgroundColor: '#f0fdfa',
                        color: '#0d9488',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        borderRadius: 1.5,
                        border: '1px solid #ccfbf1',
                      }}
                    />
                  </TableCell>

                  {/* Location */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748b' }}>
                      <LocationOnOutlinedIcon sx={{ fontSize: 16, color: '#0d9488' }} />
                      <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                        {property.location}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Status */}
                  <TableCell>{getStatusChip(property.status)}</TableCell>

                  {/* Facilities */}
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>
                      {property.facilityCount} amenities
                    </Typography>
                  </TableCell>

                  {/* Updated */}
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.825rem' }}>
                      {formatDate(property.updatedAt || property.createdAt)}
                    </Typography>
                  </TableCell>

                  {/* Actions */}
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                      {/* Quick Activate/Deactivate Toggle */}
                      {isActive ? (
                        <Tooltip title="Deactivate Property (Hide from Public Website)">
                          <IconButton
                            size="small"
                            onClick={() => onStatusChange(property.id, 'Inactive')}
                            sx={{ color: '#64748b', '&:hover': { color: '#f59e0b' } }}
                          >
                            <PauseCircleOutlineRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Activate Property (Publish on Website)">
                          <IconButton
                            size="small"
                            onClick={() => onStatusChange(property.id, 'Active')}
                            sx={{ color: '#0d9488', '&:hover': { color: '#0f766e' } }}
                          >
                            <CheckCircleOutlineRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {/* Edit Button */}
                      <Tooltip title="Edit Property & Manage Images">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/properties/${property.id}/edit`)}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {/* Delete Button */}
                      <Tooltip title="Delete Property">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteTarget(property)}
                        >
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCount}
          rowsPerPage={pageSize}
          page={page - 1}
          onPageChange={(_, newPage) => onPageChange(newPage + 1)}
          onRowsPerPageChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
          sx={{ borderTop: '1px solid #e2e8f0' }}
        />
      </TableContainer>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Property?"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? All associated images and facilities relationships will be permanently removed.`}
        confirmText="Delete Property"
        isDestructive
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
};
