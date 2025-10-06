import { create } from 'zustand';
import { productApi } from '@/lib/api/productApi';
import { Product } from '@/types/product';

interface ProductState {
  products: Product[];
  totalPages: number;
  loading: boolean;
  lastFetch: number | null;
  lastParams: string | null;
  
  fetchProducts: (
    page: number,
    sortBy: string,
    sortDir: string,
    search?: string,
    type?: string
  ) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  invalidateCache: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  totalPages: 0,
  loading: false,
  lastFetch: null,
  lastParams: null,

  fetchProducts: async (page, sortBy, sortDir, search, type) => {
    const params = JSON.stringify({ page, sortBy, sortDir, search, type });
    const now = Date.now();
    const { lastFetch, lastParams, loading } = get();

    if (lastParams === params && lastFetch && now - lastFetch < 30000) {
      console.log('Using cached products');
      return;
    }

    if (loading) return;

    set({ loading: true });
    
    try {
      const response = await productApi.getAll(
        page,
        10,
        sortBy,
        sortDir,
        search || undefined,
        type !== 'ALL' ? type : undefined
      );
      
      set({
        products: response.data.data.content,
        totalPages: response.data.data.totalPages,
        loading: false,
        lastFetch: now,
        lastParams: params,
      });
    } catch (error) {
      console.error('Failed to fetch products:', error);
      set({ loading: false });
    }
  },

  deleteProduct: async (id: string) => {
    try {
      await productApi.delete(id);
      get().invalidateCache();
    } catch (error) {
      console.error('Failed to delete product:', error);
      throw error;
    }
  },

  invalidateCache: () => {
    set({ lastFetch: null, lastParams: null });
  },
}));