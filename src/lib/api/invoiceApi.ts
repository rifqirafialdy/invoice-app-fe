import axiosInstance from './axiosInstance';
import type { Invoice, InvoiceRequest, InvoicesResponse } from '@/types/invoice';
import type { ApiResponse } from '@/types/api';

export const invoiceApi = {
  getAll: (
    page: number = 0, 
    size: number = 10, 
    sortBy: string = 'createdAt', 
    sortDir: string = 'desc', 
    search?: string, 
    status?: string,
    isRecurring?: string
  ) => {
    const params: any = { page, size, sortBy, sortDir };
    if (search) params.search = search;
    if (status) params.status = status;
    if (isRecurring) params.isRecurring = isRecurring;

    return axiosInstance.get<ApiResponse<InvoicesResponse>>('/invoices', { params });
  },

  getById: (id: string) => {
    return axiosInstance.get<ApiResponse<Invoice>>(`/invoices/${id}`);
  },

  create: (data: InvoiceRequest) => {
    return axiosInstance.post<ApiResponse<Invoice>>('/invoices', data);
  },

  update: (id: string, data: InvoiceRequest) => {
    return axiosInstance.put<ApiResponse<Invoice>>(`/invoices/${id}`, data);
  },

  delete: (id: string) => {
    return axiosInstance.delete<ApiResponse<void>>(`/invoices/${id}`);
  },

  stopRecurring: (id: string) => {
    return axiosInstance.patch<ApiResponse<Invoice>>(`/invoices/${id}/stop-recurring`);
  },
};