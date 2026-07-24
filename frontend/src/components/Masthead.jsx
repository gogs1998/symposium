import { Button } from './ds'

export function Masthead() {
  return (
    <header style={{ borderBottom: '1px solid var(--border-line)', background: 'var(--surface-page)' }}>
      <div className="sym-masthead" style={{ maxWidth: 'var(--width-page)', margin: '0 auto', padding: '0 var(--space-8)', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="sym-masthead-brand" style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
          <span style={{ font: 'var(--fw-regular) 26px/1 var(--font-display)', letterSpacing: '0.02em', color: 'var(--text-strong)' }}>Symposium</span>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)' }} />
          <span className="sym-eyebrow sym-masthead-tagline" style={{ fontSize: 11 }}>The reading room</span>
        </div>
        <div className="sym-masthead-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Button variant="quiet" size="sm">About</Button>
          <Button variant="secondary" size="sm">Sign in</Button>
        </div>
      </div>
    </header>
  )
}
