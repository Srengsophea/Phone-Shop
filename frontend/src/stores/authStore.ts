import { create } from 'zustand';
import api from '../api/axios';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isAuthModalOpen: boolean;
  authModalMessage: string | null;
  openAuthModal: (message?: string) => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string, password_confirmation: string, phone?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('phonehub_token'),
  isAuthenticated: !!localStorage.getItem('phonehub_token'),
  isLoading: false,
  error: null,
  isAuthModalOpen: false,
  authModalMessage: null,

  openAuthModal: (message) => set({ isAuthModalOpen: true, authModalMessage: message || null, error: null }),
  closeAuthModal: () => set({ isAuthModalOpen: false, authModalMessage: null, error: null }),
  clearError: () => set({ error: null }),

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const guestSession = localStorage.getItem('phonehub_guest_session');
      const response = await api.post('/auth/login', {
        email,
        password,
        guest_session_id: guestSession,
      });

      const { user, token } = response.data.data;
      localStorage.setItem('phonehub_token', token);
      set({ user, token, isAuthenticated: true, isLoading: false, isAuthModalOpen: false, authModalMessage: null });
      return { success: true };
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed. Please verify credentials.';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  register: async (name, email, password, password_confirmation, phone) => {
    set({ isLoading: true, error: null });
    try {
      const guestSession = localStorage.getItem('phonehub_guest_session');
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        password_confirmation,
        phone,
        guest_session_id: guestSession,
      });

      const { user, token } = response.data.data;
      localStorage.setItem('phonehub_token', token);
      set({ user, token, isAuthenticated: true, isLoading: false, isAuthModalOpen: false, authModalMessage: null });
      return { success: true };
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed. Please check inputs.';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  logout: async () => {
    try {
      if (get().token) {
        await api.post('/auth/logout');
      }
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      localStorage.removeItem('phonehub_token');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  fetchUser: async () => {
    const token = localStorage.getItem('phonehub_token');
    if (!token) {
      set({ isAuthenticated: false, user: null });
      return;
    }

    set({ isLoading: true });
    try {
      const response = await api.get('/auth/user');
      set({ user: response.data.data, isAuthenticated: true, isLoading: false });
    } catch (err) {
      localStorage.removeItem('phonehub_token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put('/user/profile', data);
      set({ user: response.data.data, isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Update failed', isLoading: false });
      return false;
    }
  },
}));
