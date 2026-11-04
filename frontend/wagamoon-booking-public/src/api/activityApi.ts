import { apiClient } from './client';
import { ApiResponse } from '../types/property';
import { PublicActivityDto } from '../types/activity';

export const activityApi = {
  /**
   * Fetches all active adventure activities from GET /api/public/activities
   */
  async getActivities(): Promise<PublicActivityDto[]> {
    const response = await apiClient.get<ApiResponse<PublicActivityDto[]>>('/public/activities');
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  },

  /**
   * Fetches a single active activity by ID from GET /api/public/activities/{id}
   */
  async getActivityById(id: string): Promise<PublicActivityDto> {
    const response = await apiClient.get<ApiResponse<PublicActivityDto>>(`/public/activities/${id}`);
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data?.message || 'Activity not found.');
  },
};

