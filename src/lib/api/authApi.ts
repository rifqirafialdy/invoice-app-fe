import axiosInstance from './axiosInstance';
import type { LoginRequest, RegisterRequest, AuthResponse } from '@/types/auth';
import type { ApiResponse } from '@/types/api';

export const authApi = {
  register: (data: RegisterRequest) => {
    return axiosInstance.post<AuthResponse>('/auth/register', data);
  },

  login: (data: LoginRequest) => {
    return axiosInstance.post<AuthResponse>('/auth/login', data);
  },

  logout: () => {
    return axiosInstance.post<AuthResponse>('/auth/logout');
  },

  verifyEmail: (token: string) => {
    return axiosInstance.post<AuthResponse>('/auth/verify-email', { token });
  },

  sendVerification: () => {
    return axiosInstance.post<AuthResponse>('/auth/send-verification');
  },
    forgotPassword: (email: string) => {
    return axiosInstance.post<ApiResponse<string>>('/auth/forgot-password', { email });
  },

  resetPassword: (data: { token: string; newPassword: string; confirmPassword: string }) => {
    return axiosInstance.post<ApiResponse<string>>('/auth/reset-password', data);
  },

};