import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Sparkles, 
  Settings, 
  Plus, 
  ChevronDown,
  LogOut
} from 'lucide-react';
import useWorkspaceStore from '../stores/workspaceStore';
import useAuthStore from '../stores/authStore';

export default function Sidebar({ workspaceId }: { workspaceId?: string }) {
  const { workspaces } = useWorkspaceStore() as any;
  const { logout } = useAuthStore() as any;
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: <LayoutDashboard size={20} strokeWidth={1.5} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <Sparkles size={20} strokeWidth={1.5} />, label: 'AI Assistant', path: `/workspace/${workspaceId}?panel=ai` },
    { icon: <Settings size={20} strokeWidth={1.5} />, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.25rem', letterSpacing: 'var(--tracking-tighter)' }}>
          DevCollab
        </h2>
      </div>

      <div style={{ padding: '2rem 2rem 0' }}>
        <button className="flex items-center justify-between w-full" onClick={() => navigate('/dashboard')} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-main)', padding: '0', cursor: 'pointer', outline: 'none' }}>
          <span className="label-mono" style={{ color: 'var(--color-text-main)' }}>Select Workspace</span>
          <ChevronDown size={16} strokeWidth={1.5} color="var(--color-text-muted)" />
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section">
          {menuItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <button 
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="channel-icon" style={{ color: isActive ? 'var(--color-accent)' : 'inherit' }}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Workspaces Section */}
        <div className="nav-section">
          <div className="flex items-center justify-between" style={{ paddingRight: '2rem' }}>
            <h3 className="nav-section-title">Workspaces</h3>
            <button className="btn-icon" onClick={() => navigate('/dashboard')}><Plus size={16} strokeWidth={1.5} /></button>
          </div>
          <div className="flex-col">
            {workspaces.map((ws: any) => {
              const isActive = ws.id.toString() === workspaceId;
              return (
                <button 
                  key={ws.id}
                  onClick={() => navigate(`/workspace/${ws.id}`)}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <span className="channel-icon label-mono" style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)', fontSize: '1rem', width: '20px', textAlign: 'left' }}>#</span>
                  {ws.name}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="user-section">
        <button 
          onClick={() => { logout(); navigate('/'); }}
          className="nav-item"
          style={{ padding: '0', color: 'var(--color-text-muted)' }}
        >
          <LogOut size={20} strokeWidth={1.5} className="channel-icon" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
