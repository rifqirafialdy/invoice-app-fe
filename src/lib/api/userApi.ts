import axiosInstance from './axiosInstance';

export const userApi = {
  getCurrentUser: () => {
    return axiosInstance.get('/auth/me');
  },
};