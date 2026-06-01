import { create } from 'zustand';
import toast from 'react-hot-toast';
import * as workspaceApi from '../api/workspace';
import * as channelApi from '../api/channel';
import * as messageApi from '../api/message';

const useWorkspaceStore = (create as any)((set: any, get: any) => ({
  workspaces: [],
  currentWorkspace: null,
  channels: [],
  currentChannel: null,
  messages: [],
  members: [],
  loading: false,
  error: null,

  fetchWorkspaces: async () => {
    set({ loading: true, error: null });
    try {
      const workspaces = await workspaceApi.getWorkspaces();
      set({ workspaces, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  setCurrentWorkspace: async (workspaceId) => {
    set({ loading: true, error: null });
    try {
      const workspace = await workspaceApi.getWorkspace(workspaceId);
      const channels = await channelApi.getChannels(workspaceId);
      let members = [];
      try {
        members = await workspaceApi.getMembers(workspaceId);
      } catch {
        members = [];
      }
      set({
        currentWorkspace: workspace,
        channels,
        members,
        loading: false,
      });

      if (channels.length > 0) {
        get().setCurrentChannel(channels[0].id);
      }
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createWorkspace: async (name, description) => {
    set({ loading: true, error: null });
    try {
      const workspace = await workspaceApi.createWorkspace(name, description);
      const workspaces = [...get().workspaces, workspace];
      set({ workspaces, currentWorkspace: workspace, loading: false });
      return workspace;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to create workspace';
      toast.error(msg);
      set({ error: msg, loading: false });
      return null;
    }
  },

  joinWorkspace: async (inviteCode) => {
    set({ loading: true, error: null });
    try {
      const workspace = await workspaceApi.joinWorkspace(inviteCode);
      await get().fetchWorkspaces();
      set({ loading: false });
      return workspace;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to join workspace';
      toast.error(msg);
      set({ error: msg, loading: false });
      return null;
    }
  },

  setCurrentChannel: async (channelId) => {
    set({ currentChannel: channelId, loading: true });
    try {
      const messages = await messageApi.getMessages(channelId);
      set({ messages, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  sendMessage: async (channelId, content, isCode = false) => {
    try {
      const message = await messageApi.sendMessage(channelId, content, isCode);
      const messages = [...get().messages, message];
      set({ messages });
      return message;
    } catch (error) {
      set({ error: error.message });
      return null;
    }
  },

  addChannel: async (name) => {
    const { currentWorkspace } = get();
    if (!currentWorkspace) return null;

    try {
      const channel = await channelApi.createChannel(currentWorkspace.id, name);
      const channels = [...get().channels, channel];
      set({ channels });
      return channel;
    } catch (error) {
      set({ error: error.message });
      return null;
    }
  },

  clearMessages: () => {
    set({ messages: [] });
  },

  clearError: () => {
    set({ error: null });
  },
}));

export default useWorkspaceStore;
