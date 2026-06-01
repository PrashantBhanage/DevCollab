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
    <div style={{
      width: 'var(--sidebar-width)',
      backgroundColor: 'var(--color-bg-sidebar)',
      borderRight: '1px solid var(--color-border)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh'
    }}>
      {/* Logo & Workspace Switcher */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
          <div className="flex items-center gap-2">
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>D</div>
            <span style={{ fontWeight: '700', fontSize: '1.1rem', letterSpacing: '-0.02em' }}>DevCollab</span>
          </div>
        </div>
        <button className="flex items-center justify-between w-full" style={{ padding: '0.5rem', borderRadius: '6px', backgroundColor: 'var(--color-bg-secondary)', fontSize: '0.9rem' }}>
          <span style={{ fontWeight: '500' }}>Select Workspace</span>
          <ChevronDown size={16} color="var(--color-text-dim)" />
        </button>
      </div>

      {/* Main Navigation */}
      <div style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
        <div className="flex-col gap-1" style={{ marginBottom: '2rem' }}>
          {menuItems.map(item => (
            <button 
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex items-center gap-3 w-full"
              style={{
                padding: '0.6rem 0.8rem',
                borderRadius: '6px',
                color: location.pathname === item.path ? 'var(--color-text-main)' : 'var(--color-text-muted)',
                backgroundColor: location.pathname === item.path ? 'var(--color-bg-secondary)' : 'transparent',
                fontSize: '0.9rem',
                fontWeight: location.pathname === item.path ? '500' : '400'
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        {/* Workspaces Section */}
        <div style={{ marginBottom: '2rem' }}>
          <div className="flex items-center justify-between" style={{ padding: '0 0.8rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-dim)', textTransform: 'uppercase' }}>Workspaces</span>
            <button style={{ color: 'var(--color-text-dim)' }}><Plus size={14} /></button>
          </div>
          <div className="flex-col gap-1">
            {workspaces.map((ws: any) => (
              <button 
                key={ws.id}
                onClick={() => navigate(`/workspace/${ws.id}`)}
                className="flex items-center gap-3 w-full"
                style={{
                  padding: '0.5rem 0.8rem',
                  borderRadius: '6px',
                  color: ws.id.toString() === workspaceId ? 'var(--color-text-main)' : 'var(--color-text-muted)',
                  backgroundColor: ws.id.toString() === workspaceId ? 'var(--color-bg-secondary)' : 'transparent',
                  fontSize: '0.9rem'
                }}
              >
                <div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: 'var(--color-accent)' }}></div>
                {ws.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* User Footer */}
      <div style={{ padding: '1rem', borderTop: '1px solid var(--color-border)' }}>
        <button 
          onClick={() => { logout(); navigate('/'); }}
          className="flex items-center gap-3 w-full"
          style={{
            padding: '0.6rem 0.8rem',
            borderRadius: '6px',
            color: '#ef4444',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
