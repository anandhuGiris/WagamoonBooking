import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { getPropertyGalleryImages, getFullImageUrl, DEFAULT_FALLBACK_IMAGES } from '../../utils/imageHelper';
import { PublicPropertyDto } from '../../types/property';

export interface GalleryImageItem {
  url: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface ImageGalleryProps {
  property?: PublicPropertyDto;
  images?: GalleryImageItem[];
  propertyName?: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  property,
  images: propImages,
  propertyName,
}) => {
  let images: { url: string; isPrimary: boolean }[] = [];
  const title = property?.name || propertyName || 'Gallery';

  if (property) {
    images = getPropertyGalleryImages(property);
  } else if (propImages && propImages.length > 0) {
    images = propImages.map((img) => ({
      url: getFullImageUrl(img.url),
      isPrimary: !!img.isPrimary,
    }));
  } else {
    images = [{ url: DEFAULT_FALLBACK_IMAGES[0], isPrimary: true }];
  }

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handlePrev = useCallback(() => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, handlePrev, handleNext]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Main Spotlight Image */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 'clamp(320px, 50vw, 540px)',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          backgroundColor: '#EBE7DE',
          boxShadow: 'var(--shadow-lg)',
          cursor: 'pointer',
        }}
        onClick={() => setIsLightboxOpen(true)}
      >
        <img
          src={images[selectedIndex]?.url}
          alt={`${title} - View ${selectedIndex + 1}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform var(--transition-normal)',
          }}
        />

        {/* Expand / Lightbox Trigger */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsLightboxOpen(true);
          }}
          aria-label="View fullscreen gallery"
          style={{
            position: 'absolute',
            bottom: '16px',
            right: '16px',
            backgroundColor: 'rgba(18, 33, 24, 0.78)',
            color: '#FFFFFF',
            padding: '0.55rem 0.95rem',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            backdropFilter: 'blur(8px)',
            transition: 'background-color var(--transition-fast)',
          }}
        >
          <Maximize2 size={16} />
          <span>View Gallery ({images.length})</span>
        </button>

        {/* Carousel Arrow Controls (if multiple images) */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              aria-label="Previous photo"
              style={{
                position: 'absolute',
                top: '50%',
                left: '16px',
                transform: 'translateY(-50%)',
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: 'rgba(250, 248, 245, 0.92)',
                color: 'var(--color-primary-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-md)',
                backdropFilter: 'blur(6px)',
              }}
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              aria-label="Next photo"
              style={{
                position: 'absolute',
                top: '50%',
                right: '16px',
                transform: 'translateY(-50%)',
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: 'rgba(250, 248, 245, 0.92)',
                color: 'var(--color-primary-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-md)',
                backdropFilter: 'blur(6px)',
              }}
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Navigation Strip */}
      {images.length > 1 && (
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem',
          }}
        >
          {images.map((img, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                style={{
                  position: 'relative',
                  width: '90px',
                  height: '65px',
                  flexShrink: 0,
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  border: isSelected ? '2.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                  opacity: isSelected ? 1 : 0.65,
                  transition: 'all var(--transition-fast)',
                }}
              >
                <img
                  src={img.url}
                  alt={`Thumbnail ${idx + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Full-Screen Lightbox Modal */}
      {isLightboxOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'rgba(10, 20, 14, 0.96)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '1.5rem',
            backdropFilter: 'blur(16px)',
          }}
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Close Lightbox */}
          <button
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Close fullscreen gallery"
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              zIndex: 110,
            }}
          >
            <X size={24} />
          </button>

          {/* Lightbox Image Viewport */}
          <div
            style={{
              position: 'relative',
              maxWidth: '1200px',
              maxHeight: '82vh',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[selectedIndex]?.url}
              alt={`${title} - Fullscreen ${selectedIndex + 1}`}
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
              }}
            />

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  aria-label="Previous"
                  style={{
                    position: 'absolute',
                    left: '16px',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <ChevronLeft size={28} />
                </button>
                <button
                  onClick={handleNext}
                  aria-label="Next"
                  style={{
                    position: 'absolute',
                    right: '16px',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <ChevronRight size={28} />
                </button>
              </>
            )}
          </div>

          {/* Lightbox Caption / Counter */}
          <div
            style={{
              color: 'var(--color-sage-light)',
              marginTop: '1.25rem',
              fontSize: '0.92rem',
              fontWeight: 500,
            }}
          >
            {title} — Photo {selectedIndex + 1} of {images.length}
          </div>
        </div>
      )}
    </div>
  );
};

