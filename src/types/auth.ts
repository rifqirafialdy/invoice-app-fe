export interface User {
  id: string;
  email: string;
  name: string;
  companyName?: string;
  isVerified?: boolean;
  logoUrl?: string; 
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  companyName: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    userId: string;
    email: string;
    name: string;
    companyName?: string;
    logoUrl?: string; 
    accessToken?: string;
    refreshToken?: string;
    isVerified?: boolean; 
  };
  error?: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface UserUpdateRequest {
  name: string;
  companyName: string;
  phone?: string;
  address?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface EmailChangeRequest {
  newEmail: string;
}
