import React from 'react';
/** A chat message. Figure replies read like a manuscript page; user messages are ink plaques. */
export function MessageBubble({ role = 'assistant', author, register, children, citations }) {
  if (role === 'user') {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ maxWidth: '72%', background: 'var(--ink-1)', color: 'var(--ink-inverse)', borderRadius: 'var(--radius-2)', padding: '12px 16px', fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', lineHeight: 1.55 }}>{children}</div>
      </div>
    );
  }
  if (role === 'system') {
    return <div style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '4px 0' }}>{children}</div>;
  }
  const regColor = register === 'on-camera' ? 'var(--register-oncamera)' : register === 'written' ? 'var(--register-written)' : 'var(--register-conversational)';
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
      <div style={{ maxWidth: '82%', fontFamily: 'var(--font-body)' }}>
        {(author || register) && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
            {author && <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', letterSpacing: '0.03em' }}>{author}</span>}
            {register && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase', color: regColor }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: regColor, display: 'inline-block' }}></span>{register} voice</span>}
          </div>
        )}
        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--stone-line)', borderRadius: 'var(--radius-2)', boxShadow: 'var(--shadow-1)', padding: '14px 18px', fontSize: 'var(--text-base)', lineHeight: 'var(--leading-body)', color: 'var(--text-body)', whiteSpace: 'pre-wrap' }}>
          {children}
          {citations && citations.length > 0 && <div style={{ borderTop: 'var(--rule-double)', marginTop: 14, paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>{citations}</div>}
        </div>
      </div>
    </div>
  );
}
