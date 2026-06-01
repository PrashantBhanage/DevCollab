import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import useWorkspaceStore from '../stores/workspaceStore';
import AiPromoCard from '../components/AiPromoCard';
import toast from 'react-hot-toast';
import { Copy, Plus, Users, Monitor, ArrowRight } from 'lucide-react';

function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore() as any;
  const { workspaces, loading, fetchWorkspaces, createWorkspace, joinWorkspace } = useWorkspaceStore() as any;
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceDescription, setWorkspaceDescription] = useState('');
  const [inviteCodeInput, setInviteCodeInput] = useState('');

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!workspaceName.trim()) {
      toast.error('Please enter a workspace name');
      return;
    }

    const workspace = await createWorkspace(workspaceName, workspaceDescription);
    if (workspace) {
      toast.success('Workspace created!');
      setShowCreateModal(false);
      setWorkspaceName('');
      setWorkspaceDescription('');
      navigate(`/workspace/${workspace.id}`);
    }
  };

  const handleJoinWorkspace = async (e) => {
    e.preventDefault();
    if (!inviteCodeInput.trim()) {
      toast.error('Please enter an invite code');
      return;
    }

    const workspace = await joinWorkspace(inviteCodeInput.trim());
    if (workspace) {
      toast.success('Joined workspace!');
      setShowJoinModal(false);
      setInviteCodeInput('');
      navigate(`/workspace/${workspace.id}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const copyInviteCode = (e, code) => {
    e.stopPropagation();
    if (!code) return;
    navigator.clipboard.writeText(code);
    toast.success('Invite code copied');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const displayName = user?.username || user?.name || 'User';

  const handleOpenAi = (workspaceId) => {
    navigate(`/workspace/${workspaceId}?panel=ai`);
  };

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <div className="dashboard-brand">DevCollab</div>
        <div className="dashboard-header-actions">
          <div className="user-chip">
            <div className="user-avatar">
              {getInitials(displayName)}
            </div>
            <span>{displayName}</span>
          </div>
          <button type="button" onClick={handleLogout} className="btn-ghost" style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em' }}>
            Sign out
          </button>
        </div>
      </header>

      <div className="dashboard-body">
        <main className="dashboard-main">
          <div className="dashboard-content">
            
            <section className="dashboard-hero">
              <h1 className="headline-hero">Build<br/>together.</h1>
              <p>Create a workspace, invite your team, and collaborate with channels and AI. Your ideas, executed decisively.</p>
              
              <div className="flex gap-6 items-center flex-wrap">
                <button type="button" onClick={() => setShowCreateModal(true)} className="btn btn-primary" style={{ padding: '1rem 0' }}>
                  <span className="flex items-center gap-2">Create Workspace <ArrowRight size={20} /></span>
                </button>
                <button type="button" onClick={() => setShowJoinModal(true)} className="btn btn-secondary">
                  Join with code
                </button>
              </div>
            </section>

            <div className="section-header">
              <h2 className="headline-section">Workspaces</h2>
              <span className="workspace-count">{workspaces.length} active</span>
            </div>

            {loading && workspaces.length === 0 ? (
              <div className="empty-state-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: 'none' }}>
                <div className="loading-spinner" />
                <span className="label-mono">Loading data</span>
              </div>
            ) : workspaces.length === 0 ? (
              <div className="empty-state-card">
                <h3>Empty canvas</h3>
                <p>You don't have any workspaces yet. Time to start building.</p>
              </div>
            ) : (
              <div className="workspace-grid">
                {workspaces.map((workspace) => (
                  <div
                    key={workspace.id}
                    className="workspace-card"
                    onClick={() => navigate(`/workspace/${workspace.id}`)}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/workspace/${workspace.id}`)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="workspace-card-role">
                      {workspace.role || 'Member'}
                    </div>
                    
                    <h3>{workspace.name}</h3>
                    <p>{workspace.description || 'No description provided.'}</p>
                    
                    <div className="flex items-end justify-between mt-auto">
                      {workspace.inviteCode ? (
                        <button
                          type="button"
                          className="invite-code-chip flex-1"
                          style={{ maxWidth: '60%' }}
                          onClick={(e) => copyInviteCode(e, workspace.inviteCode)}
                          title="Copy invite code"
                        >
                          <Copy size={16} />
                          <code>{workspace.inviteCode}</code>
                        </button>
                      ) : (
                        <div className="flex-1"></div>
                      )}
                      
                      <button
                        type="button"
                        className="btn-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenAi(workspace.id);
                        }}
                      >
                        <Monitor size={24} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>New Workspace</h2>
            <form onSubmit={handleCreateWorkspace}>
              <div className="form-group">
                <label htmlFor="ws-name">Name</label>
                <input
                  id="ws-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Apollo Project"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="ws-desc">Description</label>
                <input
                  id="ws-desc"
                  type="text"
                  className="form-input"
                  placeholder="What are we building?"
                  value={workspaceDescription}
                  onChange={(e) => setWorkspaceDescription(e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-ghost">
                  Cancel
                </button>
                <button type="submit" className="btn btn-secondary">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showJoinModal && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Join Workspace</h2>
            <form onSubmit={handleJoinWorkspace}>
              <div className="form-group">
                <label htmlFor="invite-code">Access Code</label>
                <input
                  id="invite-code"
                  type="text"
                  className="form-input"
                  placeholder="Enter the 8-character code"
                  value={inviteCodeInput}
                  onChange={(e) => setInviteCodeInput(e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowJoinModal(false)} className="btn btn-ghost">
                  Cancel
                </button>
                <button type="submit" className="btn btn-secondary">
                  Enter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
