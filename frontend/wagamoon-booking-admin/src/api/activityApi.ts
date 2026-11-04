import axiosClient from './axiosClient';
import {
  Activity,
  ActivityDetail,
  ActivityImage,
  CreateActivityRequest,
  UpdateActivityRequest,
} from '../types/Activity';
import { ApiResponse, PagedResult } from '../types/Property';

export const activityApi = {
  getActivities: async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    activeOnly?: boolean;
  }): Promise<ApiResponse<PagedResult<Activity>>> => {
    const response = await axiosClient.get<ApiResponse<PagedResult<Activity>>>('/activities', {
      params,
    });
    return response.data;
  },

  getActivityById: async (id: string): Promise<ApiResponse<ActivityDetail>> => {
    const response = await axiosClient.get<ApiResponse<ActivityDetail>>(`/activities/${id}`);
    return response.data;
  },

  createActivity: async (data: CreateActivityRequest): Promise<ApiResponse<ActivityDetail>> => {
    const response = await axiosClient.post<ApiResponse<ActivityDetail>>('/activities', data);
    return response.data;
  },

  updateActivity: async (id: string, data: UpdateActivityRequest): Promise<ApiResponse<ActivityDetail>> => {
    const response = await axiosClient.put<ApiResponse<ActivityDetail>>(`/activities/${id}`, data);
    return response.data;
  },

  deleteActivity: async (id: string): Promise<ApiResponse<boolean>> => {
    const response = await axiosClient.delete<ApiResponse<boolean>>(`/activities/${id}`);
    return response.data;
  },

  toggleActivityStatus: async (id: string): Promise<ApiResponse<ActivityDetail>> => {
    const response = await axiosClient.patch<ApiResponse<ActivityDetail>>(`/activities/${id}/toggle-status`);
    return response.data;
  },

  uploadImages: async (
    activityId: string,
    files: File[],
    isPrimary: boolean = false
  ): Promise<ApiResponse<ActivityImage[]>> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('isPrimary', isPrimary.toString());

    const response = await axiosClient.post<ApiResponse<ActivityImage[]>>(
      `/activities/${activityId}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  deleteImage: async (activityId: string, imageId: string): Promise<ApiResponse<boolean>> => {
    const response = await axiosClient.delete<ApiResponse<boolean>>(
      `/activities/${activityId}/images/${imageId}`
    );
    return response.data;
  },

  setPrimaryImage: async (activityId: string, imageId: string): Promise<ApiResponse<boolean>> => {
    const response = await axiosClient.put<ApiResponse<boolean>>(
      `/activities/${activityId}/images/${imageId}/primary`
    );
    return response.data;
  },

  reorderImages: async (activityId: string, imageIds: string[]): Promise<ApiResponse<boolean>> => {
    const response = await axiosClient.put<ApiResponse<boolean>>(
      `/activities/${activityId}/images/reorder`,
      { imageIds }
    );
    return response.data;
  },
};

