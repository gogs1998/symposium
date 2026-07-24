import React from 'react';
/**
 * SourcesPanel — the trust surface: a slide-in panel cataloguing the figure's corpus,
 * what "grounded" means, and the ethics note. Vendored from the v2 design export
 * (components/trust/SourcesPanel.jsx). Props unchanged from the export.
 */
export function SourcesPanel({ figureName, basis = 'published writings', totals, books = [], videos = [], collections = [], onClose }) {
  const Label = ({ children, color = 'var(--text-muted)' }) => (
    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase', color }}>{children}</div>
  );
  return (
    <div style={{ width: 420, maxWidth: '100%', height: '100%', boxSizing: 'border-box', background: 'var(--surface-card)', borderLeft: '1px solid var(--stone-line-strong)', boxShadow: 'var(--shadow-overlay)', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-body)', color: 'var(--text-body)' }}>
      <div style={{ padding: '20px 24px 16px', borderBottom: 'var(--rule-double)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Label>The corpus</Label>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', lineHeight: 1.15, marginTop: 4 }}>{figureName}</div>
          {totals && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 6 }}>{totals}</div>}
        </div>
        <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: '1px solid var(--stone-line)', borderRadius: 'var(--radius-1)', width: 28, height: 28, cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1 }}>×</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Everything this recreation says is retrieved from the corpus below, and every reply cites the passage it drew on. Nothing is invented beyond it.
        </div>
        {books.length > 0 && <section>
          <Label color="var(--bronze-deep)">Books &amp; writings · {books.length}</Label>
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 8 }}>
            {books.map((b, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline', padding: '9px 0', borderBottom: '1px solid var(--stone-line)' }}>
                <span style={{ fontSize: 'var(--text-sm)', fontStyle: 'italic' }}>{b.title}<span style={{ fontStyle: 'normal', color: 'var(--text-muted)' }}>{b.year ? ` (${b.year})` : ''}</span></span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{b.size}</span>
              </div>
            ))}
          </div>
        </section>}
        {videos.length > 0 && <section>
          <Label color="var(--bronze-deep)">Video &amp; audio · {videos.length}</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {videos.map((v, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 72, height: 44, flexShrink: 0, borderRadius: 'var(--radius-1)', background: 'var(--ink-1)', overflow: 'hidden', position: 'relative' }}>
                  {v.thumbnail && <img src={v.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(.6)' }} />}
                  <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-inverse)', fontSize: 10 }}>▶</span>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 'var(--text-sm)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.title}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>{v.duration}{v.date ? ` · ${v.date}` : ''}</div>
                </div>
              </div>
            ))}
          </div>
        </section>}
        {collections.length > 0 && <section>
          <Label color="var(--bronze-deep)">Post collections · {collections.length}</Label>
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 8 }}>
            {collections.map((c, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline', padding: '9px 0', borderBottom: '1px solid var(--stone-line)' }}>
                <span style={{ fontSize: 'var(--text-sm)' }}>{c.title}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{c.size}</span>
              </div>
            ))}
          </div>
        </section>}
        <section style={{ background: 'var(--surface-raised)', border: '1px solid var(--stone-line)', borderRadius: 'var(--radius-2)', padding: '14px 16px' }}>
          <Label>What “grounded” means</Label>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 6 }}>
            Before every reply, the most relevant passages are retrieved from this corpus. The persona writes from those passages — in {figureName ? `${figureName}’s` : 'the subject’s'} documented voice — and shows you which ones it used.
          </div>
        </section>
        <section style={{ borderTop: 'var(--rule-double)', paddingTop: 14 }}>
          <Label>On recreating a person</Label>
          <div style={{ fontSize: 'var(--text-sm)', fontStyle: 'italic', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 6 }}>
            This is an interpretation built from {basis} — not the person, and not their estate’s voice. Where the corpus is silent, the recreation says so rather than guessing.
          </div>
        </section>
      </div>
    </div>
  );
}
