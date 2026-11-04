export interface StayCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isActive: boolean;
  displayOrder: number;
  propertyCount: number;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateStayCategoryRequest {
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export interface UpdateStayCategoryRequest {
  name: string;
  slug?: string;
  description?: string;
  isActive: boolean;
  displayOrder: number;
}

