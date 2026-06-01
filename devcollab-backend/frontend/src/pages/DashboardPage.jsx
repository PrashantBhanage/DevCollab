import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Link as LinkIcon, 
  LayoutGrid, 
  List, 
  Clock, 
  Users, 
  Activity,
  Zap
} from 'lucide-react';
import useWorkspaceStore from '../store/workspaceStore';
import useAuthStore from '../store/authStore';
import { createWorkspace, joinWorkspace } from '../api/workspace';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import RightPanel from '../components/RightPanel';
import AIPanel from '../components/AIPanel';

export default function DashboardPage() {
  const { workspaces, fetchWorkspaces } = useWorkspaceStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [isCreating, setIsCreating] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [showAI, setShowAI] = useState(false);

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

  return (
    <div className="app-container">
      <Sidebar />
      
      <div className="main-layout">
        <TopBar />
        
        <div className="content-area">
          <main className="main-content">
            <div style={{ marginBottom: '2.5rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem' }}>Welcome back, {user?.username || 'Developer'}</h1>
              <p style={{ color: 'var(--color-text-muted)' }}>Here's what's happening in your workspaces today.</p>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-4" style={{ marginBottom: '2.5rem' }}>
              <button 
                onClick={() => setIsCreating(true)}
                className="card flex items-center gap-3" 
                style={{ flex: 1, padding: '1.25rem', cursor: 'pointer', borderColor: 'transparent', backgroundColor: 'var(--color-bg-secondary)' }}
              >
                <div style={{ padding: '0.6rem', borderRadius: '8px', backgroundColor: 'rgba(92, 94, 220, 0.1)', color: 'var(--color-primary)' }}>
                  <Plus size={20} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>Create Workspace</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Set up a new space for your team</div>
                </div>
              </button>
              <button className="card flex items-center gap-3" style={{ flex: 1, padding: '1.25rem', cursor: 'pointer', borderColor: 'transparent', backgroundColor: 'var(--color-bg-secondary)' }}>
                <div style={{ padding: '0.6rem', borderRadius: '8px', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: 'var(--color-accent)' }}>
                  <Users size={20} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>Invite Members</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Grow your collaboration network</div>
                </div>
              </button>
              <button className="card flex items-center gap-3" style={{ flex: 1, padding: '1.25rem', cursor: 'pointer', borderColor: 'transparent', backgroundColor: 'var(--color-bg-secondary)' }}>
                <div style={{ padding: '0.6rem', borderRadius: '8px', backgroundColor: 'rgba(234, 179, 8, 0.1)', color: '#eab308' }}>
                  <Zap size={20} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>Quick AI Audit</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Review recent code changes</div>
                </div>
              </button>
            </div>

            {isCreating && (
              <form onSubmit={handleCreate} className="card flex gap-4 items-center" style={{ marginBottom: '2rem' }}>
                <input 
                  value={newWorkspaceName} 
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="Enter workspace name..." 
                  required 
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn-primary">Create</button>
                <button type="button" onClick={() => setIsCreating(false)} className="btn-secondary">Cancel</button>
              </form>
            )}

            <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
              <div className="flex items-center gap-2">
                <LayoutGrid size={18} color="var(--color-text-dim)" />
                <h2 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Active Workspaces</h2>
              </div>
              <div className="flex gap-2">
                <button className="btn-icon" style={{ backgroundColor: 'var(--color-bg-secondary)' }}><LayoutGrid size={16} /></button>
                <button className="btn-icon"><List size={16} /></button>
              </div>
            </div>

            {workspaces.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', borderStyle: 'dashed' }}>
                <p style={{ color: 'var(--color-text-muted)' }}>No workspaces found. Start by creating your first one!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                {workspaces.map(ws => (
                  <div 
                    key={ws.id} 
                    className="card" 
                    style={{ cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative', overflow: 'hidden' }}
                    onClick={() => navigate(`/workspace/${ws.id}`)}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-primary)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--color-bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                        {ws.name[0]}
                      </div>
                      <div style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '12px', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: 'var(--color-accent)', fontWeight: '600' }}>Active</div>
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>{ws.name}</h3>
                    <p style={{ color: 'var(--color-text-dim)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Collaborate with your team on engineering projects and tasks.</p>
                    
                    <div className="flex items-center justify-between" style={{ paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                      <div className="flex items-center gap-2">
                        <Users size={14} color="var(--color-text-dim)" />
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)' }}>12 Members</span>
                      </div>
                      <div className="flex items-center gap-1" style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--color-primary)' }}>
                        Open Workspace <Zap size={14} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '2rem' }}>
              <section>
                <div className="flex items-center gap-2" style={{ marginBottom: '1.25rem' }}>
                  <Activity size={18} color="var(--color-text-dim)" />
                  <h2 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Recent Activity</h2>
                </div>
                <div className="card flex-col gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-3" style={{ paddingBottom: i < 3 ? '1rem' : 0, borderBottom: i < 3 ? '1px solid var(--color-border)' : 'none' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-bg-secondary)', flexShrink: 0 }}></div>
                      <div>
                        <div style={{ fontSize: '0.9rem' }}>
                          <span style={{ fontWeight: '600' }}>Prashant</span> pushed to <span style={{ color: 'var(--color-primary)', fontWeight: '500' }}>main</span> in <span style={{ fontWeight: '500' }}>backend-api</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)', marginTop: '0.25rem' }}>2 hours ago</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2" style={{ marginBottom: '1.25rem' }}>
                  <Clock size={18} color="var(--color-text-dim)" />
                  <h2 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Upcoming Events</h2>
                </div>
                <div className="card flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div style={{ padding: '0.5rem', borderRadius: '6px', backgroundColor: 'rgba(92, 94, 220, 0.1)', color: 'var(--color-primary)', fontSize: '0.7rem', textAlign: 'center', minWidth: '45px' }}>
                      <div style={{ fontWeight: 'bold' }}>JUN</div>
                      <div>05</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>Sprint Review</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)' }}>10:00 AM - 11:30 AM</div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
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
