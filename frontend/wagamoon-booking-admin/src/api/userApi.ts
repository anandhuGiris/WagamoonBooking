import axiosClient from './axiosClient';
import { AdminUser, CreateAdminRequest, UpdateAdminRequest } from '../types/User';
import { ApiResponse } from '../types/Property';

export const userApi = {
  getAdmins: async (): Promise<ApiResponse<AdminUser[]>> => {
    const response = await axiosClient.get<ApiResponse<AdminUser[]>>('/users');
    return response.data;
  },

  getAdminById: async (id: string): Promise<ApiResponse<AdminUser>> => {
    const response = await axiosClient.get<ApiResponse<AdminUser>>(`/users/${id}`);
    return response.data;
  },

  createAdmin: async (data: CreateAdminRequest): Promise<ApiResponse<AdminUser>> => {
    const response = await axiosClient.post<ApiResponse<AdminUser>>('/users', data);
    return response.data;
  },

  updateAdmin: async (id: string, data: UpdateAdminRequest): Promise<ApiResponse<AdminUser>> => {
    const response = await axiosClient.put<ApiResponse<AdminUser>>(`/users/${id}`, data);
    return response.data;
  },

  toggleStatus: async (id: string): Promise<ApiResponse<boolean>> => {
    const response = await axiosClient.put<ApiResponse<boolean>>(`/users/${id}/toggle-status`);
    return response.data;
  },

  deleteAdmin: async (id: string): Promise<ApiResponse<boolean>> => {
    const response = await axiosClient.delete<ApiResponse<boolean>>(`/users/${id}`);
    return response.data;
  },
};
