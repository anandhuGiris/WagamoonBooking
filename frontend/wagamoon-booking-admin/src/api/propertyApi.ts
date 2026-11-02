import axiosClient from './axiosClient';
import {
  ApiResponse,
  CreatePropertyRequest,
  DashboardStats,
  PagedResult,
  Property,
  PropertyDetail,
  PropertyStatus,
  PublicProperty,
  UpdatePropertyRequest,
} from '../types/Property';
import { PropertyImage } from '../types/PropertyImage';

export interface PropertyQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: PropertyStatus;
}

export const propertyApi = {
  getProperties: async (params?: PropertyQueryParams): Promise<ApiResponse<PagedResult<Property>>> => {
    const response = await axiosClient.get<ApiResponse<PagedResult<Property>>>('/properties', {
      params: {
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 10,
        search: params?.search || undefined,
        status: params?.status || undefined,
      },
    });
    return response.data;
  },

  getPropertyById: async (id: string): Promise<ApiResponse<PropertyDetail>> => {
    const response = await axiosClient.get<ApiResponse<PropertyDetail>>(`/properties/${id}`);
    return response.data;
  },

  createProperty: async (data: CreatePropertyRequest): Promise<ApiResponse<PropertyDetail>> => {
    const response = await axiosClient.post<ApiResponse<PropertyDetail>>('/properties', data);
    return response.data;
  },

  updateProperty: async (id: string, data: UpdatePropertyRequest): Promise<ApiResponse<PropertyDetail>> => {
    const response = await axiosClient.put<ApiResponse<PropertyDetail>>(`/properties/${id}`, data);
    return response.data;
  },

  deleteProperty: async (id: string): Promise<ApiResponse<boolean>> => {
    const response = await axiosClient.delete<ApiResponse<boolean>>(`/properties/${id}`);
    return response.data;
  },

  updatePropertyStatus: async (id: string, status: PropertyStatus): Promise<ApiResponse<boolean>> => {
    const response = await axiosClient.patch<ApiResponse<boolean>>(`/properties/${id}/status`, { status });
    return response.data;
  },

  uploadPropertyImages: async (
    propertyId: string,
    files: File[],
    isPrimary: boolean = false
  ): Promise<ApiResponse<PropertyImage[]>> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('isPrimary', String(isPrimary));

    const response = await axiosClient.post<ApiResponse<PropertyImage[]>>(
      `/properties/${propertyId}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  deletePropertyImage: async (propertyId: string, imageId: string): Promise<ApiResponse<boolean>> => {
    const response = await axiosClient.delete<ApiResponse<boolean>>(`/properties/${propertyId}/images/${imageId}`);
    return response.data;
  },

  setPrimaryImage: async (propertyId: string, imageId: string): Promise<ApiResponse<boolean>> => {
    const response = await axiosClient.put<ApiResponse<boolean>>(`/properties/${propertyId}/images/${imageId}/primary`);
    return response.data;
  },

  reorderImages: async (propertyId: string, imageIds: string[]): Promise<ApiResponse<boolean>> => {
    const response = await axiosClient.put<ApiResponse<boolean>>(`/properties/${propertyId}/images/reorder`, {
      imageIds,
    });
    return response.data;
  },

  getDashboardStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await axiosClient.get<ApiResponse<DashboardStats>>('/properties/dashboard/stats');
    return response.data;
  },

  // Public website simulation
  getPublicProperties: async (): Promise<ApiResponse<PublicProperty[]>> => {
    const response = await axiosClient.get<ApiResponse<PublicProperty[]>>('/public/properties');
    return response.data;
  },

  getPublicPropertyById: async (id: string): Promise<ApiResponse<PublicProperty>> => {
    const response = await axiosClient.get<ApiResponse<PublicProperty>>(`/public/properties/${id}`);
    return response.data;
  },
};
