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
import { activityApi } from '../../api/activityApi';
import { ActivityImage } from '../../types/Activity';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface ActivityImageUploaderProps {
  activityId: string;
  images: ActivityImage[];
  onImagesUpdated: (updatedImages: ActivityImage[]) => void;
}

export const ActivityImageUploader: React.FC<ActivityImageUploaderProps> = ({
  activityId,
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
      const res = await activityApi.uploadImages(activityId, validFiles);
      if (res.success && res.data) {
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
      const res = await activityApi.setPrimaryImage(activityId, imageId);
      if (res.success) {
        const updated = images.map((img) => ({
          ...img,
          isPrimary: img.id === imageId,
        }));
        onImagesUpdated(updated);
      }
    } catch {
      setErrorMessage('Failed to update primary image.');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmImageId) return;

    setIsDeleting(true);
    try {
      const res = await activityApi.deleteImage(activityId, deleteConfirmImageId);
      if (res.success) {
        const updated = images.filter((img) => img.id !== deleteConfirmImageId);
        onImagesUpdated(updated);
        setDeleteConfirmImageId(null);
      } else {
        setErrorMessage(res.message || 'Failed to delete image.');
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Error occurred while deleting image.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMove = async (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const newImages = [...images];
    const temp = newImages[index];
    newImages[index] = newImages[targetIndex];
    newImages[targetIndex] = temp;

    // Immediately update UI
    onImagesUpdated(newImages);

    try {
      await activityApi.reorderImages(
        activityId,
        newImages.map((img) => img.id)
      );
    } catch {
      setErrorMessage('Failed to save image order on server.');
    }
  };

  return (
    <Box>
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }} onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}

      {/* Upload Drag & Drop Area */}
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
        onClick={() => fileInputRef.current?.click()}
        sx={{
          border: '2px dashed',
          borderColor: isDragOver ? '#0d9488' : '#cbd5e1',
          borderRadius: 3,
          p: 4,
          textAlign: 'center',
          backgroundColor: isDragOver ? 'rgba(13, 148, 136, 0.05)' : '#f8fafc',
          cursor: isUploading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          mb: 4,
          '&:hover': {
            borderColor: '#0d9488',
            backgroundColor: 'rgba(13, 148, 136, 0.02)',
          },
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files)}
          disabled={isUploading}
        />

        {isUploading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
            <CircularProgress size={36} sx={{ color: '#0d9488' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
              Optimizing and uploading adventure images...
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Images are hosted on Cloudinary with auto WebP optimization.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: 'rgba(13, 148, 136, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0d9488',
                mb: 0.5,
              }}
            >
              <CloudUploadIcon />
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
              Click to upload or drag & drop high-resolution photos
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              PNG, JPG, or WebP up to 10MB each. First uploaded image automatically becomes the primary cover.
            </Typography>
            <Button
              variant="outlined"
              size="small"
              sx={{ mt: 1, borderColor: '#0d9488', color: '#0d9488', borderRadius: 2 }}
            >
              Browse Files
            </Button>
          </Box>
        )}
      </Box>

      {/* Uploaded Gallery Grid */}
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: '#0f172a' }}>
        Activity Photo Gallery ({images.length})
      </Typography>
      <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
        The star icon marks the primary cover image displayed on public cards. Use arrows to change presentation order.
      </Typography>

      {images.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6, backgroundColor: '#f8fafc', borderRadius: 3, border: '1px solid #e2e8f0' }}>
          <Typography variant="body2" color="text.secondary">
            No images uploaded yet. Upload at least one hero photograph to showcase this adventure activity.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {images.map((image, index) => (
            <Grid key={image.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  borderRadius: 2.5,
                  overflow: 'hidden',
                  border: image.isPrimary ? '2px solid #0d9488' : '1px solid #e2e8f0',
                  boxShadow: image.isPrimary ? '0 4px 16px rgba(13, 148, 136, 0.2)' : 'none',
                  position: 'relative',
                }}
              >
                {/* Badges */}
                <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 2, display: 'flex', gap: 0.5 }}>
                  {image.isPrimary && (
                    <Chip
                      label="Primary Cover"
                      size="small"
                      sx={{
                        backgroundColor: '#0d9488',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                      }}
                    />
                  )}
                  <Chip
                    label={`#${index + 1}`}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.7rem',
                    }}
                  />
                </Box>

                <CardMedia
                  component="img"
                  height="180"
                  image={image.imageUrl}
                  alt={`Activity photo ${index + 1}`}
                  sx={{ objectFit: 'cover' }}
                />

                <CardActions sx={{ justifyContent: 'space-between', px: 1.5, py: 1, backgroundColor: '#ffffff' }}>
                  <Box>
                    <Tooltip title="Move Earlier">
                      <span>
                        <IconButton
                          size="small"
                          disabled={index === 0}
                          onClick={() => handleMove(index, 'left')}
                        >
                          <ArrowBackIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Move Later">
                      <span>
                        <IconButton
                          size="small"
                          disabled={index === images.length - 1}
                          onClick={() => handleMove(index, 'right')}
                        >
                          <ArrowForwardIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>

                  <Box>
                    <Tooltip title={image.isPrimary ? 'Current Primary' : 'Set as Primary Cover'}>
                      <IconButton
                        size="small"
                        onClick={() => handleSetPrimary(image.id)}
                        sx={{ color: image.isPrimary ? '#f59e0b' : '#94a3b8' }}
                      >
                        {image.isPrimary ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Photo">
                      <IconButton
                        size="small"
                        onClick={() => setDeleteConfirmImageId(image.id)}
                        sx={{ color: '#ef4444' }}
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

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={Boolean(deleteConfirmImageId)}
        title="Delete Activity Image"
        message="Are you sure you want to permanently delete this photo? If stored on Cloudinary, it will be removed."
        confirmText="Delete"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmImageId(null)}
      />
    </Box>
  );
};
