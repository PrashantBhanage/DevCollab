import api from './axiosInstance';

export const getConversations = () => api.get('/api/ai/conversations');
export const createConversation = (data) => api.post('/api/ai/conversations', data);
export const getAiMessages = (conversationId) => api.get(`/api/ai/conversations/${conversationId}/messages`);
export const sendAiMessage = (conversationId, data) => api.post(`/api/ai/conversations/${conversationId}/messages`, data);
