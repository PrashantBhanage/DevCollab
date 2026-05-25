import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as authApi from '../api/auth';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      error: null,

      setCredentials: (token, user) => {
        set({ token, user });
      },

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const response = await authApi.loginUser({ email, password });
          const { token, ...userData } = response.data;
          localStorage.setItem('token', token);
          set({ token, user: userData, loading: false });
          return true;
        } catch (error) {
          set({ error: error.response?.data?.message || 'Login failed', loading: false });
          return false;
        }
      },

      register: async (name, email, password) => {
        set({ loading: true, error: null });
        try {
          const response = await authApi.registerUser({ name, email, password });
          const { token, ...userData } = response.data;
          localStorage.setItem('token', token);
          set({ token, user: userData, loading: false });
          return true;
        } catch (error) {
          set({ error: error.response?.data?.message || 'Registration failed', loading: false });
          return false;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);

export default useAuthStore;