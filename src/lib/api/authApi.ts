import axiosInstance from './axiosInstance';
import type { LoginRequest, RegisterRequest, AuthResponse } from '@/types/auth';

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
};