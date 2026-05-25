import axiosInstance from '../utils/axiosInstance';

export const getTasks = async (workspaceId) => {
  const response = await axiosInstance.get(`/api/workspaces/${workspaceId}/tasks`);
  return response.data;
};

export const createTask = async (workspaceId, title, description) => {
  const response = await axiosInstance.post(`/api/workspaces/${workspaceId}/tasks`, { title, description });
  return response.data;
};

export const updateTask = async (taskId, status) => {
  const response = await axiosInstance.put(`/api/tasks/${taskId}`, { status });
  return response.data;
};

export const deleteTask = async (taskId) => {
  const response = await axiosInstance.delete(`/api/tasks/${taskId}`);
  return response.data;
};