import React from 'react'
import { FigurePortrait, SuggestedQuestion, DisclosureBanner, Button } from '../components/ds'
import { adaptSources } from '../lib/adapters'
import { api } from '../lib/api'

// Openers fallback mirrors the ChatScreen empty state, so a figure with no
// authored openers still gets sensible prompts on the intro.
const DEFAULT_OPENERS = [
  'What should I ask you first?',
  'What did you spend your life thinking about?',
  'What do people most often get wrong about you?',
]

/**
 * FigureIntroScreen — the roster → intro → chat waypoint. Vendored from the v2
 * design export (ui_kits/app/FigureIntroScreen.jsx) with the demo globals replaced
 * by real DS components + live data: portrait, description, a corpus summary drawn
 * from the sources endpoint, suggested openers, and the disclosure banner.
 */
export function FigureIntroScreen({ figure, onBegin, onBack, onOpenWith }) {
  const [totals, setTotals] = React.useState('')
  React.useEffect(() => {
    let live = true
    api.figureSources(figure.id)
      .then((res) => { if (live) setTotals(adaptSources(res).totals) })
      .catch(() => { if (live) setTotals('') })
    return () => { live = false }
  }, [figure.id])

  const openers = figure.openers?.length ? figure.openers : DEFAULT_OPENERS

  return (
    <div style={{ minHeight: '100%', background: 'var(--surface-page)', backgroundImage: 'var(--texture-grain)' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: 'var(--space-8) var(--space-6)' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase', color: 'var(--text-muted)', padding: 0 }}>← The roster</button>

        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--stone-line)', borderRadius: 'var(--radius-2)', boxShadow: 'var(--shadow-1)', marginTop: 'var(--space-4)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', gap: 'var(--space-5)', padding: 'var(--space-6)', alignItems: 'center' }}>
            <FigurePortrait name={figure.name} src={figure.imageUrl} category={figure.category} accentColor={figure.accentColor} size={96} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase', color: figure.category === 'creator' ? 'var(--bronze-deep)' : 'var(--text-muted)' }}>
                {(figure.category === 'creator' ? 'Creator' : 'Historical')} · {figure.meta}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', lineHeight: 'var(--leading-tight)', marginTop: 4, color: 'var(--text-strong)' }}>{figure.name}</div>
              <div style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.6 }}>{figure.description}</div>
            </div>
          </div>

          <div style={{ borderTop: 'var(--rule-double)', padding: 'var(--space-5) var(--space-6)', background: 'var(--surface-raised)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>How this recreation was built</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              {totals
                ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--bronze-deep)', background: 'var(--bronze-tint)', border: '1px solid var(--stone-line)', borderRadius: 'var(--radius-1)', padding: '3px 9px' }}>{totals}</span>
                : <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Grounded in the ingested corpus.</span>}
            </div>
          </div>

          <div style={{ padding: 'var(--space-5) var(--space-6)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>Openers</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'stretch' }}>
              {openers.map((q) => (
                <SuggestedQuestion key={q} accentColor={figure.accentColor} onClick={() => onOpenWith(q)}>{q}</SuggestedQuestion>
              ))}
            </div>
            <div style={{ marginTop: 'var(--space-5)' }}>
              <Button variant="primary" size="lg" full onClick={onBegin}>Begin the conversation</Button>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 'var(--space-4)' }}>
          <DisclosureBanner figureName={figure.name} />
        </div>
      </div>
    </div>
  )
}
