import { apiClient } from './client';
import { ApiResponse, PublicPropertyDto } from '../types/property';

export const propertyApi = {
  /**
   * Fetches all active properties from GET /api/public/properties
   */
  async getProperties(params?: { categoryId?: string; categorySlug?: string }): Promise<PublicPropertyDto[]> {
    const response = await apiClient.get<ApiResponse<PublicPropertyDto[]>>('/public/properties', {
      params,
    });
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  },

  /**
   * Fetches a single active property by ID from GET /api/public/properties/{id}
   */
  async getPropertyById(id: string): Promise<PublicPropertyDto> {
    const response = await apiClient.get<ApiResponse<PublicPropertyDto>>(`/public/properties/${id}`);
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data?.message || 'Property not found.');
  },
};
