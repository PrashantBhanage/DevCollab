import { Search, Bell, Plus, User } from 'lucide-react';
import useAuthStore from '../stores/authStore';

export default function TopBar() {
  const { user } = useAuthStore() as any;

  return (
    <header style={{
      height: 'var(--topbar-height)',
      borderBottom: '1px solid var(--color-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      backgroundColor: 'var(--color-bg-base)'
    }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
        <Search size={20} strokeWidth={1.5} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
        <input 
          placeholder="Search..." 
          style={{ 
            width: '100%', 
            padding: '0 1rem 0 3rem', 
            height: '3rem',
            fontFamily: 'var(--font-body)',
            fontSize: '1rem',
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--color-text-main)',
            outline: 'none'
          }}
        />
      </div>

      <div className="flex items-center gap-6">
        <button className="btn btn-primary" style={{ padding: '0', height: 'auto', fontSize: '0.875rem' }}>
          <span className="flex items-center gap-2">
            New Workspace
          </span>
        </button>
        <button className="btn-icon">
          <Bell size={20} strokeWidth={1.5} />
        </button>
        <div className="flex items-center gap-3">
          <div className="user-avatar" style={{ border: 'none' }}>
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}
