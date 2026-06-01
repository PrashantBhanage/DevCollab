import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User as UserIcon } from 'lucide-react';
import { getConversations, createConversation, getAiMessages, sendAiMessage } from '../api/ai';
import toast from 'react-hot-toast';

export default function AIPanel() {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const initAI = async () => {
      try {
        const convRes = await getConversations();
        if (convRes.data && convRes.data.length > 0) {
          setConversation(convRes.data[0]);
          const msgRes = await getAiMessages(convRes.data[0].id);
          setMessages(msgRes.data);
        } else {
          const newConvRes = await createConversation({ title: 'Workspace Assistant' });
          setConversation(newConvRes.data);
        }
      } catch (err) {
        console.error('Failed to init AI', err);
      }
    };
    initAI();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !conversation) return;

    const userMsg = { id: Date.now(), content: input, role: 'USER' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await sendAiMessage(conversation.id, { content: userMsg.content });
      setMessages(prev => [...prev, res.data]);
    } catch (err) {
      toast.error('Failed to get response');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex-col" style={{ borderLeft: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-surface)' }}>
      {/* Header */}
      <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Bot size={20} color="var(--color-primary)" />
        <h3 style={{ fontWeight: '600', fontSize: '1.05rem' }}>DevCollab AI</h3>
      </div>

      {/* Messages */}
      <div className="flex-1" style={{ overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.length === 0 && !isLoading && (
          <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '2rem' }}>
            <p style={{ marginBottom: '1.5rem', fontWeight: '500' }}>
              Ask AI to debug code, explain errors, optimize logic...
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
              <button 
                onClick={() => setInput('Can you explain this error?')}
                style={{ padding: '0.6rem', backgroundColor: 'var(--color-bg-secondary)', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.85rem', width: '90%', cursor: 'pointer', color: 'var(--color-text-main)', textAlign: 'left' }}
              >
                "Can you explain this error?"
              </button>
              <button 
                onClick={() => setInput('Optimize this logic for me')}
                style={{ padding: '0.6rem', backgroundColor: 'var(--color-bg-secondary)', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.85rem', width: '90%', cursor: 'pointer', color: 'var(--color-text-main)', textAlign: 'left' }}
              >
                "Optimize this logic for me"
              </button>
              <button 
                onClick={() => setInput('Debug my code')}
                style={{ padding: '0.6rem', backgroundColor: 'var(--color-bg-secondary)', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.85rem', width: '90%', cursor: 'pointer', color: 'var(--color-text-main)', textAlign: 'left' }}
              >
                "Debug my code"
              </button>
            </div>
          </div>
        )}
        
        {messages.map((msg, idx) => {
          const isAI = msg.role === 'ASSISTANT';
          return (
            <div key={msg.id || idx} style={{ 
              display: 'flex', gap: '0.75rem', 
              flexDirection: isAI ? 'row' : 'row-reverse' 
            }}>
              <div style={{ 
                width: '28px', height: '28px', borderRadius: '4px', flexShrink: 0,
                backgroundColor: isAI ? 'var(--color-primary)' : 'var(--color-bg-secondary)', 
                color: isAI ? 'white' : 'var(--color-text-main)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                {isAI ? <Bot size={16} /> : <UserIcon size={16} />}
              </div>
              <div style={{ 
                backgroundColor: isAI ? 'var(--color-bg-body)' : 'var(--color-primary)', 
                color: isAI ? 'var(--color-text-main)' : 'white',
                padding: '0.75rem 1rem', borderRadius: '8px', 
                borderTopLeftRadius: isAI ? 0 : '8px',
                borderTopRightRadius: isAI ? '8px' : 0,
                fontSize: '0.9rem', lineHeight: '1.5', maxWidth: '85%'
              }}>
                {msg.content}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '4px', backgroundColor: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bot size={16} /></div>
            <div style={{ backgroundColor: 'var(--color-bg-body)', padding: '0.75rem 1rem', borderRadius: '8px', borderTopLeftRadius: 0, fontSize: '0.9rem' }}>
              <span className="typing-indicator" style={{ display: 'inline-block', width: '24px' }}>...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '1rem', borderTop: '1px solid var(--color-border)' }}>
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI..."
            style={{ flex: 1, padding: '0.6rem 0.8rem', fontSize: '0.9rem' }}
          />
          <button type="submit" className="btn-primary" style={{ padding: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }} disabled={isLoading}>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
