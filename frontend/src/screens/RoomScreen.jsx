import React from 'react'
import { Composer, FigurePortrait, Button, IconButton } from '../components/ds'
import { useRoomStream } from '../hooks/useRoomStream'

const MIN = 2
const MAX = 4

// A symposium: 2-4 figures in one conversation. Two phases — a builder to choose
// the guests, then the round-table chat where each reply is attributed and the
// figures respond to one another.
export function RoomScreen({ figures, onExit }) {
  const [selected, setSelected] = React.useState([])   // figure ids, in pick order
  const [started, setStarted] = React.useState(false)
  const [draft, setDraft] = React.useState('')
  const { turns, phase, send } = useRoomStream()
  const scrollRef = React.useRef(null)

  const byId = React.useMemo(() => Object.fromEntries(figures.map((f) => [f.id, f])), [figures])
  const chosen = selected.map((id) => byId[id]).filter(Boolean)

  React.useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [turns, phase])

  const toggle = (id) => {
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id)
      : s.length >= MAX ? s : [...s, id])
  }

  const submit = (text) => {
    if (!text.trim() || phase === 'thinking' || phase === 'streaming') return
    setDraft('')
    send({ figures: selected, message: text })
  }

  const busy = phase === 'thinking' || phase === 'streaming'

  // ---- Builder ----
  if (!started) {
    return (
      <div style={{ minHeight: '100%', background: 'var(--surface-page)', backgroundImage: 'var(--texture-grain)' }}>
        <div className="sym-room-buildbar" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--border-line)' }}>
          <IconButton label="Back to roster" variant="ghost" onClick={onExit}>←</IconButton>
          <span style={{ font: 'var(--fw-regular) var(--text-lg)/1 var(--font-display)', color: 'var(--text-strong)' }}>Convene a symposium</span>
        </div>

        <main style={{ maxWidth: 'var(--width-page)', margin: '0 auto', padding: 'var(--space-8) var(--space-6) var(--space-10)' }}>
          <span className="sym-eyebrow">Pick your table</span>
          <h1 className="sym-room-h1" style={{ margin: '12px 0 0', font: 'var(--fw-regular) var(--text-4xl)/1.05 var(--font-display)', color: 'var(--text-strong)', textWrap: 'balance' }}>
            Put {MIN}–{MAX} minds in one room and let them argue.
          </h1>
          <p style={{ margin: '16px 0 var(--space-7)', maxWidth: '54ch', font: 'var(--fw-regular) var(--text-lg)/1.6 var(--font-serif)', color: 'var(--text-muted)' }}>
            Choose your guests. Each answers in their own voice, grounded in their own words — and they’ll respond to each other. Name someone in your message to call on them directly.
          </p>

          <div className="sym-room-picker" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
            {figures.map((f) => {
              const on = selected.includes(f.id)
              const idx = selected.indexOf(f.id)
              const atMax = selected.length >= MAX && !on
              return (
                <button
                  key={f.id}
                  onClick={() => toggle(f.id)}
                  disabled={atMax}
                  className="sym-room-chip"
                  style={{
                    position: 'relative', display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                    padding: 'var(--space-3)', textAlign: 'left', cursor: atMax ? 'not-allowed' : 'pointer',
                    background: on ? 'var(--accent-soft)' : 'var(--surface-card)',
                    border: `1px solid ${on ? 'var(--accent)' : 'var(--border-line)'}`,
                    borderRadius: 'var(--radius-md)', opacity: atMax ? 0.45 : 1,
                    transition: 'border-color var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out)',
                  }}
                >
                  <FigurePortrait name={f.name} src={f.imageUrl} category={f.category} accentColor={f.accentColor} shape="round" size={40} grain={false} />
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: 'block', font: 'var(--fw-regular) var(--text-md)/1.15 var(--font-display)', color: 'var(--text-strong)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                    <span className="sym-eyebrow" style={{ color: 'var(--text-faint)' }}>{f.meta}</span>
                  </span>
                  {on && (
                    <span aria-hidden style={{ position: 'absolute', top: 8, right: 10, font: 'var(--fw-medium) var(--text-sm)/1 var(--font-mono)', color: 'var(--accent)' }}>{idx + 1}</span>
                  )}
                </button>
              )
            })}
          </div>
        </main>

        {/* Sticky action bar with the chosen guests + start */}
        <div className="sym-room-startbar" style={{ position: 'sticky', bottom: 0, borderTop: '1px solid var(--border-line)', background: 'var(--surface-page)', padding: `var(--space-4) var(--space-6) calc(var(--space-4) + env(safe-area-inset-bottom, 0px))` }}>
          <div style={{ maxWidth: 'var(--width-page)', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div style={{ display: 'flex' }}>
                {chosen.map((f, i) => (
                  <span key={f.id} style={{ marginLeft: i ? -10 : 0, borderRadius: '50%', boxShadow: '0 0 0 2px var(--surface-page)' }}>
                    <FigurePortrait name={f.name} src={f.imageUrl} category={f.category} accentColor={f.accentColor} shape="round" size={32} grain={false} />
                  </span>
                ))}
              </div>
              <span style={{ font: 'var(--fw-regular) var(--text-sm)/1.3 var(--font-mono)', color: 'var(--text-muted)' }}>
                {selected.length}/{MAX} chosen{selected.length < MIN ? ` · pick ${MIN - selected.length} more` : ''}
              </span>
            </div>
            <Button variant="solid" disabled={selected.length < MIN} onClick={() => setStarted(true)}>
              Begin the symposium
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ---- Round table ----
  return (
    <div className="sym-room-shell" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--surface-page)', backgroundImage: 'var(--texture-grain)' }}>
      <div className="sym-room-header" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) var(--space-6)', borderBottom: '1px solid var(--border-line)', background: 'var(--surface-page)' }}>
        <IconButton label="Leave the symposium" variant="ghost" onClick={onExit}>←</IconButton>
        <div style={{ display: 'flex', marginRight: 'var(--space-2)' }}>
          {chosen.map((f, i) => (
            <span key={f.id} title={f.name} style={{ marginLeft: i ? -10 : 0, borderRadius: '50%', boxShadow: '0 0 0 2px var(--surface-page)' }}>
              <FigurePortrait name={f.name} src={f.imageUrl} category={f.category} accentColor={f.accentColor} shape="round" size={32} grain={false} />
            </span>
          ))}
        </div>
        <span style={{ minWidth: 0, font: 'var(--fw-regular) var(--text-lg)/1.1 var(--font-display)', color: 'var(--text-strong)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {chosen.map((f) => f.name.split(' ')[0]).join(' · ')}
        </span>
      </div>

      <div ref={scrollRef} className="sym-room-turns" style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-6)' }}>
        <div style={{ maxWidth: 'var(--width-chat)', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {turns.length === 0 && (
            <p style={{ textAlign: 'center', margin: 'var(--space-8) 0', font: 'var(--fw-regular) var(--text-md)/1.6 var(--font-serif)', color: 'var(--text-faint)' }}>
              Open with a question for the table.
            </p>
          )}
          {turns.map((t, i) => t.kind === 'user' ? (
            <div key={i} style={{ alignSelf: 'flex-end', maxWidth: '85%', background: 'var(--surface-inset)', border: '1px solid var(--border-line)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-3) var(--space-4)' }}>
              <p style={{ margin: 0, font: 'var(--fw-regular) var(--text-md)/1.55 var(--font-serif)', color: 'var(--text-strong)' }}>{t.content}</p>
            </div>
          ) : (
            <RoomTurn key={i} turn={t} figure={byId[t.figureId]} />
          ))}
          {phase === 'thinking' && (
            <p style={{ font: 'var(--fw-regular) var(--text-sm)/1 var(--font-mono)', color: 'var(--text-faint)' }}>the room is thinking…</p>
          )}
        </div>
      </div>

      <div className="sym-room-composerbar" style={{ borderTop: '1px solid var(--border-line)', background: 'var(--surface-page)', padding: `var(--space-3) var(--space-6) calc(var(--space-3) + env(safe-area-inset-bottom, 0px))` }}>
        <div style={{ maxWidth: 'var(--width-chat)', margin: '0 auto' }}>
          <Composer
            value={draft}
            onChange={setDraft}
            onSend={submit}
            placeholder="Put a question to the table…  (name someone to call on them)"
            busy={busy}
            disclosure={false}
          />
        </div>
      </div>
    </div>
  )
}

// One figure's attributed turn in the round table.
function RoomTurn({ turn, figure }) {
  const accent = figure?.accentColor || 'var(--accent)'
  return (
    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
      <div style={{ flex: '0 0 auto', paddingTop: 2 }}>
        <FigurePortrait name={turn.name} src={figure?.imageUrl} category={figure?.category} accentColor={accent} shape="round" size={36} grain={false} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)', marginBottom: 4 }}>
          <span style={{ font: 'var(--fw-regular) var(--text-md)/1 var(--font-display)', color: accent }}>{turn.name}</span>
          {turn.streaming && <span style={{ font: 'var(--fw-regular) var(--text-xs)/1 var(--font-mono)', color: 'var(--text-faint)' }}>speaking…</span>}
        </div>
        <div style={{ font: 'var(--fw-regular) var(--text-md)/1.62 var(--font-serif)', color: 'var(--text-body)', whiteSpace: 'pre-wrap' }}>
          {turn.content || (turn.streaming ? '…' : '')}
        </div>
      </div>
    </div>
  )
}
