import axiosClient from './axiosClient';
import { Facility, CreateFacilityRequest, UpdateFacilityRequest } from '../types/Facility';
import { ApiResponse } from '../types/Property';

export const facilityApi = {
  getFacilities: async (activeOnly?: boolean): Promise<ApiResponse<Facility[]>> => {
    const response = await axiosClient.get<ApiResponse<Facility[]>>('/facilities', {
      params: activeOnly !== undefined ? { activeOnly } : undefined,
    });
    return response.data;
  },

  createFacility: async (data: CreateFacilityRequest): Promise<ApiResponse<Facility>> => {
    const response = await axiosClient.post<ApiResponse<Facility>>('/facilities', data);
    return response.data;
  },

  updateFacility: async (id: string, data: UpdateFacilityRequest): Promise<ApiResponse<Facility>> => {
    const response = await axiosClient.put<ApiResponse<Facility>>(`/facilities/${id}`, data);
    return response.data;
  },

  deleteFacility: async (id: string): Promise<ApiResponse<boolean>> => {
    const response = await axiosClient.delete<ApiResponse<boolean>>(`/facilities/${id}`);
    return response.data;
  },
};
