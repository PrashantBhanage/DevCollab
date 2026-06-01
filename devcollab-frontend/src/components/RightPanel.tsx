import { Sparkles, Calendar, CheckSquare, Clock } from 'lucide-react';

export default function RightPanel() {
  return (
    <div style={{
      width: 'var(--right-panel-width)',
      borderLeft: '1px solid var(--color-border)',
      backgroundColor: 'var(--color-bg-sidebar)',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem',
      gap: '2rem',
      overflowY: 'auto'
    }}>
      <section>
        <h3 className="flex items-center gap-2" style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
          <Sparkles size={14} color="var(--color-primary)" />
          AI Assistant
        </h3>
        <div style={{ padding: '1rem', background: 'linear-gradient(135deg, #18181b 0%, #1e1e24 100%)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
          <p style={{ fontSize: '0.85rem', marginBottom: '1rem', color: 'var(--color-text-muted)' }}>Ask AI to debug code, explain errors, or optimize logic.</p>
          <button style={{ 
            width: '100%', 
            fontSize: '0.85rem', 
            padding: '0.5rem',
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}>Ask Assistant</button>
        </div>
      </section>

      <section>
        <h3 className="flex items-center gap-2" style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
          <CheckSquare size={14} />
          Recent Tasks
        </h3>
        <div className="flex-col gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3" style={{ fontSize: '0.85rem' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }}></div>
              <span style={{ color: 'var(--color-text-main)' }}>Task item #{i} description</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="flex items-center gap-2" style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
          <Calendar size={14} />
          Deadlines
        </h3>
        <div className="flex-col gap-3">
          <div className="flex justify-between items-center" style={{ fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Sprint Planning</span>
            <span className="flex items-center gap-1" style={{ color: '#ef4444' }}><Clock size={12} /> 2h</span>
          </div>
          <div className="flex justify-between items-center" style={{ fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>API Review</span>
            <span style={{ color: 'var(--color-text-dim)' }}>Tomorrow</span>
          </div>
        </div>
      </section>
    </div>
  );
}
