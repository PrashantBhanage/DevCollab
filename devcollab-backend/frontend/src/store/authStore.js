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
        const { token, ...user } = response.data; // Assuming token is returned in response.data
        set({ user, token, isAuthenticated: true });
        return response.data;
      },

      register: async (credentials) => {
        const response = await authApi.register(credentials);
        return response.data;
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage', // key for localStorage
    }
  )
);

export default useAuthStore;
