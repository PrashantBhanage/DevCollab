import { useEffect, useState, useRef } from 'react';
import useWorkspaceStore from '../stores/workspaceStore';
import { Send, Code } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import toast from 'react-hot-toast';

export default function ChatArea() {
  const { currentChannel, channels, messages, sendMessage } = useWorkspaceStore() as any;
  const [newMessage, setNewMessage] = useState('');
  const [isCodeMode, setIsCodeMode] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const channelObj = channels.find((c: any) => c.id === currentChannel);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentChannel || sending) return;
    
    setSending(true);
    try {
      const success = await sendMessage(currentChannel, newMessage, isCodeMode);
      if (success) {
        setNewMessage('');
        setIsCodeMode(false);
      } else {
        toast.error('Failed to send message');
      }
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const renderContent = (msg: any) => {
    if (msg.isCode) {
      return (
        <div className="code-block">
          <SyntaxHighlighter language="javascript" style={vscDarkPlus} customStyle={{ margin: 0, fontSize: '0.875rem', background: 'transparent' }}>
            {msg.content}
          </SyntaxHighlighter>
        </div>
      );
    }
    return <p className="message-text">{msg.content}</p>;
  };

  if (!currentChannel) {
    return (
      <div className="chat-area flex items-center justify-center">
        <div className="empty-state-card" style={{ padding: '4rem', textAlign: 'center', border: 'none' }}>
          <h3 style={{ fontSize: '2rem' }}>Select a channel</h3>
          <p>Choose a channel from the sidebar to start messaging.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-area">
      {/* Header */}
      <div className="chat-header">
        <h3 className="flex items-baseline gap-2">
          <span style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>#</span> {channelObj?.name || 'general'}
        </h3>
      </div>

      {/* Messages */}
      <div className="messages-container">
        {messages.map((msg: any, idx: number) => (
          <div key={msg.id || idx} className="message">
            <div className="message-avatar">
              {msg.senderName?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="message-content">
              <div className="message-header">
                <span className="message-sender">{msg.senderName || 'Unknown'}</span>
                <span className="message-time">
                  {new Date(msg.timestamp || msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {renderContent(msg)}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="message-input-container">
        <form onSubmit={handleSendMessage} className="message-input-wrapper w-full">
          <button 
            type="button"
            onClick={() => setIsCodeMode(!isCodeMode)}
            className={`code-toggle ${isCodeMode ? 'active' : ''}`}
            title="Toggle Code Block"
          >
            <Code size={20} strokeWidth={1.5} />
          </button>
          
          <textarea 
            className="message-input"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={isCodeMode ? "Paste your code here..." : `Message #${(channelObj?.name || 'general')}`}
            style={{ fontFamily: isCodeMode ? 'var(--font-mono)' : 'var(--font-body)' }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          
          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ width: '64px', height: '64px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            disabled={!newMessage.trim() || sending}
          >
            <Send size={24} strokeWidth={1.5} />
          </button>
        </form>
      </div>
    </div>
  );
}
