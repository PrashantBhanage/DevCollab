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
    "Explain this error",
    "Optimize logic",
    "Write a unit test"
  ];

  const content = (
    <div className="ai-panel" style={{ width: isModal ? '100%' : 'var(--right-panel-width)', borderLeft: isModal ? 'none' : '' }}>
      {/* Header */}
      <div className="ai-header">
        <h3 className="flex items-center gap-2 m-0" style={{ fontSize: '1.5rem' }}>
          <Sparkles size={20} strokeWidth={1.5} color="var(--color-accent)" />
          Assistant
        </h3>
        <div className="flex gap-2 items-center">
          <span className="ai-status" style={{ marginRight: '1rem' }}>• Online</span>
          <button className="btn-icon" onClick={handleNewConversation} title="New Chat"><Trash2 size={18} strokeWidth={1.5} /></button>
          <button className="btn-icon" onClick={onClose}><X size={20} strokeWidth={1.5} /></button>
        </div>
      </div>

      {/* Messages */}
      <div className="ai-messages">
        {messages.length === 0 && !loading && (
          <div className="empty-state-card" style={{ padding: '2rem 0', border: 'none' }}>
            <h3 style={{ fontSize: '1.5rem' }}>Start a dialogue</h3>
            <p>Select a conversation or type a message below.</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`ai-message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
        {loading && (
          <div className="ai-message assistant flex items-center">
            <div className="loading-spinner"></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="ai-input-container">
        {messages.length === 0 && (
          <div className="flex-col gap-2" style={{ marginBottom: '1.5rem' }}>
            <div className="label-mono">Suggested</div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map(s => (
                <button 
                  key={s} 
                  onClick={() => setInput(s)}
                  className="btn-ghost"
                  style={{ border: '1px solid var(--color-border)', height: '2rem', fontSize: '0.75rem', padding: '0 0.75rem' }}
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
            placeholder="Ask AI anything..."
            style={{ paddingRight: '4rem', minHeight: '100px' }}
          />
          <button 
            type="submit" 
            className="ai-send-btn"
            disabled={!input.trim() || loading || !currentConversationId}
            style={{ position: 'absolute', right: '1rem', bottom: '1rem', padding: '0.25rem' }}
          >
            <Send size={20} strokeWidth={1.5} />
          </button>
        </form>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="modal-overlay">
        <div className="modal" style={{ padding: 0, height: '80vh', display: 'flex', flexDirection: 'column', maxWidth: '600px' }}>
          {content}
        </div>
      </div>
    );
  }

  return content;
}
