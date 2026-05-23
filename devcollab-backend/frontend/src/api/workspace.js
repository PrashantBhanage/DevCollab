import api from './axiosInstance';

export const getWorkspaces = () => api.get('/api/workspaces');
export const getWorkspace = (id) => api.get(`/api/workspaces/${id}`);
export const createWorkspace = (data) => api.post('/api/workspaces', data);
export const joinWorkspace = (data) => api.post('/api/workspaces/join', data);
