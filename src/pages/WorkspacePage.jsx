import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import useAuthStore from '../stores/authStore';
import useWorkspaceStore from '../stores/workspaceStore';
import * as aiApi from '../api/ai';
import toast from 'react-hot-toast';

function WorkspacePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { 
    currentWorkspace, 
    channels, 
    currentChannel, 
    messages, 
    members, 
    loading, 
    setCurrentWorkspace, 
    setCurrentChannel,
    sendMessage,
    addChannel,
    clearMessages
  } = useWorkspaceStore();
  
  const [messageText, setMessageText] = useState('');
  const [isCode, setIsCode] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showAddChannel, setShowAddChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const messagesEndRef = useRef(null);
  
  // AI Panel states
  const [aiConversations, setAiConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState('');
  const [sendingAi, setSendingAi] = useState(false);

  useEffect(() => {
    if (id) {
      setCurrentWorkspace(parseInt(id));
    }
  }, [id]);

  useEffect(() => {
    if (currentChannel) {
      loadMessages();
    }
  }, [currentChannel]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (currentWorkspace) {
      loadAiConversations();
    }
  }, [currentWorkspace]);

  const loadMessages = async () => {
    if (currentChannel) {
      clearMessages();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // AI Functions
  const loadAiConversations = async () => {
    try {
      const convs = await aiApi.getConversations(currentWorkspace.id);
      setAiConversations(convs);
    } catch (err) {
      console.error('Failed to load AI conversations:', err);
    }
  };

  const handleSelectConversation = async (convId) => {
    try {
      const msgs = await aiApi.getMessages(convId);
      setCurrentConversation(convId);
      setAiMessages(msgs);
    } catch (err) {
      console.error('Failed to load AI messages:', err);
    }
  };

  const handleNewConversation = async () => {
    try {
      const conv = await aiApi.createConversation(currentWorkspace.id, 'New conversation');
      setAiConversations([...aiConversations, conv]);
      setCurrentConversation(conv.id);
      setAiMessages([]);
    } catch (err) {
      console.error('Failed to create conversation:', err);
    }
  };

  const handleSendAiMessage = async (e) => {
    e.preventDefault();
    if (!aiInput.trim() || !currentConversation || sendingAi) return;

    setSendingAi(true);
    const userMsg = { role: 'user', content: aiInput };
    setAiMessages([...aiMessages, userMsg]);
    
    try {
      const response = await aiApi.sendMessage(currentConversation, aiInput);
      setAiMessages(prev => [...prev, { role: 'assistant', content: response.message }]);
      setAiInput('');
    } catch (err) {
      toast.error('Failed to send message to AI');
    }
    setSendingAi(false);
  };

  return (
    <div className="workspace-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
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
              <form onSubmit={handleAddChannel} style={{ padding: '0 20px', display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="channel-name"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  style={{ fontSize: '13px', padding: '8px' }}
                  autoFocus
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 12px' }}>Add</button>
              </form>
            ) : (
              <div 
                className="nav-item" 
                onClick={() => setShowAddChannel(true)}
                style={{ opacity: 0.6, fontSize: '12px' }}
              >
                + Add channel
              </div>
            )}
          </div>
          
          <div className="nav-section">
            <div className="nav-section-title">Links</div>
            <div className="nav-item" onClick={() => navigate(`/workspace/${id}/tasks`)}>
              Task Board
            </div>
            <div className="nav-item" onClick={() => navigate(`/workspace/${id}/ai`)}>
              AI Assistant
            </div>
          </div>
        </nav>
        
        <div className="members-section">
          <div className="nav-section-title">Members</div>
          <div className="members-list">
            {members.map((member) => (
              <div key={member.id} className="member-item">
                <div className="member-avatar">
                  {getInitials(member.name)}
                </div>
                <span>{member.name}</span>
                {member.isOnline && <div className="online-dot" />}
              </div>
            ))}
          </div>
        </div>
        
        <div className="user-section">
          <div className="member-avatar">
            {getInitials(user?.name)}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-email">{user?.email}</div>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '12px' }}>
            Out
          </button>
        </div>
      </aside>
      
      {/* Chat Area */}
      <main className="chat-area">
        <div className="chat-header">
          <h3># {channels.find(c => c.id === currentChannel)?.name || 'general'}</h3>
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
                <div className="message-avatar">
                  {getInitials(msg.senderName)}
                </div>
                <div className="message-content">
                  <div className="message-header">
                    <span className="message-sender">{msg.senderName}</span>
                    <span className="message-time">{formatTime(msg.timestamp)}</span>
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
              placeholder={`Message #${channels.find(c => c.id === currentChannel)?.name || 'general'}`}
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
      
      {/* AI Panel */}
      <aside className="ai-panel">
        <div className="ai-header">
          <h3>AI Assistant</h3>
        </div>
        
        <div className="ai-conversations">
          <button onClick={handleNewConversation} className="btn btn-secondary btn-full" style={{ marginBottom: '12px' }}>
            New Conversation
          </button>
          <div className="conversation-list">
            {aiConversations.slice(0, 5).map((conv) => (
              <div
                key={conv.id}
                className={`conversation-item ${currentConversation === conv.id ? 'active' : ''}`}
                onClick={() => handleSelectConversation(conv.id)}
                style={{ 
                  background: currentConversation === conv.id ? '#534AB7' : 'transparent',
                  color: currentConversation === conv.id ? '#fff' : 'inherit'
                }}
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
    </div>
  );
}

export default WorkspacePage;