import axios from 'axios';
import { getAccessToken, clearAuthStorage } from './authToken';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      clearAuthStorage();
      if (!window.location.pathname.match(/^\/(register)?$/)) {
        window.location.href = '/';
      }
    }
    const message = error.response?.data?.message || error.message;
    return Promise.reject(Object.assign(error, { message }));
  }
);

export default api;
