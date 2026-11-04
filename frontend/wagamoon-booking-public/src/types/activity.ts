export interface PublicActivityImageDto {
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface PublicActivityDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  location: string;
  duration?: string | null;
  price?: number | null;
  whatsAppNumber?: string | null;
  whatsAppUrl: string;
  images: PublicActivityImageDto[];
}

