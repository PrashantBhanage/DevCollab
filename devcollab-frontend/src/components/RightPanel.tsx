import { Sparkles, Calendar, CheckSquare, Clock } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export default function RightPanel() {
  const [_, setSearchParams] = useSearchParams();

  return (
    <aside style={{
      width: 'var(--right-panel-width)',
      borderLeft: '1px solid var(--color-border)',
      backgroundColor: 'var(--color-bg-base)',
      display: 'flex',
      flexDirection: 'column',
      padding: '2rem',
      gap: '4rem',
      overflowY: 'auto'
    }}>
      <section>
        <div className="flex items-center gap-2" style={{ marginBottom: '1.5rem' }}>
          <Sparkles size={16} strokeWidth={1.5} color="var(--color-accent)" />
          <h3 className="label-mono" style={{ margin: 0, color: 'var(--color-text-main)' }}>AI Assistant</h3>
        </div>
        <p style={{ fontSize: '1rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          Ask AI to debug code, explain errors, or optimize logic directly in your context.
        </p>
        <button 
          className="btn btn-secondary btn-full"
          onClick={() => setSearchParams({ panel: 'ai' })}
        >
          Ask Assistant
        </button>
      </section>

      <section>
        <div className="flex items-center gap-2" style={{ marginBottom: '1.5rem' }}>
          <CheckSquare size={16} strokeWidth={1.5} />
          <h3 className="label-mono" style={{ margin: 0 }}>Recent Tasks</h3>
        </div>
        <div className="flex-col gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-baseline gap-3">
              <span className="label-mono" style={{ color: 'var(--color-accent)' }}>0{i}</span>
              <span style={{ fontSize: '1rem', color: 'var(--color-text-main)' }}>Review pull request for auth</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2" style={{ marginBottom: '1.5rem' }}>
          <Calendar size={16} strokeWidth={1.5} />
          <h3 className="label-mono" style={{ margin: 0 }}>Deadlines</h3>
        </div>
        <div className="flex-col gap-4">
          <div className="flex justify-between items-center border-b border-color-border pb-2">
            <span style={{ fontSize: '1rem' }}>Sprint Planning</span>
            <span className="label-mono flex items-center gap-1" style={{ color: 'var(--color-accent)' }}>
              <Clock size={12} strokeWidth={1.5} /> 2h
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-color-border pb-2">
            <span style={{ fontSize: '1rem' }}>API Review</span>
            <span className="label-mono">Tomorrow</span>
          </div>
        </div>
      </section>
    </aside>
  );
}
