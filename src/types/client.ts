export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  paymentPreferences?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientRequest {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  paymentPreferences?: string;
}

export interface ClientsResponse {
  content: Client[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}