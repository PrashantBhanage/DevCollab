import { Search, Bell, Plus, User } from 'lucide-react';
import useAuthStore from '../stores/authStore';

export default function TopBar() {
  const { user } = useAuthStore() as any;

  return (
    <header style={{
      height: '80px',
      borderBottom: '4px solid var(--color-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      backgroundColor: 'var(--color-bg-base)'
    }}>
      <div style={{ position: 'relative', width: '480px' }}>
        <Search size={24} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-main)' }} />
        <input 
          placeholder="Search workspaces, channels, tasks..." 
          style={{ 
            width: '100%', 
            padding: '12px 16px 12px 56px', 
            fontSize: '14px',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: 'var(--tracking-wide)',
            backgroundColor: 'var(--color-bg-muted)',
            border: '4px solid var(--color-border)',
            color: 'var(--color-text-main)',
            outline: 'none'
          }}
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="btn btn-primary btn-sm">
          <Plus size={16} style={{ marginRight: '8px' }} />
          New Workspace
        </button>
        <button className="btn-icon">
          <Bell size={24} />
        </button>
        <div className="flex items-center gap-3" style={{ borderLeft: '4px solid var(--color-border)', paddingLeft: '16px' }}>
          <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--color-text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-inverse)' }}>
            <User size={20} />
          </div>
          <span style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)' }}>{user?.username || 'User'}</span>
        </div>
      </div>
    </header>
  );
}
