import React from 'react';
/** Underlined tab row for roster categories. */
export function CategoryTabs({ tabs, active, onChange, counts = {} }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--space-5)', borderBottom: '1px solid var(--stone-line)' }}>
      {tabs.map(t => {
        const isActive = t === active;
        return (
          <button key={t} onClick={() => onChange && onChange(t)} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '10px 2px 12px',
            fontFamily: 'var(--font-display)', fontSize: 'var(--text-md)', letterSpacing: '0.04em',
            color: isActive ? 'var(--text-body)' : 'var(--text-muted)',
            borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
            marginBottom: -1, transition: 'color var(--dur-fast) var(--ease-out)',
          }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)'; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-muted)'; }}>
            {t}{counts[t] != null && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginLeft: 8 }}>{counts[t]}</span>}
          </button>
        );
      })}
    </div>
  );
}
