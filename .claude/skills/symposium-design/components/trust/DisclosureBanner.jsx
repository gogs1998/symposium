import React from 'react';
/** The honesty line. Persistent, quiet, never dismissible-looking. */
export function DisclosureBanner({ figureName, basis = 'published writings', compact = false }) {
  const text = figureName
    ? <>This is an AI recreation built from {figureName}’s {basis}. It is not {figureName}.</>
    : <>Every persona here is an AI recreation, grounded in and citing its subject’s own words.</>;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface-raised)',
      borderTop: '1px solid var(--stone-line)', borderBottom: '1px solid var(--stone-line)',
      padding: compact ? '6px 14px' : '10px 16px', fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-sm)', fontStyle: 'italic', color: 'var(--text-secondary)', justifyContent: 'center', textAlign: 'center',
    }}>
      <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'normal', color: 'var(--bronze)', fontSize: 'var(--text-sm)' }}>§</span>
      <span>{text}</span>
    </div>
  );
}
