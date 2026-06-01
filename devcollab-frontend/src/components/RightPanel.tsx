import { Sparkles, Calendar, CheckSquare, Clock, Plus } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import useWorkspaceStore from '../stores/workspaceStore';
import { useState } from 'react';

export default function RightPanel() {
  const [_, setSearchParams] = useSearchParams();
  const { tasks, createTask, updateTaskStatus } = useWorkspaceStore() as any;
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    await createTask(newTaskTitle, '');
    setNewTaskTitle('');
  };

  const handleToggleTask = async (task: any) => {
    const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    await updateTaskStatus(task.id, newStatus);
  };

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
          <h3 className="label-mono" style={{ margin: 0 }}>Task Board</h3>
        </div>
        
        <form onSubmit={handleCreateTask} style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
          <input 
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            placeholder="New task..."
            style={{ flex: 1, padding: '0.5rem', border: '1px solid var(--color-border)', background: 'var(--color-bg-muted)', color: 'var(--color-text-main)', outline: 'none' }}
          />
          <button type="submit" className="btn-icon" style={{ border: '1px solid var(--color-border)' }}>
            <Plus size={16} strokeWidth={1.5} />
          </button>
        </form>

        <div className="flex-col gap-4">
          {tasks?.map((task: any, idx: number) => (
            <div key={task.id} className="flex items-baseline gap-3" style={{ cursor: 'pointer', opacity: task.status === 'DONE' ? 0.5 : 1 }} onClick={() => handleToggleTask(task)}>
              <span className="label-mono" style={{ color: 'var(--color-accent)' }}>0{idx + 1}</span>
              <span style={{ fontSize: '1rem', color: 'var(--color-text-main)', textDecoration: task.status === 'DONE' ? 'line-through' : 'none' }}>
                {task.title}
              </span>
            </div>
          ))}
          {!tasks?.length && (
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No tasks yet.</div>
          )}
        </div>
      </section>
    </aside>
  );
}
