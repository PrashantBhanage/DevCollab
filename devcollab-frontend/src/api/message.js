import axiosInstance from '../utils/axiosInstance';

export const getMessages = async (channelId) => {
  const response = await axiosInstance.get(`/api/channels/${channelId}/messages`);
  return response.data;
};

export const sendMessage = async (channelId, content, isCode) => {
  const response = await axiosInstance.post(`/api/channels/${channelId}/messages`, { content, isCode });
  return response.data;
};