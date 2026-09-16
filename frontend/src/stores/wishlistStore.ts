import { create } from 'zustand';
import api from '../api/axios';
import { WishlistItem } from '../types';

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
  toggleWishlist: (productId: number) => Promise<boolean>;
  isInWishlist: (productId: number) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  isLoading: false,

  fetchWishlist: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/wishlist');
      set({ items: response.data.data, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
    }
  },

  toggleWishlist: async (productId) => {
    const isPresent = get().isInWishlist(productId);
    try {
      if (isPresent) {
        await api.delete(`/wishlist/${productId}`);
        set((state) => ({
          items: state.items.filter((item) => item.product_id !== productId),
        }));
      } else {
        const response = await api.post('/wishlist', { product_id: productId });
        set((state) => ({
          items: [response.data.data, ...state.items],
        }));
      }
      return true;
    } catch (err) {
      return false;
    }
  },

  isInWishlist: (productId) => {
    return get().items.some((item) => item.product_id === productId);
  },
}));
