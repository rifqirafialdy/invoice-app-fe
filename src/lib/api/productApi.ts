import axiosInstance from './axiosInstance';
import type { Product, ProductRequest, ProductsResponse } from '@/types/product';
import type { ApiResponse } from '@/types/api';

export const productApi = {
 getAll: (page: number = 0, size: number = 10, sortBy: string = 'createdAt', sortDir: string = 'desc', search?: string, type?: string) => {
  const params: any = { page, size, sortBy, sortDir };
  if (search) params.search = search;
  if (type) params.type = type;
  
  return axiosInstance.get<ApiResponse<ProductsResponse>>('/products', { params });
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