import axiosInstance from './axiosInstance';

export const getWorkspaces = async () => {
  const response = await axiosInstance.get('/api/workspaces');
  return response.data;
};

export const getWorkspace = async (id) => {
  const response = await axiosInstance.get(`/api/workspaces/${id}`);
  return response.data;
};

export const createWorkspace = async (name, description) => {
  const response = await axiosInstance.post('/api/workspaces', { name, description });
  return response.data;
};

export const joinWorkspace = async (inviteCode) => {
  const response = await axiosInstance.post('/api/workspaces/join', { inviteCode });
  return response.data;
};

export const getMembers = async (workspaceId) => {
  const response = await axiosInstance.get(`/api/workspaces/${workspaceId}/members`);
  return response.data;
};