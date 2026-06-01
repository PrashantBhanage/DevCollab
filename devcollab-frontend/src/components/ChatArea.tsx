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
        <div style={{ marginTop: '0.5rem', borderRadius: '6px', overflow: 'hidden' }}>
          <SyntaxHighlighter language="javascript" style={vscDarkPlus} customStyle={{ margin: 0, fontSize: '0.85rem' }}>
            {msg.content}
          </SyntaxHighlighter>
        </div>
      );
    }
    return <p style={{ marginTop: '0.2rem', lineHeight: '1.5' }}>{msg.content}</p>;
  };

  if (!currentChannel) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--color-text-dim)' }}>
        Select or create a channel to start messaging
      </div>
    );
  }

  return (
    <div className="flex-col flex-1 h-screen" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
      {/* Header */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-surface)' }}>
        <h3 style={{ fontWeight: '600', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--color-text-muted)' }}>#</span> {channelObj?.name || 'general'}
        </h3>
      </div>

      {/* Messages */}
      <div className="flex-1" style={{ overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {messages.map((msg: any, idx: number) => (
          <div key={msg.id || idx} className="flex gap-3">
            <div style={{ 
              width: '36px', height: '36px', borderRadius: '6px', 
              backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-main)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              fontWeight: '600', fontSize: '1rem', flexShrink: 0 
            }}>
              {msg.senderName?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ flex: 1 }}>
              <div className="flex items-center gap-2">
                <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{msg.senderName || 'Unknown'}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
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
            placeholder={isCodeMode ? "Paste your code here..." : `Message #${channelObj?.name || 'general'}`}
            style={{ 
              flex: 1, border: 'none', background: 'transparent', resize: 'none', 
              maxHeight: '150px', minHeight: '24px', padding: '0.25rem', fontFamily: isCodeMode ? 'monospace' : 'inherit',
              color: 'var(--color-text-main)', outline: 'none'
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
            disabled={!newMessage.trim() || sending}
            style={{ backgroundColor: newMessage.trim() ? 'var(--color-primary)' : 'transparent', color: newMessage.trim() ? 'white' : 'var(--color-text-muted)', alignSelf: 'center' }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
