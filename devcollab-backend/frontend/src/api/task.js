import api from './axiosInstance';

export const getTasks = (workspaceId) => api.get(`/api/workspaces/${workspaceId}/tasks`);
export const createTask = (workspaceId, data) => api.post(`/api/workspaces/${workspaceId}/tasks`, data);
