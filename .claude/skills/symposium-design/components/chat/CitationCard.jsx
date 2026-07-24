import React from 'react';
/** A source citation. Book variant shows title + locator; video variant adds thumbnail + timestamp deep-link. */
export function CitationCard({ type = 'book', title, locator, excerpt, timestamp, date, thumbnail, href, onClick }) {
  const isVideo = type === 'video';
  const accent = isVideo ? 'var(--bronze)' : 'var(--bronze-deep)';
  return (
    <a href={href || '#'} onClick={e => { if (!href) e.preventDefault(); onClick && onClick(); }} style={{
      display: 'flex', gap: 12, alignItems: 'flex-start', textDecoration: 'none', border: '1px solid var(--stone-line)',
      borderRadius: 'var(--radius-1)', background: 'var(--bronze-tint)', padding: '10px 12px', color: 'var(--text-body)',
      transition: 'border-color var(--dur-fast) var(--ease-out)', borderBottom: '1px solid var(--stone-line)',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--bronze)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--stone-line)'}>
      {isVideo && <div style={{ width: 64, height: 40, flexShrink: 0, borderRadius: 'var(--radius-1)', background: 'var(--ink-1)', overflow: 'hidden', position: 'relative' }}>
        {thumbnail && <img src={thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(.6)' }} />}
        <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-inverse)', fontSize: 10 }}>▶</span>
      </div>}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase', color: accent }}>
          {isVideo ? 'Video source' : 'Book source'}{timestamp && <span> · {timestamp}</span>}{date && <span> · {date}</span>}
        </div>
        <div style={{ fontSize: 'var(--text-sm)', marginTop: 2 }}><span style={{ fontStyle: 'italic' }}>{title}</span>{locator && <span style={{ color: 'var(--text-secondary)' }}> · {locator}</span>}</div>
        {excerpt && <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>“{excerpt}”</div>}
      </div>
    </a>
  );
}
