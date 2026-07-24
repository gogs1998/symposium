import React from 'react';
/** A tappable opener suggestion shown in empty chats and figure intros. */
export function SuggestedQuestion({ text, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: 'var(--surface-card)', border: '1px solid var(--stone-line)', borderRadius: 'var(--radius-1)',
      padding: '10px 14px', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.5,
      transition: 'all var(--dur-fast) var(--ease-out)',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--stone-line-strong)'; e.currentTarget.style.background = 'var(--surface-raised)'; e.currentTarget.style.color = 'var(--text-body)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--stone-line)'; e.currentTarget.style.background = 'var(--surface-card)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
      <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'normal', color: 'var(--bronze)', marginRight: 8 }}>—</span>{text}
    </button>
  );
}
