import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardActions,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { propertyApi } from '../../api/propertyApi';
import { PropertyImage } from '../../types/PropertyImage';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface PropertyImageUploaderProps {
  propertyId: string;
  images: PropertyImage[];
  onImagesUpdated: (updatedImages: PropertyImage[]) => void;
}

export const PropertyImageUploader: React.FC<PropertyImageUploaderProps> = ({
  propertyId,
  images,
  onImagesUpdated,
}) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deleteConfirmImageId, setDeleteConfirmImageId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setErrorMessage(null);
    const validFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!allowedFormats.includes(file.type.toLowerCase())) {
        setErrorMessage(`"${file.name}" has an unsupported format. Only JPEG, PNG, and WebP images are allowed.`);
        return;
      }
      if (file.size > maxFileSize) {
        setErrorMessage(`"${file.name}" exceeds the 10MB size limit.`);
        return;
      }
      validFiles.push(file);
    }

    setIsUploading(true);
    try {
      const res = await propertyApi.uploadPropertyImages(propertyId, validFiles);
      if (res.success && res.data) {
        // Refresh property details or append new images
        const updated = [...images, ...res.data];
        onImagesUpdated(updated);
      } else {
        setErrorMessage(res.message || 'Failed to upload images.');
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Error occurred while uploading to Cloudinary.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    try {
      const res = await propertyApi.setPrimaryImage(propertyId, imageId);
      if (res.success) {
        const updated = images.map((img) => ({
          ...img,
          isPrimary: img.id === imageId,
        }));
        onImagesUpdated(updated);
      }
    } catch (err) {
      setErrorMessage('Failed to update primary image.');
    }
  };

  const handleDeleteImage = async () => {
    if (!deleteConfirmImageId) return;
    setIsDeleting(true);
    try {
      const res = await propertyApi.deletePropertyImage(propertyId, deleteConfirmImageId);
      if (res.success) {
        const remaining = images.filter((img) => img.id !== deleteConfirmImageId);
        // If we deleted the primary, assign primary to first if available
        if (remaining.length > 0 && !remaining.some((img) => img.isPrimary)) {
          remaining[0].isPrimary = true;
        }
        onImagesUpdated(remaining);
        setDeleteConfirmImageId(null);
      } else {
        setErrorMessage(res.message || 'Failed to delete image.');
      }
    } catch (err) {
      setErrorMessage('Error occurred while deleting image.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMoveImage = async (currentIndex: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const newOrder = [...images];
    const [moved] = newOrder.splice(currentIndex, 1);
    newOrder.splice(targetIndex, 0, moved);

    const reorderedIds = newOrder.map((img) => img.id);
    onImagesUpdated(newOrder);

    try {
      await propertyApi.reorderImages(propertyId, reorderedIds);
    } catch (err) {
      setErrorMessage('Failed to persist image order on server.');
    }
  };

  return (
    <Box>
      {/* Upload Zone */}
      <Box
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        sx={{
          border: '2px dashed',
          borderColor: isDragOver ? '#0d9488' : '#cbd5e1',
          backgroundColor: isDragOver ? 'rgba(13, 148, 136, 0.05)' : '#f8fafc',
          borderRadius: 3,
          p: 3,
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: '#0d9488',
            backgroundColor: 'rgba(13, 148, 136, 0.02)',
          },
          mb: 3,
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files)}
        />

        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            backgroundColor: '#ccfbf1',
            color: '#0d9488',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 1.5,
          }}
        >
          {isUploading ? <CircularProgress size={24} color="inherit" /> : <CloudUploadIcon />}
        </Box>

        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
          {isUploading ? 'Uploading to Cloudinary...' : 'Click or drag images here to upload'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Supports JPEG, PNG, and WebP (Up to 10MB each). First image is set as Primary.
        </Typography>
      </Box>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}

      {/* Gallery Grid */}
      {images.length > 0 && (
        <Grid container spacing={2}>
          {images.map((image, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={image.id}>
              <Card
                sx={{
                  position: 'relative',
                  borderRadius: 3,
                  border: image.isPrimary ? '2px solid #0d9488' : '1px solid #e2e8f0',
                  boxShadow: image.isPrimary ? '0 4px 14px rgba(13, 148, 136, 0.25)' : 'none',
                  overflow: 'hidden',
                }}
              >
                {/* Primary Chip */}
                {image.isPrimary && (
                  <Chip
                    icon={<StarIcon sx={{ color: '#ffffff !important' }} />}
                    label="Primary Cover"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      backgroundColor: '#0d9488',
                      color: '#ffffff',
                      fontWeight: 700,
                      zIndex: 2,
                    }}
                  />
                )}

                <CardMedia
                  component="img"
                  height="160"
                  image={image.imageUrl}
                  alt={`Property ${index + 1}`}
                  sx={{ objectFit: 'cover' }}
                />

                <CardActions sx={{ justifyContent: 'space-between', px: 1.5, py: 1 }}>
                  {/* Reorder Buttons */}
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Move Left">
                      <span>
                        <IconButton
                          size="small"
                          disabled={index === 0}
                          onClick={() => handleMoveImage(index, 'left')}
                        >
                          <ArrowBackIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Move Right">
                      <span>
                        <IconButton
                          size="small"
                          disabled={index === images.length - 1}
                          onClick={() => handleMoveImage(index, 'right')}
                        >
                          <ArrowForwardIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>

                  {/* Actions */}
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {!image.isPrimary && (
                      <Tooltip title="Make Primary Image">
                        <IconButton
                          size="small"
                          onClick={() => handleSetPrimary(image.id)}
                          color="primary"
                        >
                          <StarBorderIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}

                    <Tooltip title="Delete Image">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteConfirmImageId(image.id)}
                      >
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteConfirmImageId}
        title="Delete Property Image"
        message="Are you sure you want to delete this image? It will be removed from Cloudinary and this property."
        confirmText="Delete"
        isDestructive
        isLoading={isDeleting}
        onConfirm={handleDeleteImage}
        onCancel={() => setDeleteConfirmImageId(null)}
      />
    </Box>
  );
};
