import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import useAuthStore from '../stores/authStore';
import useWorkspaceStore from '../stores/workspaceStore';
import * as aiApi from '../api/ai';
import toast from 'react-hot-toast';

function WorkspacePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const panelAi = searchParams.get('panel') === 'ai';
  const { user, logout } = useAuthStore();
  const {
    currentWorkspace,
    channels,
    currentChannel,
    messages,
    members,
    setCurrentWorkspace,
    setCurrentChannel,
    sendMessage,
    addChannel,
  } = useWorkspaceStore();

  const [messageText, setMessageText] = useState('');
  const [isCode, setIsCode] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showAddChannel, setShowAddChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [aiPanelOpen, setAiPanelOpen] = useState(panelAi);
  const messagesEndRef = useRef(null);
  const aiPanelRef = useRef(null);

  const [aiConversations, setAiConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState('');
  const [sendingAi, setSendingAi] = useState(false);

  const displayName = user?.username || user?.name || 'User';

  useEffect(() => {
    if (id) {
      setCurrentWorkspace(parseInt(id, 10));
    }
  }, [id, setCurrentWorkspace]);

  useEffect(() => {
    setAiPanelOpen(panelAi);
    if (panelAi) {
      aiPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [panelAi]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (currentWorkspace) {
      loadAiConversations();
    }
  }, [currentWorkspace]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !currentChannel || sendingMessage) return;

    setSendingMessage(true);
    const message = await sendMessage(currentChannel, messageText, isCode);
    if (message) {
      setMessageText('');
      setIsCode(false);
    } else {
      toast.error('Failed to send message');
    }
    setSendingMessage(false);
  };

  const handleAddChannel = async (e) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    const channel = await addChannel(newChannelName);
    if (channel) {
      setNewChannelName('');
      setShowAddChannel(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const normalizeAiRole = (role) => {
    if (!role) return 'assistant';
    const r = role.toUpperCase();
    if (r === 'USER') return 'user';
    if (r === 'AI') return 'ai';
    return role.toLowerCase();
  };

  const loadAiConversations = async () => {
    if (!currentWorkspace?.id) return;
    try {
      const convs = await aiApi.getConversations(currentWorkspace.id);
      setAiConversations(convs);
      if (panelAi && convs.length > 0 && !currentConversation) {
        handleSelectConversation(convs[0].id);
      }
    } catch (err) {
      console.error('Failed to load AI conversations:', err);
    }
  };

  const handleSelectConversation = async (convId) => {
    try {
      const msgs = await aiApi.getMessages(convId);
      setCurrentConversation(convId);
      setAiMessages(
        msgs.map((m) => ({
          role: normalizeAiRole(m.role),
          content: m.content,
        }))
      );
    } catch (err) {
      console.error('Failed to load AI messages:', err);
    }
  };

  const handleNewConversation = async () => {
    if (!currentWorkspace?.id) return;
    try {
      const conv = await aiApi.createConversation(currentWorkspace.id, 'New conversation');
      setAiConversations([...aiConversations, conv]);
      setCurrentConversation(conv.id);
      setAiMessages([]);
      setAiPanelOpen(true);
    } catch (err) {
      toast.error('Failed to create conversation');
    }
  };

  const handleSendAiMessage = async (e) => {
    e.preventDefault();
    if (!aiInput.trim() || !currentConversation || sendingAi) return;

    setSendingAi(true);
    const userMsg = { role: 'user', content: aiInput };
    setAiMessages((prev) => [...prev, userMsg]);
    const prompt = aiInput;
    setAiInput('');

    try {
      const response = await aiApi.sendMessage(currentConversation, prompt);
      setAiMessages((prev) => [
        ...prev,
        { role: normalizeAiRole(response.role), content: response.content },
      ]);
    } catch {
      toast.error('Failed to send message to AI');
    }
    setSendingAi(false);
  };

  return (
    <div className="workspace-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <button type="button" className="btn btn-ghost sidebar-back" onClick={() => navigate('/dashboard')}>
            ← Dashboard
          </button>
          <h2>{currentWorkspace?.name || 'Loading...'}</h2>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Channels</div>
            {channels.map((channel) => (
              <div
                key={channel.id}
                className={`nav-item ${currentChannel === channel.id ? 'active' : ''}`}
                onClick={() => setCurrentChannel(channel.id)}
              >
                <span className="channel-icon">#</span>
                {channel.name}
              </div>
            ))}
            {showAddChannel ? (
              <form onSubmit={handleAddChannel} className="add-channel-form">
                <input
                  type="text"
                  className="form-input"
                  placeholder="channel-name"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="btn btn-primary">Add</button>
              </form>
            ) : (
              <div className="nav-item nav-item-muted" onClick={() => setShowAddChannel(true)}>
                + Add channel
              </div>
            )}
          </div>
        </nav>

        <div className="members-section">
          <div className="nav-section-title">Members</div>
          <div className="members-list">
            {members.map((member) => (
              <div key={member.id} className="member-item">
                <div className="member-avatar">{getInitials(member.name)}</div>
                <span>{member.name}</span>
                {member.isOnline && <div className="online-dot" />}
              </div>
            ))}
          </div>
        </div>

        <div className="user-section">
          <div className="member-avatar">{getInitials(displayName)}</div>
          <div className="user-info">
            <div className="user-name">{displayName}</div>
            <div className="user-email">{user?.email}</div>
          </div>
          <button type="button" onClick={handleLogout} className="btn btn-ghost btn-sm">
            Out
          </button>
        </div>
      </aside>

      <main className="chat-area">
        <div className="chat-header">
          <h3># {channels.find((c) => c.id === currentChannel)?.name || 'general'}</h3>
          <button
            type="button"
            className={`btn btn-secondary btn-sm ${aiPanelOpen ? 'active' : ''}`}
            onClick={() => setAiPanelOpen(!aiPanelOpen)}
          >
            AI Assistant
          </button>
        </div>

        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="empty-state">
              <h3>No messages yet</h3>
              <p>Be the first to send a message in this channel.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="message">
                <div className="message-avatar">{getInitials(msg.senderName)}</div>
                <div className="message-content">
                  <div className="message-header">
                    <span className="message-sender">{msg.senderName}</span>
                    <span className="message-time">{formatTime(msg.timestamp || msg.createdAt)}</span>
                  </div>
                  {msg.isCode ? (
                    <div className="code-block">
                      <SyntaxHighlighter
                        language="javascript"
                        style={oneDark}
                        customStyle={{ margin: 0, padding: 0, background: 'transparent' }}
                      >
                        {msg.content}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <div className="message-text">{msg.content}</div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="message-input-container">
          <form onSubmit={handleSendMessage} className="message-input-wrapper">
            <textarea
              className="message-input"
              placeholder={`Message #${channels.find((c) => c.id === currentChannel)?.name || 'general'}`}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            <button
              type="button"
              className={`code-toggle ${isCode ? 'active' : ''}`}
              onClick={() => setIsCode(!isCode)}
              title="Toggle code mode"
            >
              {'</>'}
            </button>
            <button type="submit" className="btn btn-primary" disabled={!messageText.trim() || sendingMessage}>
              Send
            </button>
          </form>
        </div>
      </main>

      {aiPanelOpen && (
        <aside className="ai-panel" ref={aiPanelRef}>
          <div className="ai-header">
            <h3>AI Assistant</h3>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAiPanelOpen(false)}>
              ×
            </button>
          </div>

          <div className="ai-conversations">
            <button type="button" onClick={handleNewConversation} className="btn btn-secondary btn-full">
              New Conversation
            </button>
            <div className="conversation-list">
              {aiConversations.slice(0, 5).map((conv) => (
                <div
                  key={conv.id}
                  className={`conversation-item ${currentConversation === conv.id ? 'active' : ''}`}
                  onClick={() => handleSelectConversation(conv.id)}
                >
                  {conv.title || 'Untitled'}
                </div>
              ))}
            </div>
          </div>

          <div className="ai-messages">
            {aiMessages.length === 0 ? (
              <div className="empty-state" style={{ padding: '20px' }}>
                <p>Select a conversation or start a new one to chat with AI.</p>
              </div>
            ) : (
              aiMessages.map((msg, idx) => (
                <div key={idx} className={`ai-message ${msg.role}`}>
                  {msg.content}
                </div>
              ))
            )}
          </div>

          <div className="ai-input-container">
            <form onSubmit={handleSendAiMessage} className="ai-input-wrapper">
              <input
                type="text"
                className="ai-input"
                placeholder="Ask AI..."
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                disabled={!currentConversation}
              />
              <button
                type="submit"
                className="ai-send-btn"
                disabled={!aiInput.trim() || !currentConversation || sendingAi}
              >
                ➤
              </button>
            </form>
          </div>
        </aside>
      )}
    </div>
  );
}

export default WorkspacePage;
