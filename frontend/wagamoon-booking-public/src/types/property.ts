export interface PublicPropertyImageDto {
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface PublicPropertyDto {
  id: string;
  name: string;
  description: string;
  location: string;
  bedrooms: number | null;
  bathrooms: number | null;
  maxGuests: number | null;
  images: PublicPropertyImageDto[];
  facilities: string[];
  whatsAppNumber: string;
  whatsAppUrl: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: { field: string; message: string }[] | null;
}

