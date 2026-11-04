import axiosClient from './axiosClient';
import { StayCategory, CreateStayCategoryRequest, UpdateStayCategoryRequest } from '../types/Category';
import { ApiResponse } from '../types/Property';

export const categoryApi = {
  getCategories: async (activeOnly?: boolean): Promise<ApiResponse<StayCategory[]>> => {
    const response = await axiosClient.get<ApiResponse<StayCategory[]>>('/categories', {
      params: activeOnly !== undefined ? { activeOnly } : undefined,
    });
    return response.data;
  },

  getCategoryById: async (id: string): Promise<ApiResponse<StayCategory>> => {
    const response = await axiosClient.get<ApiResponse<StayCategory>>(`/categories/${id}`);
    return response.data;
  },

  createCategory: async (data: CreateStayCategoryRequest): Promise<ApiResponse<StayCategory>> => {
    const response = await axiosClient.post<ApiResponse<StayCategory>>('/categories', data);
    return response.data;
  },

  updateCategory: async (id: string, data: UpdateStayCategoryRequest): Promise<ApiResponse<StayCategory>> => {
    const response = await axiosClient.put<ApiResponse<StayCategory>>(`/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: string): Promise<ApiResponse<boolean>> => {
    const response = await axiosClient.delete<ApiResponse<boolean>>(`/categories/${id}`);
    return response.data;
  },

  toggleCategoryStatus: async (id: string): Promise<ApiResponse<StayCategory>> => {
    const response = await axiosClient.patch<ApiResponse<StayCategory>>(`/categories/${id}/toggle-status`);
    return response.data;
  },
};

