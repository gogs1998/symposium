import React from 'react';
/** Three dots stepping opacity — no bounce. Shown while a figure retrieves and writes. */
export function TypingIndicator({ label }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <style>{`@keyframes sym-dot{0%,60%,100%{opacity:.25}30%{opacity:1}}`}</style>
      <span style={{ display: 'inline-flex', gap: 5 }}>
        {[0, 1, 2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--ink-3)', animation: `sym-dot 1.3s ${i * 0.18}s infinite` }}></span>)}
      </span>
      {label && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{label}</span>}
    </div>
  );
}
