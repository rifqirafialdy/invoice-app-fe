import axiosInstance from './axiosInstance';
import type { Client, ClientRequest, ClientsResponse } from '@/types/client';
import type { ApiResponse } from '@/types/api';

export const clientApi = {
  getAll: (page: number = 0, size: number = 10, sortBy: string = 'createdAt', sortDir: string = 'desc', search?: string) => {
    const params: any = { page, size, sortBy, sortDir };
    if (search) params.search = search;
    
    return axiosInstance.get<ApiResponse<ClientsResponse>>('/clients', { params });
  },

  getById: (id: string) => {
    return axiosInstance.get<ApiResponse<Client>>(`/clients/${id}`);
  },

  create: (data: ClientRequest) => {
    return axiosInstance.post<ApiResponse<Client>>('/clients', data);
  },

  update: (id: string, data: ClientRequest) => {
    return axiosInstance.put<ApiResponse<Client>>(`/clients/${id}`, data);
  },

  delete: (id: string) => {
    return axiosInstance.delete<ApiResponse<void>>(`/clients/${id}`);
  },
};