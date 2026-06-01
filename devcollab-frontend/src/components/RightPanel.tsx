import { Sparkles, Calendar, CheckSquare, Clock } from 'lucide-react';

export default function RightPanel() {
  return (
    <aside style={{
      width: '380px',
      borderLeft: '4px solid var(--color-border)',
      backgroundColor: 'var(--color-bg-muted)',
      display: 'flex',
      flexDirection: 'column',
      padding: '32px',
      gap: '48px',
      overflowY: 'auto',
      backgroundImage: 'var(--pattern-diagonal)'
    }}>
      <section>
        <h3 className="flex items-center gap-2" style={{ fontSize: '12px', fontWeight: '900', color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)', marginBottom: '16px' }}>
          <Sparkles size={16} />
          AI Assistant
        </h3>
        <div style={{ padding: '24px', background: 'var(--color-text-main)', border: '4px solid var(--color-border)', color: 'var(--color-text-inverse)', backgroundImage: 'var(--pattern-dots)' }}>
          <p style={{ fontSize: '14px', marginBottom: '24px', fontWeight: 500 }}>Ask AI to debug code, explain errors, or optimize logic.</p>
          <button className="btn btn-primary btn-full" style={{ backgroundColor: 'var(--color-accent)', borderColor: 'var(--color-border)' }}>Ask Assistant</button>
        </div>
      </section>

      <section>
        <h3 className="flex items-center gap-2" style={{ fontSize: '12px', fontWeight: '900', color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)', marginBottom: '16px' }}>
          <CheckSquare size={16} />
          Recent Tasks
        </h3>
        <div className="flex-col gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3" style={{ fontSize: '14px', fontWeight: 700, padding: '12px', border: '2px solid var(--color-border)', backgroundColor: 'var(--color-bg-base)' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--color-accent)' }}></div>
              <span>Task item #{i} description</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="flex items-center gap-2" style={{ fontSize: '12px', fontWeight: '900', color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)', marginBottom: '16px' }}>
          <Calendar size={16} />
          Deadlines
        </h3>
        <div className="flex-col gap-3">
          <div className="flex justify-between items-center" style={{ fontSize: '14px', fontWeight: 700, padding: '12px', border: '2px solid var(--color-border)', backgroundColor: 'var(--color-bg-base)' }}>
            <span>Sprint Planning</span>
            <span className="flex items-center gap-1" style={{ color: 'var(--color-accent)' }}><Clock size={14} /> 2h</span>
          </div>
          <div className="flex justify-between items-center" style={{ fontSize: '14px', fontWeight: 700, padding: '12px', border: '2px solid var(--color-border)', backgroundColor: 'var(--color-bg-base)' }}>
            <span>API Review</span>
            <span style={{ color: 'var(--color-text-main)' }}>Tomorrow</span>
          </div>
        </div>
      </section>
    </aside>
  );
}
