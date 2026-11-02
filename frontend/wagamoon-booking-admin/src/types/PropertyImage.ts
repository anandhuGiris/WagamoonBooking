export interface PropertyImage {
  id: string;
  propertyId: string;
  imageUrl: string;
  publicId?: string | null;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string;
}
