import axiosInstance from './axiosInstance';

export const getConversations = async (workspaceId) => {
  const response = await axiosInstance.get(`/api/ai/conversations?workspaceId=${workspaceId}`);
  return response.data;
};

export const createConversation = async (workspaceId, title) => {
  const response = await axiosInstance.post('/api/ai/conversations', { workspaceId, title });
  return response.data;
};

export const getMessages = async (conversationId) => {
  const response = await axiosInstance.get(`/api/ai/conversations/${conversationId}/messages`);
  return response.data;
};

export const sendMessage = async (conversationId, message) => {
  const response = await axiosInstance.post(`/api/ai/conversations/${conversationId}/messages`, { message });
  return response.data;
};