import React from 'react';
/** Left rail listing past sessions grouped by figure. */
export function SessionSidebar({ sessions = [], activeId, onSelect, onNew }) {
  return (
    <div style={{ width: 260, display: 'flex', flexDirection: 'column', gap: 4, background: 'var(--surface-raised)', borderRight: '1px solid var(--stone-line)', padding: 'var(--space-4)', boxSizing: 'border-box', height: '100%', fontFamily: 'var(--font-body)' }}>
      <button onClick={onNew} style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)', letterSpacing: '0.06em', background: 'var(--surface-card)', border: '1px solid var(--stone-line-strong)', borderRadius: 'var(--radius-1)', padding: '10px 12px', cursor: 'pointer', color: 'var(--text-body)', marginBottom: 12 }}>+ NEW CONVERSATION</button>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '0 4px 6px' }}>Sessions</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {sessions.map(s => {
          const isActive = s.id === activeId;
          return (
            <button key={s.id} onClick={() => onSelect && onSelect(s.id)} style={{
              textAlign: 'left', background: isActive ? 'var(--accent-surface)' : 'none',
              border: isActive ? '1px solid var(--accent)' : '1px solid transparent', borderRadius: 'var(--radius-1)',
              padding: '8px 10px', cursor: 'pointer', fontFamily: 'var(--font-body)',
            }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--marble-2)'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'none'; }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)', color: 'var(--text-body)' }}>{s.figure}</div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.title}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>{s.when}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
