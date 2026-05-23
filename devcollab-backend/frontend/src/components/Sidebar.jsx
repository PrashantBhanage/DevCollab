import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hash, Plus, CheckSquare, Bot, ArrowLeft } from 'lucide-react';
import useWorkspaceStore from '../store/workspaceStore';
import useAuthStore from '../store/authStore';
import { createChannel } from '../api/channel';
import toast from 'react-hot-toast';

export default function Sidebar({ workspaceId, onToggleAI, isAIOpen }) {
  const { currentWorkspace, channels, currentChannel, setCurrentChannel, fetchChannels } = useWorkspaceStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');

  const handleCreateChannel = async (e) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;
    try {
      await createChannel(workspaceId, { name: newChannelName });
      setNewChannelName('');
      setIsCreatingChannel(false);
      fetchChannels(workspaceId);
    } catch (err) {
      toast.error('Failed to create channel');
    }
  };

  return (
    <div className="h-screen flex-col" style={{ width: '260px', backgroundColor: 'var(--color-bg-body)' }}>
      {/* Header */}
      <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button onClick={() => navigate('/dashboard')} className="btn-icon" style={{ padding: '4px' }}>
          <ArrowLeft size={18} />
        </button>
        <h2 style={{ fontWeight: '600', fontSize: '1.1rem', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {currentWorkspace?.name}
        </h2>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-col flex-1" style={{ padding: '1rem', overflowY: 'auto', gap: '1.5rem' }}>
        
        {/* Channels */}
        <div className="flex-col gap-2">
          <div className="flex justify-between items-center">
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Channels</span>
            <button onClick={() => setIsCreatingChannel(true)} className="btn-icon" style={{ padding: '2px' }}><Plus size={16} /></button>
          </div>
          
          {isCreatingChannel && (
            <form onSubmit={handleCreateChannel} className="flex gap-2" style={{ marginBottom: '0.5rem' }}>
              <input 
                autoFocus
                value={newChannelName} 
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder="channel-name" 
                style={{ padding: '0.4rem', fontSize: '0.85rem', width: '100%' }}
                onBlur={() => setIsCreatingChannel(false)}
              />
            </form>
          )}

          <div className="flex-col gap-1">
            {channels.map(channel => (
              <button 
                key={channel.id}
                onClick={() => setCurrentChannel(channel)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.4rem 0.5rem',
                  borderRadius: '4px', textAlign: 'left',
                  backgroundColor: currentChannel?.id === channel.id ? 'var(--color-bg-surface)' : 'transparent',
                  color: currentChannel?.id === channel.id ? 'var(--color-text-main)' : 'var(--color-text-muted)',
                  fontWeight: currentChannel?.id === channel.id ? '500' : '400',
                  boxShadow: currentChannel?.id === channel.id ? '0 1px 2px rgba(0,0,0,0.02)' : 'none'
                }}
              >
                <Hash size={16} />
                {channel.name}
              </button>
            ))}
          </div>
        </div>

        {/* Apps / Integrations */}
        <div className="flex-col gap-2">
          <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Apps</span>
          <button style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.4rem 0.5rem',
            borderRadius: '4px', textAlign: 'left', color: 'var(--color-text-muted)'
          }}>
            <CheckSquare size={16} />
            Task Board
          </button>
          <button 
            onClick={onToggleAI}
            style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.4rem 0.5rem',
            borderRadius: '4px', textAlign: 'left',
            backgroundColor: isAIOpen ? 'var(--color-bg-surface)' : 'transparent',
            color: isAIOpen ? 'var(--color-primary)' : 'var(--color-text-muted)',
            fontWeight: isAIOpen ? '500' : '400'
          }}>
            <Bot size={16} />
            AI Assistant
          </button>
        </div>

        {/* Members */}
        <div className="flex-col gap-2">
          <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Members</span>
          {/* Real members list would be mapped here, using placeholder for now but matching style */}
          <div className="flex items-center gap-2" style={{ padding: '0.4rem 0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
             <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
             {user?.username || 'You'}
          </div>
        </div>
      </div>

      {/* Current User Bottom Profile */}
      <div style={{ padding: '1rem', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-surface)' }}>
        <div className="flex items-center gap-3">
          <div style={{ width: '32px', height: '32px', borderRadius: '4px', backgroundColor: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '0.9rem' }}>
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: '500', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.username}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Online</div>
          </div>
        </div>
      </div>
    </div>
  );
}
