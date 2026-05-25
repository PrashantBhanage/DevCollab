import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as authApi from '../api/auth';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (credentials) => {
        const response = await authApi.login(credentials);
        const { token, ...user } = response.data;
        localStorage.setItem('token', response.data.token);
        set({ user, token, isAuthenticated: true });
        return response.data;
      },

      register: async (credentials) => {
        const response = await authApi.register(credentials);
        const { token, ...user } = response.data;
        localStorage.setItem('token', response.data.token);
        set({ user, token, isAuthenticated: true });
        return response.data;
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage', // key for localStorage
    }
  )
);

export default useAuthStore;
