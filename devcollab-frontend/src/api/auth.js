import api from '../utils/axiosInstance';

export const registerUser = (data) => api.post('/api/auth/register', data);
export const loginUser = (data) => api.post('/api/auth/login', data);
export const getCurrentUser = () => api.get('/api/auth/me');
