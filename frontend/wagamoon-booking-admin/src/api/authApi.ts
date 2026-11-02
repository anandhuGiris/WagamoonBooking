import axiosClient from './axiosClient';
import { ApiResponse } from '../types/Property';
import { LoginRequest, LoginResponse, User } from '../types/User';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await axiosClient.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    return response.data;
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await axiosClient.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },
};
