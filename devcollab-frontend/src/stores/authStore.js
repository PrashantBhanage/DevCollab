import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as authApi from '../api/auth';
import { setAccessToken, clearAuthStorage } from '../utils/authToken';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      loading: false,
      error: null,
      _hasHydrated: false,

      setCredentials: (token, user) => {
        setAccessToken(token);
        set({ token, user });
      },

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const response = await authApi.loginUser({ email, password });
          const { token, ...userData } = response.data;
          setAccessToken(token);
          set({ token, user: userData, loading: false });
          return true;
        } catch (error) {
          set({ error: error.message || 'Login failed', loading: false });
          return false;
        }
      },

      register: async (name, email, password) => {
        set({ loading: true, error: null });
        try {
          const response = await authApi.registerUser({ name, email, password });
          const { token, ...userData } = response.data;
          setAccessToken(token);
          set({ token, user: userData, loading: false });
          return true;
        } catch (error) {
          set({ error: error.message || 'Registration failed', loading: false });
          return false;
        }
      },

      logout: () => {
        clearAuthStorage();
        set({ user: null, token: null });
      },

      clearError: () => {
        set({ error: null });
      },

      setHasHydrated: (value) => {
        set({ _hasHydrated: value });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          setAccessToken(state.token);
        }
      },
    }
  )
);

export default useAuthStore;
