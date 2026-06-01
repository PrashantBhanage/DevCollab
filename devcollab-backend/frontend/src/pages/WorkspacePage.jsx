import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useWorkspaceStore from '../store/workspaceStore';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import AIPanel from '../components/AIPanel';
import toast from 'react-hot-toast';

export default function WorkspacePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentWorkspace, fetchWorkspaceDetails, fetchChannels, setCurrentChannel, channels } = useWorkspaceStore();
  const [loading, setLoading] = useState(true);
  const [showAIPanel, setShowAIPanel] = useState(false);

  useEffect(() => {
    const loadWorkspace = async () => {
      try {
        await fetchWorkspaceDetails(id);
        await fetchChannels(id);
        setLoading(false);
      } catch (err) {
        toast.error('Failed to load workspace');
        navigate('/dashboard');
      }
    };
    loadWorkspace();
  }, [id, fetchWorkspaceDetails, fetchChannels, navigate]);

  useEffect(() => {
    if (channels.length > 0) {
      setCurrentChannel(channels[0]);
    }
  }, [channels, setCurrentChannel]);

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading workspace...</div>;
  }

  return (
    <div className="h-screen flex" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
      <Sidebar 
        workspaceId={id} 
        onToggleAI={() => setShowAIPanel(!showAIPanel)} 
        isAIOpen={showAIPanel} 
      />
      
      <div className="flex-col flex-1" style={{ borderLeft: '1px solid var(--color-border)', borderRight: showAIPanel ? '1px solid var(--color-border)' : 'none' }}>
        <ChatArea workspaceId={id} />
      </div>

      {showAIPanel && (
        <div style={{ width: '350px', backgroundColor: 'var(--color-bg-body)' }}>
          <AIPanel />
        </div>
      )}

      {!showAIPanel && (
        <button
          onClick={() => setShowAIPanel(true)}
          style={{
            position: 'absolute',
            bottom: '2rem',
            right: '2rem',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            border: 'none',
            zIndex: 1000,
            transition: 'transform 0.2s'
          }}
          title="Open AI Assistant"
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Bot size={28} />
        </button>
      )}
    </div>
  );
}
