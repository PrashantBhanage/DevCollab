import { create } from 'zustand';
import toast from 'react-hot-toast';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import * as workspaceApi from '../api/workspace';
import * as channelApi from '../api/channel';
import * as messageApi from '../api/message';
import * as taskApi from '../api/task';
import { getAccessToken } from '../utils/authToken';

const useWorkspaceStore = (create as any)((set: any, get: any) => ({
  workspaces: [],
  currentWorkspace: null,
  channels: [],
  currentChannel: null,
  messages: [],
  members: [],
  tasks: [],
  loading: false,
  error: null,
  
  stompClient: null,
  onlineUsers: new Set(),
  typingUsers: {}, // { channelId: { userId: timestamp } }

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
      const tasks = await taskApi.getTasks(workspaceId);
      let members = [];
      try {
        members = await workspaceApi.getMembers(workspaceId);
      } catch {
        members = [];
      }
      set({
        currentWorkspace: workspace,
        channels,
        tasks,
        members,
        loading: false,
      });

      if (channels.length > 0) {
        get().setCurrentChannel(channels[0].id);
      }
      
      // Initialize STOMP if not already connected
      if (!get().stompClient) {
        get().connectWebSocket();
      }
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  connectWebSocket: () => {
    const token = getAccessToken();
    if (!token) return;

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: (str) => {
        // console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      // Subscribe to global online status
      client.subscribe('/topic/online-status', (msg) => {
        const data = JSON.parse(msg.body);
        set({ onlineUsers: new Set(data.onlineUsers) });
      });
      
      const { currentChannel } = get();
      if (currentChannel) {
        get().subscribeToChannel(currentChannel);
      }
    };

    client.activate();
    set({ stompClient: client });
  },
  
  disconnectWebSocket: () => {
    const { stompClient } = get();
    if (stompClient) {
      stompClient.deactivate();
      set({ stompClient: null, onlineUsers: new Set() });
    }
  },

  subscribeToChannel: (channelId) => {
    const { stompClient } = get();
    if (!stompClient || !stompClient.connected) return;

    // We should ideally track subscriptions and unsubscribe from old ones, 
    // but for simplicity we can just subscribe.
    
    stompClient.subscribe(`/topic/channel/${channelId}`, (msg) => {
      const data = JSON.parse(msg.body);
      const formattedMsg = {
        ...data,
        isCode: data.type === 'CODE',
        timestamp: data.createdAt,
      };
      
      set((state: any) => ({
        messages: [...state.messages, formattedMsg]
      }));
    });

    stompClient.subscribe(`/topic/channel/${channelId}/typing`, (msg) => {
      const data = JSON.parse(msg.body);
      if (data.type === 'TYPING') {
         // handle typing indicator logic if needed
      }
    });
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
      
      get().subscribeToChannel(channelId);
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  sendMessage: async (channelId, content, isCode = false) => {
    const { stompClient } = get();
    if (stompClient && stompClient.connected) {
      const payload = {
        content,
        type: isCode ? 'CODE' : 'TEXT',
        language: 'javascript'
      };
      stompClient.publish({
        destination: `/app/channel/${channelId}/send`,
        body: JSON.stringify(payload)
      });
      return true;
    } else {
      // Fallback to HTTP
      try {
        const message = await messageApi.sendMessage(channelId, content, isCode);
        const messages = [...get().messages, message];
        set({ messages });
        return true;
      } catch (error) {
        set({ error: error.message });
        return false;
      }
    }
  },
  
  sendTypingIndicator: (channelId) => {
    const { stompClient } = get();
    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination: `/app/channel/${channelId}/typing`,
        body: JSON.stringify({ type: 'TYPING' })
      });
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
  
  createTask: async (title, description) => {
    const { currentWorkspace } = get();
    if (!currentWorkspace) return null;
    try {
      const task = await taskApi.createTask(currentWorkspace.id, title, description);
      set((state: any) => ({ tasks: [...state.tasks, task] }));
      return task;
    } catch (err) {
      toast.error('Failed to create task');
      return null;
    }
  },

  updateTaskStatus: async (taskId, status) => {
    try {
      const updated = await taskApi.updateTask(taskId, status);
      set((state: any) => ({
        tasks: state.tasks.map((t: any) => t.id === taskId ? updated : t)
      }));
      return updated;
    } catch (err) {
      toast.error('Failed to update task');
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
