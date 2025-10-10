import axiosInstance from './axiosInstance';
import type { ApiResponse } from '@/types/api';

export const publicApi = {

  confirmPayment: (token: string) => {
    return axiosInstance.post<ApiResponse<void>>('/public/invoice/confirm-payment', null, {
        params: { token }
    });
  },
  
 
  requestCancellation: (token: string) => {
    return axiosInstance.post<ApiResponse<void>>('/public/invoice/request-cancel', null, {
        params: { token }
    });
  }
};