import React, { useState } from 'react';
/** The chat input bar: text field + send, fixed at the bottom of a chat column. */
export function Composer({ placeholder = 'Ask anything…', disabled = false, onSend }) {
  const [value, setValue] = useState('');
  const submit = e => { e.preventDefault(); if (!value.trim() || disabled) return; onSend && onSend(value); setValue(''); };
  return (
    <form onSubmit={submit} style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>
      <input value={value} onChange={e => setValue(e.target.value)} placeholder={placeholder} disabled={disabled} style={{
        flex: 1, fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--text-body)',
        background: 'var(--surface-card)', border: '1px solid var(--stone-line-strong)', borderRadius: 'var(--radius-1)',
        padding: '12px 16px', outline: 'none',
      }}
        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        onBlur={e => e.target.style.borderColor = 'var(--stone-line-strong)'} />
      <button type="submit" disabled={disabled || !value.trim()} style={{
        fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', letterSpacing: '0.06em',
        background: value.trim() && !disabled ? 'var(--ink-1)' : 'var(--surface-inset)',
        color: value.trim() && !disabled ? 'var(--ink-inverse)' : 'var(--text-muted)',
        border: 'none', borderRadius: 'var(--radius-1)', padding: '0 22px', cursor: value.trim() && !disabled ? 'pointer' : 'default',
        transition: 'background var(--dur-fast) var(--ease-out)',
      }}>SEND</button>
    </form>
  );
}
