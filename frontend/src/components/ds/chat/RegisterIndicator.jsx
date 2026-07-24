import React, { useState } from 'react';
/**
 * RegisterIndicator — pill chip showing which voice the persona is drawing from, with a
 * nudge menu to steer it. Vendored from the v2 design export (components/chat/
 * RegisterIndicator.jsx). Props unchanged. In the current static wiring it is display-only:
 * ChatScreen renders it for creators without an onNudge handler, so no switching occurs yet.
 */
export function RegisterIndicator({ registers = ['on-camera', 'conversational', 'written'], active = 'conversational', onNudge }) {
  const [open, setOpen] = useState(false);
  const meta = {
    'on-camera': { color: 'var(--register-oncamera)', tint: 'var(--register-oncamera-tint)', deep: 'var(--bronze-deep)', hint: 'Scripted, performed — intros, monologues' },
    'conversational': { color: 'var(--register-conversational)', tint: 'var(--register-conversational-tint)', deep: 'var(--lapis-deep)', hint: 'Long-form talk — podcasts, interviews' },
    'written': { color: 'var(--register-written)', tint: 'var(--register-written-tint)', deep: 'var(--verdigris)', hint: 'Books, posts, letters' },
  };
  const m = meta[active] || meta['conversational'];
  return (
    <div style={{ position: 'relative', display: 'inline-block', fontFamily: 'var(--font-body)' }}>
      <button onClick={() => setOpen(!open)} title="Change which voice replies draw from" style={{
        display: 'inline-flex', alignItems: 'center', gap: 8, background: m.tint, border: `1px solid ${m.color}`,
        borderRadius: 999, padding: '5px 12px', cursor: 'pointer', transition: 'background var(--dur-fast) var(--ease-out)',
      }}>
        <span style={{ width: 7, height: 7, borderRadius: 999, background: m.color }}></span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase', color: m.deep }}>{active} voice</span>
        <span style={{ color: m.deep, fontSize: 9 }}>▾</span>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 30, width: 300, background: 'var(--surface-card)', border: '1px solid var(--stone-line-strong)', borderRadius: 'var(--radius-2)', boxShadow: 'var(--shadow-overlay)', padding: 8 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '6px 10px' }}>Draw replies from</div>
          {registers.map(r => {
            const rm = meta[r];
            return (
              <button key={r} onClick={() => { setOpen(false); onNudge && onNudge(r); }} style={{
                display: 'block', width: '100%', textAlign: 'left', background: r === active ? rm.tint : 'none',
                border: 'none', borderRadius: 'var(--radius-1)', padding: '8px 10px', cursor: 'pointer', fontFamily: 'var(--font-body)',
              }}
                onMouseEnter={e => { if (r !== active) e.currentTarget.style.background = 'var(--surface-raised)'; }}
                onMouseLeave={e => { if (r !== active) e.currentTarget.style.background = 'none'; }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 7, height: 7, borderRadius: 999, background: rm.color }}></span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase', color: rm.deep }}>{r}</span>
                </span>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 2 }}>{rm.hint}</div>
              </button>
            );
          })}
          <div style={{ borderTop: '1px solid var(--stone-line)', marginTop: 6, padding: '8px 10px', fontSize: 'var(--text-sm)', fontStyle: 'italic', color: 'var(--text-muted)' }}>Or just ask: “talk to me like the podcast, not the show intro.”</div>
        </div>
      )}
    </div>
  );
}
