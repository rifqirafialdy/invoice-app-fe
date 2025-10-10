import { create } from 'zustand';
import { invoiceApi } from '@/lib/api/invoiceApi';
import { Invoice } from '@/types/invoice';

interface InvoiceState {
  invoices: Invoice[];
  totalPages: number;
  loading: boolean;
  lastFetch: number | null;
  lastParams: string | null;
    fetchInvoices: (
    page: number,
    sortBy: string,
    sortDir: string,
    search?: string,
    status?: string,
    isRecurring?: string
  ) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  stopRecurringInvoice: (id: string) => Promise<void>;
  invalidateCache: () => void;
}

export const useInvoiceStore = create<InvoiceState>((set, get) => ({
  invoices: [],
  totalPages: 0,
  loading: false,
  lastFetch: null,
  lastParams: null,

  fetchInvoices: async (page, sortBy, sortDir, search, status, isRecurring) => {
    const params = JSON.stringify({ page, sortBy, sortDir, search, status, isRecurring });
    const now = Date.now();
    const { lastFetch, lastParams, loading } = get();
    if (lastParams === params && lastFetch && now - lastFetch < 30000) {
      console.log('Using cached invoices');
      return;
    }

    if (loading) return;

    set({ loading: true });
    
    try {
      const response = await invoiceApi.getAll(
        page,
        10,
        sortBy,
        sortDir,
        search || undefined,
        status !== 'ALL' ? status : undefined,
        isRecurring !== 'ALL' ? isRecurring : undefined

      );
      
      set({
        invoices: response.data.data.content,
        totalPages: response.data.data.totalPages,
        loading: false,
        lastFetch: now,
        lastParams: params,
      });
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      set({ loading: false });
    }
  },

  deleteInvoice: async (id: string) => {
    try {
      await invoiceApi.delete(id);
      get().invalidateCache();
    } catch (error) {
      console.error('Failed to delete invoice:', error);
      throw error;
    }
  },

  stopRecurringInvoice: async (id: string) => {
    try {
      await invoiceApi.stopRecurring(id);
      get().invalidateCache();
    } catch (error) {
      console.error('Failed to stop recurring invoice:', error);
      throw error;
    }
  },

  invalidateCache: () => {
    set({ lastFetch: null, lastParams: null });
  },
}));