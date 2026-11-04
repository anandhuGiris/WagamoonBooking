export interface ActivityImage {
  id: string;
  activityId: string;
  imageUrl: string;
  publicId?: string | null;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string;
}

export interface Activity {
  id: string;
  name: string;
  slug: string;
  description: string;
  location: string;
  duration?: string | null;
  price?: number | null;
  whatsAppNumber?: string | null;
  isActive: boolean;
  displayOrder: number;
  primaryImageUrl?: string | null;
  imageCount: number;
  createdAt: string;
  updatedAt?: string | null;
}

export interface ActivityDetail extends Activity {
  images: ActivityImage[];
}

export interface CreateActivityRequest {
  name: string;
  slug?: string;
  description: string;
  location: string;
  duration?: string;
  price?: number | null;
  whatsAppNumber?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export interface UpdateActivityRequest {
  name: string;
  slug?: string;
  description: string;
  location: string;
  duration?: string;
  price?: number | null;
  whatsAppNumber?: string;
  isActive: boolean;
  displayOrder: number;
}

