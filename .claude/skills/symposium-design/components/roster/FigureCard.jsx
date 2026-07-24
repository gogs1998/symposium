import React from 'react';
/** A roster plaque for one figure or creator. */
export function FigureCard({ name, era, description, categories = [], fields = [], available = true, selected = false, kind = 'historical', portrait, onClick }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('');
  return (
    <button onClick={available ? onClick : undefined} disabled={!available} style={{
      display: 'block', width: '100%', textAlign: 'left', cursor: available ? 'pointer' : 'default',
      background: selected ? 'var(--accent-surface)' : 'var(--surface-card)',
      border: `1px solid ${selected ? 'var(--accent)' : 'var(--stone-line)'}`,
      borderRadius: 'var(--radius-2)', boxShadow: 'var(--shadow-1)', padding: 'var(--space-5)',
      opacity: available ? 1 : 0.55, fontFamily: 'var(--font-body)', color: 'var(--text-body)',
      transition: 'border-color var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out)',
    }}
      onMouseEnter={e => { if (available && !selected) e.currentTarget.style.borderColor = 'var(--stone-line-strong)'; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = 'var(--stone-line)'; }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{ width: 48, height: 48, borderRadius: '999px', flexShrink: 0, overflow: 'hidden', background: 'var(--surface-inset)', border: '1px solid var(--stone-line-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {portrait ? <img src={portrait} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) contrast(1.05)' }} /> :
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--text-secondary)' }}>{initials}</span>}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase', color: kind === 'creator' ? 'var(--bronze-deep)' : 'var(--text-muted)' }}>
            {(categories[0] || (kind === 'creator' ? 'Creator' : 'Historical'))} · {era}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', lineHeight: 1.2, marginTop: 4 }}>{name}</div>
        </div>
      </div>
      <div style={{ borderBottom: 'var(--rule-double)', margin: '12px 0' }}></div>
      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{description}</div>
      {fields.length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
        {fields.map(f => <span key={f} style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', background: 'var(--surface-raised)', border: '1px solid var(--stone-line)', borderRadius: 'var(--radius-1)', padding: '2px 8px' }}>{f}</span>)}
      </div>}
      {!available && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 12 }}>No sources ingested yet</div>}
    </button>
  );
}
