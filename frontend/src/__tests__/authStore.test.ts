import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../stores/authStore';

describe('AuthStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  it('should initialize with unauthenticated state when token is absent', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should set and clear error state', () => {
    useAuthStore.setState({ error: 'Invalid credentials' });
    expect(useAuthStore.getState().error).toBe('Invalid credentials');

    useAuthStore.getState().clearError();
    expect(useAuthStore.getState().error).toBeNull();
  });

  it('should recognize authenticated status when user and token are set', () => {
    useAuthStore.setState({
      user: {
        id: 1,
        name: 'Super Admin',
        email: 'admin@example.com',
        role: 'admin',
      },
      token: 'mock-sanctum-token-12345',
      isAuthenticated: true,
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.name).toBe('Super Admin');
    expect(state.user?.role).toBe('admin');
  });
});
