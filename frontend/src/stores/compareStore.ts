import { create } from 'zustand';
import { Product } from '../types';

interface CompareState {
  items: Product[];
  addToCompare: (product: Product) => boolean;
  removeFromCompare: (productId: number) => void;
  clearCompare: () => void;
  isInCompare: (productId: number) => boolean;
}

const getStoredCompare = (): Product[] => {
  try {
    const saved = localStorage.getItem('phonehub_compare');
    return saved ? JSON.parse(saved) : [];
  } catch (err) {
    return [];
  }
};

const saveCompare = (items: Product[]) => {
  try {
    localStorage.setItem('phonehub_compare', JSON.stringify(items));
  } catch (err) {
    // Ignore storage errors
  }
};

export const useCompareStore = create<CompareState>((set, get) => ({
  items: getStoredCompare(),

  addToCompare: (product) => {
    const { items } = get();
    if (items.some((p) => p.id === product.id)) {
      return false;
    }
    if (items.length >= 4) {
      alert('You can compare up to 4 smartphones simultaneously.');
      return false;
    }
    const updated = [...items, product];
    set({ items: updated });
    saveCompare(updated);
    return true;
  },

  removeFromCompare: (productId) => {
    const updated = get().items.filter((p) => p.id !== productId);
    set({ items: updated });
    saveCompare(updated);
  },

  clearCompare: () => {
    set({ items: [] });
    saveCompare([]);
  },

  isInCompare: (productId) => {
    return get().items.some((p) => p.id === productId);
  },
}));
