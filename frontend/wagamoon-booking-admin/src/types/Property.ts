export type { Facility } from './Facility';
export type { PropertyImage } from './PropertyImage';
import { Facility } from './Facility';
import { PropertyImage } from './PropertyImage';

export type PropertyStatus = 'Draft' | 'Active' | 'Inactive';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ValidationError[];
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface Property {
  id: string;
  name: string;
  description: string;
  location: string;
  categoryId: string;
  categoryName?: string;
  categorySlug?: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  maxGuests?: number | null;
  whatsAppNumber: string;
  status: PropertyStatus;
  primaryImageUrl?: string | null;
  facilityCount: number;
  imageCount: number;
  createdAt: string;
  updatedAt?: string | null;
}

export interface PropertyDetail {
  id: string;
  name: string;
  description: string;
  location: string;
  categoryId: string;
  categoryName?: string;
  categorySlug?: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  maxGuests?: number | null;
  whatsAppNumber: string;
  status: PropertyStatus;
  createdAt: string;
  updatedAt?: string | null;
  images: PropertyImage[];
  facilities: Facility[];
  facilityIds: string[];
}

export interface CreatePropertyRequest {
  name: string;
  description: string;
  location: string;
  categoryId: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  maxGuests?: number | null;
  whatsAppNumber: string;
  status: PropertyStatus;
  facilityIds: string[];
}

export interface UpdatePropertyRequest {
  name: string;
  description: string;
  location: string;
  categoryId: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  maxGuests?: number | null;
  whatsAppNumber: string;
  status: PropertyStatus;
  facilityIds: string[];
}

export interface PublicPropertyImage {
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface PublicProperty {
  id: string;
  name: string;
  description: string;
  location: string;
  categoryId: string;
  categoryName?: string;
  categorySlug?: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  maxGuests?: number | null;
  images: PublicPropertyImage[];
  facilities: string[];
  whatsAppNumber: string;
  whatsAppUrl: string;
}

export interface DashboardStats {
  totalProperties: number;
  activeProperties: number;
  draftProperties: number;
  inactiveProperties: number;
  recentProperties: Property[];
}
