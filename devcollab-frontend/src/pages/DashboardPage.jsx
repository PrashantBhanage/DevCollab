import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import useWorkspaceStore from '../stores/workspaceStore';
import AiPromoCard from '../components/AiPromoCard';
import toast from 'react-hot-toast';

function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { workspaces, loading, fetchWorkspaces, createWorkspace, joinWorkspace } = useWorkspaceStore();
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
  const ownerCount = workspaces.filter((w) => w.role === 'OWNER').length;

  const handleOpenAi = (workspaceId) => {
    navigate(`/workspace/${workspaceId}?panel=ai`);
  };

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <h1>DevCollab</h1>
        <div className="dashboard-header-actions">
          <div className="dashboard-user">
            <div className="member-avatar dashboard-avatar">
              {getInitials(displayName)}
            </div>
            <span>{displayName}</span>
          </div>
          <button type="button" onClick={handleLogout} className="btn btn-ghost">
            Sign out
          </button>
        </div>
      </header>

      <div className="dashboard-body">
        <aside className="dashboard-sidebar">
          <div className="dashboard-stat-card">
            <span className="dashboard-stat-label">Workspaces</span>
            <span className="dashboard-stat-value">{workspaces.length}</span>
          </div>
          <div className="dashboard-stat-card">
            <span className="dashboard-stat-label">You own</span>
            <span className="dashboard-stat-value">{ownerCount}</span>
          </div>
          <AiPromoCard workspaces={workspaces} onOpenAi={handleOpenAi} />
          <div className="dashboard-tip">
            <strong>Tip</strong>
            <p>Share your invite code so teammates can join instantly.</p>
          </div>
        </aside>

        <main className="dashboard-main">
          <section className="dashboard-hero">
            <h2>Build together</h2>
            <p>Create a workspace, invite your team, and collaborate with channels and AI.</p>
            <div className="dashboard-hero-actions">
              <button type="button" onClick={() => setShowCreateModal(true)} className="btn btn-primary">
                Create workspace
              </button>
              <button type="button" onClick={() => setShowJoinModal(true)} className="btn btn-secondary">
                Join with code
              </button>
            </div>
          </section>

          <div className="dashboard-section-header">
            <h3 className="section-title">Your workspaces</h3>
          </div>

          {loading && workspaces.length === 0 ? (
            <div className="empty-state">
              <div className="loading-spinner" style={{ margin: '0 auto 16px' }} />
              <p>Loading workspaces...</p>
            </div>
          ) : workspaces.length === 0 ? (
            <div className="empty-state dashboard-empty">
              <h3>No workspaces yet</h3>
              <p>Create a new workspace or join one with an invite code to get started.</p>
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
                  <div className="workspace-card-top">
                    <h3>{workspace.name}</h3>
                    <span className={`workspace-card-role role-${(workspace.role || 'MEMBER').toLowerCase()}`}>
                      {workspace.role || 'MEMBER'}
                    </span>
                  </div>
                  <p>{workspace.description || 'No description'}</p>
                  {workspace.inviteCode && (
                    <button
                      type="button"
                      className="invite-code-chip"
                      onClick={(e) => copyInviteCode(e, workspace.inviteCode)}
                      title="Copy invite code"
                    >
                      <span className="invite-code-label">Invite</span>
                      <code>{workspace.inviteCode}</code>
                    </button>
                  )}
                  <div className="workspace-card-footer">
                    <span>Click to open</span>
                    <button
                      type="button"
                      className="btn btn-ghost workspace-ai-link"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenAi(workspace.id);
                      }}
                    >
                      AI →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create workspace</h2>
            <form onSubmit={handleCreateWorkspace}>
              <div className="form-group">
                <label htmlFor="ws-name">Workspace name</label>
                <input
                  id="ws-name"
                  type="text"
                  className="form-input"
                  placeholder="My awesome project"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="ws-desc">Description (optional)</label>
                <input
                  id="ws-desc"
                  type="text"
                  className="form-input"
                  placeholder="What is this workspace for?"
                  value={workspaceDescription}
                  onChange={(e) => setWorkspaceDescription(e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-ghost">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
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
            <h2>Join workspace</h2>
            <form onSubmit={handleJoinWorkspace}>
              <div className="form-group">
                <label htmlFor="invite-code">Invite code</label>
                <input
                  id="invite-code"
                  type="text"
                  className="form-input"
                  placeholder="Enter invite code"
                  value={inviteCodeInput}
                  onChange={(e) => setInviteCodeInput(e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowJoinModal(false)} className="btn btn-ghost">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Join
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
