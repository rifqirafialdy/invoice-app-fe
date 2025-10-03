import axiosInstance from './axiosInstance';
import type { Product, ProductRequest, ProductsResponse } from '@/types/product';
import type { ApiResponse } from '@/types/api';

export const productApi = {
  getAll: (page: number = 0, size: number = 10, sortBy: string = 'createdAt', sortDir: string = 'desc') => {
    return axiosInstance.get<ApiResponse<ProductsResponse>>('/products', {
      params: { page, size, sortBy, sortDir }
    });
  },

  getById: (id: string) => {
    return axiosInstance.get<ApiResponse<Product>>(`/products/${id}`);
  },

  create: (data: ProductRequest) => {
    return axiosInstance.post<ApiResponse<Product>>('/products', data);
  },

  update: (id: string, data: ProductRequest) => {
    return axiosInstance.put<ApiResponse<Product>>(`/products/${id}`, data);
  },

  delete: (id: string) => {
    return axiosInstance.delete<ApiResponse<void>>(`/products/${id}`);
  },
};