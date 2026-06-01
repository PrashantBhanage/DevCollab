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
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <Sparkles size={20} />, label: 'AI Assistant', path: `/workspace/${workspaceId}?panel=ai` },
    { icon: <Settings size={20} />, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside className="sidebar">
      {/* Logo & Workspace Switcher */}
      <div className="sidebar-header">
        <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
          <div className="flex items-center gap-2">
            <div className="brand-mark" style={{ width: '32px', height: '32px', fontSize: '18px' }}>D</div>
            <h2 style={{ fontSize: '1.25rem', letterSpacing: 'var(--tracking-tighter)' }}>DevCollab</h2>
          </div>
        </div>
        <button className="flex items-center justify-between w-full" style={{ padding: '8px 12px', border: '2px solid var(--color-border)', backgroundColor: 'var(--color-bg-base)', fontWeight: 900, textTransform: 'uppercase', fontSize: '12px' }}>
          <span>Select Workspace</span>
          <ChevronDown size={16} />
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
                className={`nav-item w-full ${isActive ? 'active' : ''}`}
                style={{ textAlign: 'left', background: isActive ? 'var(--color-text-main)' : 'transparent', border: 'none', borderLeft: isActive ? '8px solid var(--color-accent)' : '8px solid transparent' }}
              >
                <span className="channel-icon">{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Workspaces Section */}
        <div className="nav-section">
          <div className="flex items-center justify-between" style={{ paddingRight: '24px' }}>
            <h3 className="nav-section-title">Workspaces</h3>
            <button style={{ color: 'var(--color-text-main)', border: 'none', background: 'transparent', cursor: 'pointer', paddingBottom: '16px' }}><Plus size={16} /></button>
          </div>
          <div className="flex-col">
            {workspaces.map((ws: any) => {
              const isActive = ws.id.toString() === workspaceId;
              return (
                <button 
                  key={ws.id}
                  onClick={() => navigate(`/workspace/${ws.id}`)}
                  className={`nav-item w-full ${isActive ? 'active' : ''}`}
                  style={{ textAlign: 'left', background: isActive ? 'var(--color-text-main)' : 'transparent', border: 'none', borderLeft: isActive ? '8px solid var(--color-accent)' : '8px solid transparent' }}
                >
                  <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--color-accent)', marginRight: '12px' }}></div>
                  {ws.name}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* User Footer */}
      <div className="user-section">
        <button 
          onClick={() => { logout(); navigate('/'); }}
          className="nav-item w-full"
          style={{ color: 'var(--color-accent)', border: 'none', background: 'transparent', textAlign: 'left' }}
        >
          <LogOut size={20} className="channel-icon" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
