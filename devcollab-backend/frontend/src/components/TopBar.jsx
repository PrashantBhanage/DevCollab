import { Search, Bell, Plus, User } from 'lucide-react';
import useAuthStore from '../store/authStore';

export default function TopBar() {
  const { user } = useAuthStore();

  return (
    <div style={{
      height: 'var(--topbar-height)',
      borderBottom: '1px solid var(--color-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      backgroundColor: 'var(--color-bg-sidebar)'
    }}>
      <div style={{ position: 'relative', width: '400px' }}>
        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-dim)' }} />
        <input 
          placeholder="Search workspaces, channels, tasks..." 
          style={{ width: '100%', paddingLeft: '2.5rem', borderRadius: '20px', fontSize: '0.9rem' }}
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
          <Plus size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          New Workspace
        </button>
        <button style={{ color: 'var(--color-text-muted)' }}><Bell size={20} /></button>
        <div className="flex items-center gap-2" style={{ borderLeft: '1px solid var(--color-border)', paddingLeft: '1rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={18} />
          </div>
          <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{user?.username || 'User'}</span>
        </div>
      </div>
    </div>
  );
}
