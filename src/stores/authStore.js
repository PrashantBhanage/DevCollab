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
          const response = await authApi.login(email, password);
          const { token, ...user } = response;
          set({ token, user, loading: false });
          return true;
        } catch (error) {
          set({ error: error.response?.data?.message || 'Login failed', loading: false });
          return false;
        }
      },

      register: async (name, email, password) => {
        set({ loading: true, error: null });
        try {
          const response = await authApi.register(name, email, password);
          const { token, ...user } = response;
          set({ token, user, loading: false });
          return true;
        } catch (error) {
          set({ error: error.response?.data?.message || 'Registration failed', loading: false });
          return false;
        }
      },

      logout: () => {
        set({ user: null, token: null });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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