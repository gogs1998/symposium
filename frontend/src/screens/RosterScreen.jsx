import React from 'react'
import { FigureCard, CategoryTabs } from '../components/ds'
import { Masthead } from '../components/Masthead'

function RosterSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-5)' }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} aria-hidden style={{ height: 208, background: 'var(--surface-card)', border: '1px solid var(--border-line)', borderRadius: 'var(--radius-md)', opacity: 0.5 }} />
      ))}
    </div>
  )
}

export function RosterScreen({ figures, loading, onOpenFigure }) {
  const [cat, setCat] = React.useState('historical')
  const counts = {
    historical: figures.filter((f) => f.category === 'historical').length,
    creator: figures.filter((f) => f.category === 'creator').length,
  }
  const shown = figures.filter((f) => f.category === cat)

  return (
    <div style={{ minHeight: '100%', background: 'var(--surface-page)', backgroundImage: 'var(--texture-grain)' }}>
      <Masthead />
      <main style={{ maxWidth: 'var(--width-page)', margin: '0 auto', padding: 'var(--space-10) var(--space-8) var(--space-12)' }}>
        <div style={{ maxWidth: 780, marginBottom: 'var(--space-9)' }}>
          <span className="sym-eyebrow">A room of remarkable people</span>
          <h1 style={{ margin: '14px 0 0', font: 'var(--fw-regular) var(--text-5xl)/1.02 var(--font-display)', color: 'var(--text-strong)', textWrap: 'balance' }}>
            Sit with the minds that shaped us —<br />and the ones shaping us now.
          </h1>
          <p style={{ margin: '20px 0 0', maxWidth: '58ch', font: 'var(--fw-regular) var(--text-lg)/1.6 var(--font-serif)', color: 'var(--text-muted)', textWrap: 'pretty' }}>
            Every figure is an AI recreation, grounded in their own words. Ask, and each reply cites its source — a passage from the page, or the exact moment in a video.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 'var(--space-7)', flexWrap: 'wrap', gap: '16px' }}>
          <CategoryTabs value={cat} onChange={setCat} counts={counts} />
          <span style={{ font: 'var(--fw-regular) var(--text-sm)/1 var(--font-mono)', color: 'var(--text-faint)' }}>
            {shown.filter((f) => f.status === 'published').length} available · {shown.filter((f) => f.status === 'coming-soon').length} coming soon
          </span>
        </div>

        {loading ? (
          <RosterSkeleton />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-5)' }}>
            {shown.map(({ chunkCount, fields, openers, imageUrl, ...card }) => (
              <FigureCard key={card.id} {...card} src={imageUrl} onClick={() => card.status !== 'coming-soon' && onOpenFigure(shown.find((f) => f.id === card.id))} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
