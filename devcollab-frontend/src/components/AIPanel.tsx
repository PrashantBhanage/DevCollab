import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, Trash2, Command } from 'lucide-react';
import * as aiApi from '../api/ai';
import useWorkspaceStore from '../stores/workspaceStore';
import toast from 'react-hot-toast';

export default function AIPanel({ onClose, isModal }: { onClose: () => void, isModal?: boolean }) {
  const { currentWorkspace } = useWorkspaceStore() as any;
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (currentWorkspace?.id) {
      loadConversations();
    }
  }, [currentWorkspace]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      const convs = await aiApi.getConversations(currentWorkspace.id);
      setConversations(convs);
      if (convs.length > 0 && !currentConversationId) {
        handleSelectConversation(convs[0].id);
      }
    } catch (err) {
      console.error('Failed to load AI conversations');
    }
  };

  const handleSelectConversation = async (id: number) => {
    setCurrentConversationId(id);
    setLoading(true);
    try {
      const msgs = await aiApi.getMessages(id);
      setMessages(msgs.map((m: any) => ({
        role: m.role.toLowerCase() === 'ai' ? 'assistant' : 'user',
        content: m.content
      })));
    } catch (err) {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleNewConversation = async () => {
    try {
      const conv = await aiApi.createConversation(currentWorkspace.id, 'New Chat');
      setConversations([conv, ...conversations]);
      setCurrentConversationId(conv.id);
      setMessages([]);
    } catch (err) {
      toast.error('Failed to create conversation');
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || !currentConversationId) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const prompt = input;
    setInput('');
    setLoading(true);

    try {
      const response = await aiApi.sendMessage(currentConversationId, prompt);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.content 
      }]);
    } catch (err) {
      toast.error('Failed to get AI response');
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "Debug my latest commit",
    "Explain this error: 'NullPointerException'",
    "Optimize my React useEffect logic",
    "Write a unit test for my AuthService"
  ];

  const content = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: 'var(--color-bg-surface)',
      borderLeft: isModal ? 'none' : '1px solid var(--color-border)',
      width: isModal ? '100%' : '350px'
    }}>
      {/* Header */}
      <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="flex items-center gap-2">
          <div style={{ padding: '0.4rem', borderRadius: '8px', backgroundColor: 'rgba(92, 94, 220, 0.1)', color: 'var(--color-primary)' }}>
            <Sparkles size={18} />
          </div>
          <div>
            <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>AI Assistant</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-accent)' }}>• Online</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn-icon" onClick={handleNewConversation} title="New Chat"><Trash2 size={16} /></button>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {messages.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-dim)' }}>
            <Bot size={40} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>Select a conversation or start a new one to chat with AI.</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className="flex gap-3" style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
            {msg.role === 'assistant' && (
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--color-bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Bot size={16} color="var(--color-primary)" />
              </div>
            )}
            <div style={{
              padding: '0.8rem 1rem',
              borderRadius: '12px',
              backgroundColor: msg.role === 'user' ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
              color: msg.role === 'user' ? 'white' : 'var(--color-text-main)',
              fontSize: '0.9rem',
              lineHeight: '1.5',
              borderTopRightRadius: msg.role === 'user' ? '2px' : '12px',
              borderTopLeftRadius: msg.role === 'assistant' ? '2px' : '12px',
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--color-bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={16} color="var(--color-primary)" />
            </div>
            <div style={{ padding: '0.8rem 1rem', borderRadius: '12px', backgroundColor: 'var(--color-bg-secondary)', display: 'flex', gap: '4px' }}>
              <div className="dot-typing"></div>
              <div className="dot-typing" style={{ animationDelay: '0.2s' }}></div>
              <div className="dot-typing" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer / Input */}
      <div style={{ padding: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
        {messages.length === 0 && (
          <div className="flex-col gap-2" style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-dim)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Suggested Prompts</div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map(s => (
                <button 
                  key={s} 
                  onClick={() => setInput(s)}
                  style={{ padding: '0.4rem 0.8rem', borderRadius: '100px', backgroundColor: 'var(--color-bg-secondary)', fontSize: '0.75rem', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', cursor: 'pointer' }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        <form onSubmit={handleSend} style={{ position: 'relative' }}>
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder="Ask AI anything..."
            style={{
              width: '100%',
              minHeight: '80px',
              padding: '0.8rem 2.8rem 0.8rem 1rem',
              backgroundColor: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              fontSize: '0.9rem',
              resize: 'none',
              color: 'var(--color-text-main)',
              outline: 'none'
            }}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || loading || !currentConversationId}
            style={{
              position: 'absolute',
              right: '10px',
              bottom: '10px',
              padding: '0.5rem',
              borderRadius: '8px',
              backgroundColor: input.trim() ? 'var(--color-primary)' : 'transparent',
              color: input.trim() ? 'white' : 'var(--color-text-dim)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <Send size={18} />
          </button>
          <div style={{ position: 'absolute', left: '12px', bottom: '12px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-dim)', fontSize: '0.7rem' }}>
            <Command size={10} /> + Enter to send
          </div>
        </form>
      </div>

      <style>{`
        .dot-typing {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background-color: var(--color-text-dim);
          animation: dot-typing 1.4s infinite ease-in-out;
        }
        @keyframes dot-typing {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );

  if (isModal) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '80px',
        right: '2rem',
        width: '400px',
        height: '600px',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        zIndex: 1000,
        border: '1px solid var(--color-border)'
      }}>
        {content}
      </div>
    );
  }

  return content;
}
