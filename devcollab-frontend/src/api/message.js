import axiosInstance from '../utils/axiosInstance';

export const getMessages = async (channelId) => {
  const response = await axiosInstance.get(`/api/channels/${channelId}/messages`);
  const page = response.data;
  const items = page.content ?? page;
  return items.map((msg) => ({
    ...msg,
    isCode: msg.type === 'CODE',
    timestamp: msg.createdAt,
  }));
};

export const sendMessage = async (channelId, content, isCode) => {
  const response = await axiosInstance.post(`/api/channels/${channelId}/messages`, {
    content,
    type: isCode ? 'CODE' : 'TEXT',
  });
  const msg = response.data;
  return {
    ...msg,
    isCode: msg.type === 'CODE',
    timestamp: msg.createdAt,
  };
};
