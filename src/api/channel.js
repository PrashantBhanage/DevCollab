import axiosInstance from './axiosInstance';

export const getChannels = async (workspaceId) => {
  const response = await axiosInstance.get(`/api/workspaces/${workspaceId}/channels`);
  return response.data;
};

export const createChannel = async (workspaceId, name) => {
  const response = await axiosInstance.post(`/api/workspaces/${workspaceId}/channels`, { name });
  return response.data;
};

export const deleteChannel = async (channelId) => {
  const response = await axiosInstance.delete(`/api/channels/${channelId}`);
  return response.data;
};