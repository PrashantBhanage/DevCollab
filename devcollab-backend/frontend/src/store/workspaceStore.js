import { create } from 'zustand';
import * as workspaceApi from '../api/workspace';
import * as channelApi from '../api/channel';
import * as messageApi from '../api/message';

const useWorkspaceStore = create((set, get) => ({
  workspaces: [],
  currentWorkspace: null,
  channels: [],
  currentChannel: null,
  messages: [],
  members: [],

  fetchWorkspaces: async () => {
    const res = await workspaceApi.getWorkspaces();
    set({ workspaces: res.data });
  },

  fetchWorkspaceDetails: async (id) => {
    const res = await workspaceApi.getWorkspace(id);
    set({ currentWorkspace: res.data });
    return res.data;
  },

  fetchChannels: async (workspaceId) => {
    const res = await channelApi.getChannels(workspaceId);
    set({ channels: res.data });
  },

  setCurrentChannel: (channel) => set({ currentChannel: channel }),

  fetchMessages: async (channelId) => {
    const res = await messageApi.getMessages(channelId);
    set({ messages: res.data });
  },

  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
}));

export default useWorkspaceStore;
