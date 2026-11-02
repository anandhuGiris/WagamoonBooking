export interface Facility {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateFacilityRequest {
  name: string;
}

export interface UpdateFacilityRequest {
  name: string;
  isActive: boolean;
}
