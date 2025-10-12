import axiosInstance from './axiosInstance';
import type { User, UserUpdateRequest, ChangePasswordRequest, EmailChangeRequest } from '@/types/auth';
import type { ApiResponse } from '@/types/api';

export const userApi = {
  getCurrentUser: () => {
    return axiosInstance.get<ApiResponse<User>>('/user/me');
  },

  updateProfile: (data: UserUpdateRequest) => {
    return axiosInstance.patch<ApiResponse<User>>('/user/me', data);
  },
  
  changePassword: (data: ChangePasswordRequest) => {
    return axiosInstance.put<ApiResponse<void>>('/user/change-password', data);
  },

  uploadLogo: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return axiosInstance.post<ApiResponse<string>>('/user/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  requestEmailChange: (data: EmailChangeRequest) => {
    return axiosInstance.post<ApiResponse<string>>('/user/change-email', data);
  },

  verifyEmailChange: (token: string) => {
    return axiosInstance.get<ApiResponse<string>>(`/user/verify-email-change?token=${token}`);
  },
};