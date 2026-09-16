import { create } from 'zustand';
import api from '../api/axios';
import { Cart } from '../types';

interface CartState {
  cart: Cart;
  isLoading: boolean;
  isCartOpen: boolean;
  couponError: string | null;
  fetchCart: () => Promise<void>;
  addItem: (productId: number, variantId?: number | null, quantity?: number) => Promise<{ success: boolean; message?: string }>;
  updateQuantity: (itemId: number, quantity: number) => Promise<boolean>;
  removeItem: (itemId: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  applyCoupon: (code: string) => Promise<{ success: boolean; message?: string }>;
  removeCoupon: () => Promise<boolean>;
  toggleCart: (isOpen?: boolean) => void;
}

const initialCart: Cart = {
  items: [],
  subtotal: 0,
  discount_amount: 0,
  shipping_fee: 0,
  tax_amount: 0,
  total_amount: 0,
  coupon: null,
};

export const useCartStore = create<CartState>((set, get) => ({
  cart: initialCart,
  isLoading: false,
  isCartOpen: false,
  couponError: null,

  toggleCart: (isOpen) => {
    set((state) => ({
      isCartOpen: typeof isOpen === 'boolean' ? isOpen : !state.isCartOpen,
    }));
  },

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/cart');
      set({ cart: response.data.data, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
    }
  },

  addItem: async (productId, variantId = null, quantity = 1) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/cart/items', {
        product_id: productId,
        variant_id: variantId,
        quantity,
      });
      set({ cart: response.data.data, isLoading: false, isCartOpen: true });
      return { success: true };
    } catch (err: any) {
      set({ isLoading: false });
      const message = err.response?.data?.message || 'Failed to add item to cart.';
      return { success: false, message };
    }
  },

  updateQuantity: async (itemId, quantity) => {
    if (quantity <= 0) {
      return get().removeItem(itemId);
    }
    set({ isLoading: true });
    try {
      const response = await api.put(`/cart/items/${itemId}`, { quantity });
      set({ cart: response.data.data, isLoading: false });
      return true;
    } catch (err) {
      set({ isLoading: false });
      return false;
    }
  },

  removeItem: async (itemId) => {
    set({ isLoading: true });
    try {
      const response = await api.delete(`/cart/items/${itemId}`);
      set({ cart: response.data.data, isLoading: false });
      return true;
    } catch (err) {
      set({ isLoading: false });
      return false;
    }
  },

  clearCart: async () => {
    set({ isLoading: true });
    try {
      await api.delete('/cart');
      set({ cart: initialCart, isLoading: false });
      return true;
    } catch (err) {
      set({ isLoading: false });
      return false;
    }
  },

  applyCoupon: async (code) => {
    set({ isLoading: true, couponError: null });
    try {
      const response = await api.post('/cart/coupon', { code });
      set({ cart: response.data.data, isLoading: false });
      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid or expired coupon.';
      set({ couponError: msg, isLoading: false });
      return { success: false, message: msg };
    }
  },

  removeCoupon: async () => {
    set({ isLoading: true, couponError: null });
    try {
      const response = await api.delete('/cart/coupon');
      set({ cart: response.data.data, isLoading: false });
      return true;
    } catch (err) {
      set({ isLoading: false });
      return false;
    }
  },
}));
