export interface User {
  id: string;
  email: string;
  name: string;
  companyName?: string;
  isVerified?: boolean;
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