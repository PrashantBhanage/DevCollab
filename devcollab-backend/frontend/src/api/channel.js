import api from './axiosInstance';

export const getChannels = (workspaceId) => api.get(`/api/workspaces/${workspaceId}/channels`);
export const createChannel = (workspaceId, data) => api.post(`/api/workspaces/${workspaceId}/channels`, data);
