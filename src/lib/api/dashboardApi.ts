import axiosInstance from './axiosInstance';

export interface DashboardStats {
  totalRevenue: number;
  pendingAmount: number;
  paidAmount: number;
  overdueAmount: number;
  totalClients: number;
  totalInvoices: number;
  pendingInvoicesCount: number;
  paidInvoicesCount: number;
  overdueInvoicesCount: number;
}

export interface RecentInvoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  total: number;
  status: string;
  displayStatus: string;
  issueDate: string;
  dueDate: string;
}

export interface RecentActivity {
  id: string;
  type: 'INVOICE_CREATED' | 'INVOICE_PAID' | 'INVOICE_SENT' | 'CLIENT_ADDED';
  message: string;
  timestamp: string;
  invoiceNumber?: string;
  clientName?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const dashboardApi = {
  getStats: () => 
    axiosInstance.get<ApiResponse<DashboardStats>>('/dashboard/stats'),
  
  getRecentInvoices: (limit: number = 5) => 
    axiosInstance.get<ApiResponse<RecentInvoice[]>>(`/dashboard/recent-invoices?limit=${limit}`),
  
  getRecentActivity: (limit: number = 10) => 
    axiosInstance.get<ApiResponse<RecentActivity[]>>(`/dashboard/recent-activity?limit=${limit}`),
};