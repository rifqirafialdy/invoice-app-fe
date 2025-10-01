import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { authApi } from '@/lib/api/authApi';
import type { User, LoginRequest, RegisterRequest } from '@/types/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        login: async (data: LoginRequest) => {
          set({ isLoading: true, error: null });
          try {
            const response = await authApi.login(data);
            const userData = response.data.data;
            
            if (userData) {
              set({
                user: {
                  id: userData.userId,
                  email: userData.email,
                  name: userData.name,
                  companyName: userData.companyName,
                },
                isAuthenticated: true,
                isLoading: false,
              });
            }
          } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Login failed';
            set({ 
              isLoading: false, 
              error: errorMessage,
            });
            throw error;
          }
        },

        register: async (data: RegisterRequest) => {
          set({ isLoading: true, error: null });
          try {
            await authApi.register(data);
            set({ isLoading: false });
          } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Registration failed';
            set({ 
              isLoading: false, 
              error: errorMessage,
            });
            throw error;
          }
        },

        logout: async () => {
          try {
            await authApi.logout();
          } catch (error) {
            console.error('Logout error:', error);
          } finally {
            set({
              user: null,
              isAuthenticated: false,
              error: null,
            });
          }
        },

        clearError: () => set({ error: null }),
      }),
      { 
        name: 'auth-storage',
        partialize: (state) => ({ 
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  )
);