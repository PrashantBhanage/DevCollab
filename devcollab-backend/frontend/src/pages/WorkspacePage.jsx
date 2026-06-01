import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useWorkspaceStore from '../store/workspaceStore';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import RightPanel from '../components/RightPanel';
import ChatArea from '../components/ChatArea';
import AIPanel from '../components/AIPanel';
import toast from 'react-hot-toast';
import { Sparkles } from 'lucide-react';

export default function WorkspacePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentWorkspace, fetchWorkspaceDetails, fetchChannels, setCurrentChannel, channels } = useWorkspaceStore();
  const [loading, setLoading] = useState(true);
  const [showAI, setShowAI] = useState(false);

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
    if (channels.length > 0 && !currentWorkspace?.currentChannel) {
      setCurrentChannel(channels[0]);
    }
  }, [channels, setCurrentChannel, currentWorkspace]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-body)', color: 'var(--color-text-muted)' }}>
        <div className="flex-col items-center gap-4">
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <span>Loading your workspace...</span>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar workspaceId={id} />
      
      <div className="main-layout">
        <TopBar />
        
        <div className="content-area">
          <main className="main-content" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
            <ChatArea workspaceId={id} />
          </main>
          
          <RightPanel />
        </div>
      </div>

      {/* Floating AI Button */}
      <button 
        onClick={() => setShowAI(true)}
        style={{
          position: 'fixed',
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
          boxShadow: '0 4px 20px rgba(92, 94, 220, 0.4)',
          zIndex: 100
        }}
      >
        <Sparkles size={24} />
      </button>

      {showAI && <AIPanel onClose={() => setShowAI(false)} isModal={true} />}
    </div>
  );
}
