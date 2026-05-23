import api from './axiosInstance';

export const getMessages = (channelId) => api.get(`/api/channels/${channelId}/messages`);
export const createMessage = (channelId, data) => api.post(`/api/channels/${channelId}/messages`, data);
