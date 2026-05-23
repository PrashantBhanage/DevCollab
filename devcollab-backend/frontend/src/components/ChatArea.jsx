import { useEffect, useState, useRef } from 'react';
import useWorkspaceStore from '../store/workspaceStore';
import { Send, Code } from 'lucide-react';
import { createMessage } from '../api/message';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import toast from 'react-hot-toast';

export default function ChatArea() {
  const { currentChannel, messages, fetchMessages, addMessage } = useWorkspaceStore();
  const [newMessage, setNewMessage] = useState('');
  const [isCodeMode, setIsCodeMode] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (currentChannel) {
      fetchMessages(currentChannel.id);
      // In a real app with WebSockets, we would connect here.
      // Assuming simple polling or just loading initial state for now.
    }
  }, [currentChannel, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentChannel) return;
    
    try {
      const content = isCodeMode ? `\`\`\`\n${newMessage}\n\`\`\`` : newMessage;
      const res = await createMessage(currentChannel.id, { content });
      addMessage(res.data);
      setNewMessage('');
      setIsCodeMode(false);
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  const renderContent = (content) => {
    if (content.startsWith('```') && content.endsWith('```')) {
      const code = content.slice(3, -3).trim();
      return (
        <div style={{ marginTop: '0.5rem', borderRadius: '6px', overflow: 'hidden' }}>
          <SyntaxHighlighter style={vscDarkPlus} customStyle={{ margin: 0, fontSize: '0.85rem' }}>
            {code}
          </SyntaxHighlighter>
        </div>
      );
    }
    return <p style={{ marginTop: '0.2rem', lineHeight: '1.5' }}>{content}</p>;
  };

  if (!currentChannel) {
    return (
      <div className="h-screen flex items-center justify-center text-muted">
        Select or create a channel to start messaging
      </div>
    );
  }

  return (
    <div className="flex-col h-screen" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
      {/* Header */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-surface)' }}>
        <h3 style={{ fontWeight: '600', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--color-text-muted)' }}>#</span> {currentChannel.name}
        </h3>
      </div>

      {/* Messages */}
      <div className="flex-1" style={{ overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {messages.map((msg, idx) => (
          <div key={msg.id || idx} className="flex gap-3">
            <div style={{ 
              width: '36px', height: '36px', borderRadius: '6px', 
              backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-main)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              fontWeight: '600', fontSize: '1rem', flexShrink: 0 
            }}>
              {msg.sender?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ flex: 1 }}>
              <div className="flex items-center gap-2">
                <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{msg.sender?.username || 'Unknown'}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {renderContent(msg.content)}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '1.5rem', backgroundColor: 'var(--color-bg-surface)', borderTop: '1px solid var(--color-border)' }}>
        <form onSubmit={handleSendMessage} style={{ 
          display: 'flex', alignItems: 'flex-end', gap: '0.5rem', 
          border: '1px solid var(--color-border)', borderRadius: '8px', 
          padding: '0.5rem', backgroundColor: 'var(--color-bg-body)',
          transition: 'border-color 0.2s'
        }}>
          <button 
            type="button"
            onClick={() => setIsCodeMode(!isCodeMode)}
            className="btn-icon"
            style={{ color: isCodeMode ? 'var(--color-primary)' : 'var(--color-text-muted)', alignSelf: 'center' }}
            title="Toggle Code Block"
          >
            <Code size={20} />
          </button>
          
          <textarea 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={isCodeMode ? "Paste your code here..." : `Message #${currentChannel.name}`}
            style={{ 
              flex: 1, border: 'none', background: 'transparent', resize: 'none', 
              maxHeight: '150px', minHeight: '24px', padding: '0.25rem', fontFamily: isCodeMode ? 'monospace' : 'inherit'
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          
          <button 
            type="submit" 
            className="btn-icon" 
            style={{ backgroundColor: newMessage.trim() ? 'var(--color-primary)' : 'transparent', color: newMessage.trim() ? 'white' : 'var(--color-text-muted)', alignSelf: 'center' }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
