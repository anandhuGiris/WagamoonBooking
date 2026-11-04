import { apiClient } from './client';
import { ApiResponse } from '../types/property';
import { PublicStayCategoryDto } from '../types/category';

export const categoryApi = {
  /**
   * Fetches all active stay categories from GET /api/public/categories
   */
  async getCategories(): Promise<PublicStayCategoryDto[]> {
    const response = await apiClient.get<ApiResponse<PublicStayCategoryDto[]>>('/public/categories');
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  },
};

