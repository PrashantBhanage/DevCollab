import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import useWorkspaceStore from '../stores/workspaceStore';
import toast from 'react-hot-toast';

function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { workspaces, loading, fetchWorkspaces, createWorkspace, joinWorkspace } = useWorkspaceStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceDescription, setWorkspaceDescription] = useState('');
  const [inviteCode, setInviteCode] = useState('');

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
    if (!inviteCode.trim()) {
      toast.error('Please enter an invite code');
      return;
    }

    const workspace = await joinWorkspace(inviteCode.trim());
    if (workspace) {
      toast.success('Joined workspace!');
      setShowJoinModal(false);
      setInviteCode('');
      navigate(`/workspace/${workspace.id}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <h1>DevCollab</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="member-avatar" style={{ background: '#534AB7', color: '#fff', width: '32px', height: '32px', fontSize: '12px' }}>
              {getInitials(user?.name)}
            </div>
            <span style={{ fontSize: '14px' }}>{user?.name}</span>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost" style={{ padding: '8px 16px' }}>
            Sign out
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <h2 className="section-title" style={{ margin: 0 }}>Your Workspaces</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setShowJoinModal(true)} className="btn btn-secondary">
              Join with code
            </button>
            <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
              Create workspace
            </button>
          </div>
        </div>

        {loading && workspaces.length === 0 ? (
          <div className="empty-state">
            <div className="loading-spinner" style={{ margin: '0 auto 16px' }} />
            <p>Loading workspaces...</p>
          </div>
        ) : workspaces.length === 0 ? (
          <div className="empty-state">
            <h3>No workspaces yet</h3>
            <p>Create a new workspace or join one with an invite code to get started.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
              <button onClick={() => setShowJoinModal(true)} className="btn btn-secondary">
                Join with code
              </button>
              <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
                Create workspace
              </button>
            </div>
          </div>
        ) : (
          <div className="workspace-grid">
            {workspaces.map((workspace) => (
              <div
                key={workspace.id}
                className="workspace-card"
                onClick={() => navigate(`/workspace/${workspace.id}`)}
              >
                <h3>{workspace.name}</h3>
                <p>{workspace.description || 'No description'}</p>
                <div className="member-count">
                  {workspace.memberCount || 1} member{workspace.memberCount !== 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create workspace</h2>
            <form onSubmit={handleCreateWorkspace}>
              <div className="form-group">
                <label>Workspace name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="My awesome project"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Description (optional)</label>
                <input
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

      {/* Join Modal */}
      {showJoinModal && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Join workspace</h2>
            <form onSubmit={handleJoinWorkspace}>
              <div className="form-group">
                <label>Invite code</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter invite code"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
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