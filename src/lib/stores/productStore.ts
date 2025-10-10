import { create } from 'zustand';
import { productApi } from '@/lib/api/productApi';
import { Product } from '@/types/product';

interface ProductState {
  products: Product[];
  totalPages: number;
  loading: boolean;
  
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

  fetchProducts: async (page, sortBy, sortDir, search, type) => {
    // Frontend caching logic has been removed.
    
    const { loading } = get();
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
      });
    } catch (error) {
      console.error('Failed to fetch products:', error);
      set({ loading: false });
    }
  },

  deleteProduct: async (id: string) => {
    try {
      await productApi.delete(id);
    } catch (error) {
      console.error('Failed to delete product:', error);
      throw error;
    }
  },

  // This function is no longer necessary but is kept to avoid errors.
  invalidateCache: () => {
    // This function is now empty.
  },
}));