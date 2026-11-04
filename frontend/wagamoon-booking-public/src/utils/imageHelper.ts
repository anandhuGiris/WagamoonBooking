import { PublicPropertyDto } from '../types/property';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://wagamoonbooking.onrender.com/api';

// Curated high-res resort photography fallbacks matching Wagamon's landscape
export const DEFAULT_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1600&q=85',
];

/**
 * Normalizes an image URL from the API. Handles relative local paths as well as absolute Cloudinary URLs.
 */
export function getFullImageUrl(rawUrl?: string, fallbackIndex = 0): string {
  if (!rawUrl || typeof rawUrl !== 'string' || rawUrl.trim() === '') {
    return DEFAULT_FALLBACK_IMAGES[fallbackIndex % DEFAULT_FALLBACK_IMAGES.length];
  }

  const trimmed = rawUrl.trim();

  // If already absolute (http:// or https://)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // If relative path from local static upload (e.g. /uploads/abc.jpg)
  const base = API_BASE_URL.replace(/\/api\/?$/, '');
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${base}${cleanPath}`;
}

/**
 * Returns a deterministic fallback image based on an optional name/seed string.
 */
export function getPropertyFallbackImage(seed?: string): string {
  if (!seed) return DEFAULT_FALLBACK_IMAGES[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % DEFAULT_FALLBACK_IMAGES.length;
  return DEFAULT_FALLBACK_IMAGES[index];
}

/**
 * Returns the primary image for an activity or fallback.
 */
export function getActivityPrimaryImage(activity: { images?: { url: string; isPrimary?: boolean; sortOrder?: number }[]; name?: string }): string {
  if (!activity.images || activity.images.length === 0) {
    return getPropertyFallbackImage(activity.name);
  }
  const primary = activity.images.find((img) => img.isPrimary);
  if (primary && primary.url) {
    return getFullImageUrl(primary.url);
  }
  const first = activity.images[0];
  return getFullImageUrl(first?.url, 0);
}

/**
 * Returns the primary image for a property, or the first sorted image, or a fallback.
 */
export function getPropertyPrimaryImage(property: PublicPropertyDto): string {
  if (!property.images || property.images.length === 0) {
    return DEFAULT_FALLBACK_IMAGES[0];
  }

  const primary = property.images.find((img) => img.isPrimary);
  if (primary && primary.url) {
    return getFullImageUrl(primary.url);
  }

  const firstSorted = [...property.images].sort((a, b) => a.sortOrder - b.sortOrder)[0];
  return getFullImageUrl(firstSorted?.url);
}

/**
 * Returns sorted list of all image URLs for a property.
 */
export function getPropertyGalleryImages(property: PublicPropertyDto): { url: string; isPrimary: boolean }[] {
  if (!property.images || property.images.length === 0) {
    return [{ url: DEFAULT_FALLBACK_IMAGES[0], isPrimary: true }];
  }

  return [...property.images]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((img) => ({
      url: getFullImageUrl(img.url),
      isPrimary: img.isPrimary,
    }));
}
