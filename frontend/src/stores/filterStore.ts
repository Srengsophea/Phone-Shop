import { create } from 'zustand';

interface FilterState {
  search: string;
  brand: string;
  category: string;
  minPrice: number | '';
  maxPrice: number | '';
  ram: string;
  storage: string;
  sort: string;
  inStock: boolean;
  onSale: boolean;
  page: number;

  setSearch: (search: string) => void;
  setBrand: (brand: string) => void;
  setCategory: (category: string) => void;
  setPriceRange: (min: number | '', max: number | '') => void;
  setRam: (ram: string) => void;
  setStorage: (storage: string) => void;
  setSort: (sort: string) => void;
  setInStock: (inStock: boolean) => void;
  setOnSale: (onSale: boolean) => void;
  setPage: (page: number) => void;
  resetFilters: () => void;
}

const initialFilters = {
  search: '',
  brand: '',
  category: '',
  minPrice: '' as const,
  maxPrice: '' as const,
  ram: '',
  storage: '',
  sort: 'featured',
  inStock: false,
  onSale: false,
  page: 1,
};

export const useFilterStore = create<FilterState>((set) => ({
  ...initialFilters,

  setSearch: (search) => set({ search, page: 1 }),
  setBrand: (brand) => set({ brand, page: 1 }),
  setCategory: (category) => set({ category, page: 1 }),
  setPriceRange: (minPrice, maxPrice) => set({ minPrice, maxPrice, page: 1 }),
  setRam: (ram) => set({ ram, page: 1 }),
  setStorage: (storage) => set({ storage, page: 1 }),
  setSort: (sort) => set({ sort, page: 1 }),
  setInStock: (inStock) => set({ inStock, page: 1 }),
  setOnSale: (onSale) => set({ onSale, page: 1 }),
  setPage: (page) => set({ page }),
  resetFilters: () => set({ ...initialFilters }),
}));
