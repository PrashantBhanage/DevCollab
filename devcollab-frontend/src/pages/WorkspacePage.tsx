import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import useWorkspaceStore from '../stores/workspaceStore';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import RightPanel from '../components/RightPanel';
import ChatArea from '../components/ChatArea';
import AIPanel from '../components/AIPanel';
import toast from 'react-hot-toast';

export default function WorkspacePage() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const panelAi = searchParams.get('panel') === 'ai';
  
  const { fetchWorkspaces, setCurrentWorkspace } = useWorkspaceStore() as any;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWorkspace = async () => {
      try {
        await fetchWorkspaces(); // Ensure we have the list
        if (id) {
          await setCurrentWorkspace(parseInt(id, 10));
        }
        setLoading(false);
      } catch (err) {
        toast.error('Failed to load workspace');
      }
    };
    loadWorkspace();
  }, [id, fetchWorkspaces, setCurrentWorkspace]);

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
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar workspaceId={id} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        
        <div className="flex flex-1 overflow-hidden">
          <ChatArea />
          <RightPanel />
        </div>
      </div>

      {panelAi && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }} onClick={() => setSearchParams({})}>
          <div style={{ width: '400px', height: '100%' }} onClick={e => e.stopPropagation()}>
            <AIPanel onClose={() => setSearchParams({})} />
          </div>
        </div>
      )}
    </div>
  );
}
