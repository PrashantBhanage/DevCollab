import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Link as LinkIcon, LogOut } from 'lucide-react';
import useWorkspaceStore from '../store/workspaceStore';
import useAuthStore from '../store/authStore';
import { createWorkspace, joinWorkspace } from '../api/workspace';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { workspaces, fetchWorkspaces } = useWorkspaceStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [isCreating, setIsCreating] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  
  const [isJoining, setIsJoining] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => {
    fetchWorkspaces().catch(err => toast.error('Failed to load workspaces'));
  }, [fetchWorkspaces]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createWorkspace({ name: newWorkspaceName });
      toast.success('Workspace created!');
      setNewWorkspaceName('');
      setIsCreating(false);
      fetchWorkspaces();
    } catch (err) {
      toast.error('Failed to create workspace');
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    try {
      await joinWorkspace({ inviteCode });
      toast.success('Joined workspace!');
      setInviteCode('');
      setIsJoining(false);
      fetchWorkspaces();
    } catch (err) {
      toast.error('Failed to join workspace');
    }
  };

  return (
    <div className="min-h-screen" style={{ padding: '2rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <header className="flex justify-between items-center" style={{ marginBottom: '3rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '600' }}>DevCollab</h1>
            <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Welcome back, {user?.username || 'User'}</p>
          </div>
          <button onClick={() => { logout(); navigate('/'); }} className="btn-secondary flex items-center gap-2">
            <LogOut size={18} />
            Log out
          </button>
        </header>

        <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '500' }}>Your Workspaces</h2>
          <div className="flex gap-2">
            <button onClick={() => { setIsJoining(true); setIsCreating(false); }} className="btn-secondary flex items-center gap-2">
              <LinkIcon size={18} />
              Join via Invite
            </button>
            <button onClick={() => { setIsCreating(true); setIsJoining(false); }} className="btn-primary flex items-center gap-2">
              <Plus size={18} />
              Create Workspace
            </button>
          </div>
        </div>

        {isCreating && (
          <form onSubmit={handleCreate} className="card flex gap-4 items-center" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
            <input 
              value={newWorkspaceName} 
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              placeholder="Workspace Name" 
              required 
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn-primary">Create</button>
            <button type="button" onClick={() => setIsCreating(false)} className="btn-secondary">Cancel</button>
          </form>
        )}

        {isJoining && (
          <form onSubmit={handleJoin} className="card flex gap-4 items-center" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
            <input 
              value={inviteCode} 
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Invite Code" 
              required 
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn-primary">Join</button>
            <button type="button" onClick={() => setIsJoining(false)} className="btn-secondary">Cancel</button>
          </form>
        )}

        {workspaces.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--color-text-muted)' }}>
            <p>You are not in any workspaces yet.</p>
            <p>Create or join one to get started.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {workspaces.map(ws => (
              <div 
                key={ws.id} 
                className="card flex-col" 
                style={{ cursor: 'pointer', transition: 'border-color 0.2s' }}
                onClick={() => navigate(`/workspace/${ws.id}`)}
                onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
              >
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>{ws.name}</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Invite Code: <span style={{ userSelect: 'all', background: 'var(--color-bg-secondary)', padding: '2px 6px', borderRadius: '4px' }}>{ws.inviteCode}</span></p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
