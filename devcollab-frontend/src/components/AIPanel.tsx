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
    <div className="ai-panel" style={{ width: isModal ? '100%' : '380px', borderLeft: isModal ? 'none' : '' }}>
      {/* Header */}
      <div className="ai-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={24} color="var(--color-accent)" />
          <div>
            <h3 style={{ margin: 0 }}>AI Assistant</h3>
            <div style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)' }}>• Online</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn-icon" onClick={handleNewConversation} title="New Chat" style={{ color: 'var(--color-text-inverse)' }}><Trash2 size={20} /></button>
          <button className="btn-icon" onClick={onClose} style={{ color: 'var(--color-text-inverse)' }}><X size={20} /></button>
        </div>
      </div>

      {/* Messages */}
      <div className="ai-messages">
        {messages.length === 0 && !loading && (
          <div className="empty-state-card" style={{ padding: '32px' }}>
            <Bot size={48} style={{ margin: '0 auto 16px', color: 'var(--color-text-main)' }} />
            <h3 style={{ fontSize: '24px' }}>Select a chat</h3>
            <p>Start a new conversation to chat with AI.</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`ai-message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
        {loading && (
          <div className="ai-message assistant">
            <div className="loading-spinner" style={{ width: '24px', height: '24px', borderWidth: '4px' }}></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer / Input */}
      <div className="ai-input-container">
        {messages.length === 0 && (
          <div className="flex-col gap-2" style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)', color: 'var(--color-accent)' }}>Suggested</div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map(s => (
                <button 
                  key={s} 
                  onClick={() => setInput(s)}
                  style={{ padding: '8px 16px', backgroundColor: 'var(--color-bg-base)', border: '2px solid var(--color-border)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer' }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        <form onSubmit={handleSend} style={{ position: 'relative' }}>
          <textarea 
            className="ai-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder="ASK AI ANYTHING..."
            style={{ width: '100%', minHeight: '120px', resize: 'none', paddingRight: '72px' }}
          />
          <button 
            type="submit" 
            className="ai-send-btn"
            disabled={!input.trim() || loading || !currentConversationId}
            style={{ position: 'absolute', right: '12px', bottom: '16px' }}
          >
            <Send size={24} />
          </button>
          <div style={{ position: 'absolute', left: '16px', bottom: '16px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--color-text-main)' }}>
            <Command size={12} /> + ENTER
          </div>
        </form>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="modal-overlay">
        <div style={{ width: '480px', height: '80vh', border: '4px solid var(--color-border)', backgroundColor: 'var(--color-bg-base)', display: 'flex', flexDirection: 'column' }}>
          {content}
        </div>
      </div>
    );
  }

  return content;
}
