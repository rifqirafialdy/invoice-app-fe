import { create } from 'zustand';
import { clientApi } from '@/lib/api/clientApi';
import { Client } from '@/types/client';

interface ClientState {
  clients: Client[];
  totalPages: number;
  loading: boolean;
  
  fetchClients: (
    page: number,
    sortBy: string,
    sortDir: string,
    search?: string
  ) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  invalidateCache: () => void;
}

export const useClientStore = create<ClientState>((set, get) => ({
  clients: [],
  totalPages: 0,
  loading: false,

  fetchClients: async (page, sortBy, sortDir, search) => {

    const { loading } = get();
    if (loading) return;

    set({ loading: true });
    
    try {
      const response = await clientApi.getAll(
        page,
        10,
        sortBy,
        sortDir,
        search || undefined
      );
      
      set({
        clients: response.data.data.content,
        totalPages: response.data.data.totalPages,
        loading: false,
      });
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      set({ loading: false });
    }
  },

  deleteClient: async (id: string) => {
    try {
      await clientApi.delete(id);
    } catch (error) {
      console.error('Failed to delete client:', error);
      throw error;
    }
  },

  invalidateCache: () => {
  },
}));