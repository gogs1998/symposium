import React from 'react'
import {
  SessionSidebar, MessageBubble, TypingIndicator, Composer,
  SuggestedQuestion, DisclosureBanner, FigurePortrait, IconButton, Button,
  SourcesPanel, RegisterIndicator,
} from '../components/ds'
import { useChatStream } from '../hooks/useChatStream'
import { adaptCitation, adaptSources, registersFor } from '../lib/adapters'
import { api } from '../lib/api'

function ChatHeader({ figure, onBack, onOpenSources }) {
  // Display-only register chip for creators, derived from metadata.format.
  const reg = registersFor(figure)
  return (
    <div className="sym-chat-header" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--border-line)', background: 'var(--surface-page)' }}>
      <IconButton label="Back to roster" variant="ghost" onClick={onBack}>←</IconButton>
      <FigurePortrait name={figure.name} src={figure.imageUrl} category={figure.category} accentColor={figure.accentColor} shape="round" size={38} grain={false} />
      <div className="sym-chat-headtext" style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <span className="sym-chat-name" style={{ font: 'var(--fw-regular) var(--text-xl)/1 var(--font-display)', color: 'var(--text-strong)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{figure.name}</span>
          {/* Inline "AI recreation" chip — hidden on phones (the full disclosure
              banner below the header already carries it) so the name gets full width. */}
          <span className="sym-chat-disclosure-inline"><DisclosureBanner figureName={figure.name} inline /></span>
        </div>
        <span style={{ font: 'var(--fw-regular) var(--text-xs)/1.4 var(--font-sans)', color: 'var(--text-faint)' }}>{figure.meta}</span>
      </div>
      {reg && <span className="sym-chat-register">{<RegisterIndicator registers={reg.registers} active={reg.active} />}</span>}
      <span className="sym-chat-sources">
        <Button variant="ghost" size="sm" onClick={onOpenSources}>Sources</Button>
      </span>
    </div>
  )
}

// Slide-over trust surface. Fetches the figure's corpus from the sources endpoint
// on open; the scrim (ink at 32%, no blur) dismisses per the v2 pattern.
function SourcesOverlay({ figure, onClose }) {
  const [data, setData] = React.useState(null)
  React.useEffect(() => {
    let live = true
    api.figureSources(figure.id)
      .then((res) => { if (live) setData(adaptSources(res)) })
      .catch((e) => { console.error('load sources failed:', e); if (live) setData(adaptSources({ sources: [] })) })
    return () => { live = false }
  }, [figure.id])
  const s = data || { books: [], videos: [], collections: [], totals: '' }
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(28,43,58,.32)', display: 'flex', justifyContent: 'flex-end', zIndex: 40 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ height: '100%' }}>
        <SourcesPanel figureName={figure.name} basis={figure.basis || 'the ingested corpus'}
          totals={s.totals} books={s.books} videos={s.videos} collections={s.collections} onClose={onClose} />
      </div>
    </div>
  )
}

function EmptyState({ figure, onAsk }) {
  const openers = figure.openers?.length ? figure.openers : [
    `What should I ask you first?`,
    `What did you spend your life thinking about?`,
    `What do people most often get wrong about you?`,
  ]
  return (
    <div className="sym-chat-empty" style={{ maxWidth: 'var(--width-chat)', margin: '0 auto', padding: 'var(--space-10) var(--space-6)', textAlign: 'center' }}>
      <FigurePortrait name={figure.name} src={figure.imageUrl} category={figure.category} accentColor={figure.accentColor} size={92} style={{ margin: '0 auto' }} />
      <h2 className="sym-chat-empty-name" style={{ margin: 'var(--space-5) 0 0', font: 'var(--fw-regular) var(--text-3xl)/1.1 var(--font-display)', color: 'var(--text-strong)' }}>{figure.name}</h2>
      <p style={{ margin: '12px auto 0', maxWidth: '46ch', font: 'var(--fw-regular) var(--text-md)/1.6 var(--font-serif)', color: 'var(--text-muted)', textWrap: 'pretty' }}>{figure.description}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 'var(--space-8) 0 var(--space-4)' }}>
        <span style={{ flex: 1, height: 1, background: 'var(--border-hair)' }} />
        <span className="sym-eyebrow">Begin with</span>
        <span style={{ flex: 1, height: 1, background: 'var(--border-hair)' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
        {openers.map((q, i) => (
          <SuggestedQuestion key={i} accentColor={figure.accentColor} onClick={() => onAsk(q)}>{q}</SuggestedQuestion>
        ))}
      </div>
    </div>
  )
}

function ErrorState({ onRetry }) {
  return (
    <div style={{ maxWidth: 440, margin: '0 auto', padding: 'var(--space-9) var(--space-6)', textAlign: 'center' }}>
      <div style={{ width: 44, height: 44, margin: '0 auto', borderRadius: '50%', border: '1.5px solid var(--danger)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: 'var(--fw-regular) 22px/1 var(--font-display)' }}>!</div>
      <h3 style={{ margin: 'var(--space-4) 0 0', font: 'var(--fw-regular) var(--text-2xl)/1.15 var(--font-display)', color: 'var(--text-strong)' }}>The line went quiet.</h3>
      <p style={{ margin: '10px auto 0', maxWidth: '38ch', font: 'var(--fw-regular) var(--text-md)/1.55 var(--font-serif)', color: 'var(--text-muted)', textWrap: 'pretty' }}>
        We couldn't reach the archive to compose a reply. Your message is safe — try again in a moment.
      </p>
      <div style={{ marginTop: 'var(--space-5)' }}>
        <Button variant="secondary" onClick={onRetry}>Try again</Button>
      </div>
    </div>
  )
}

function Msg({ m, figure }) {
  if (m.role === 'user') return <MessageBubble role="user">{m.content}</MessageBubble>
  const citations = (m.citations || []).map((c) => adaptCitation(c, figure.accentColor))
  return (
    <MessageBubble role="assistant" author={figure.name} accentColor={figure.accentColor} citations={citations}>
      {m.content}
    </MessageBubble>
  )
}

export function ChatScreen({ figure, sessions, activeSession, initialMessages = [], initialDraft = null, onBack, onSelectSession, onNewConversation }) {
  const { messages, phase, streamText, send, retry, reset } = useChatStream(activeSession)
  const [draft, setDraft] = React.useState(initialDraft || '')
  const [showSources, setShowSources] = React.useState(false)
  const threadRef = React.useRef(null)

  // An opener chosen on the intro pre-fills the composer for a fresh conversation.
  React.useEffect(() => { if (initialDraft) setDraft(initialDraft) }, [initialDraft])

  // Restore prior turns when resuming a session (App loads them via /sessions/{id}/history)
  React.useEffect(() => { reset(initialMessages, activeSession) }, [figure.id, activeSession, reset])  // eslint-disable-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight
  }, [messages, phase, streamText])

  const submit = (text) => {
    const value = (text ?? draft).trim()
    if (!value) return
    setDraft('')
    send({ figure: figure.id, message: value })
  }

  const empty = messages.length === 0 && phase === 'idle'
  const busy = phase === 'thinking' || phase === 'streaming'

  return (
    <div className="sym-chat-shell" style={{ display: 'flex', height: '100%', background: 'var(--surface-page)' }}>
      <SessionSidebar sessions={sessions} activeId={activeSession} onSelect={onSelectSession} onNew={onNewConversation} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <ChatHeader figure={figure} onBack={onBack} onOpenSources={() => setShowSources(true)} />
        <DisclosureBanner figureName={figure.name} />
        <div ref={threadRef} className="sym-chat-thread" style={{ flex: 1, overflowY: 'auto', backgroundImage: 'var(--texture-grain)' }}>
          {empty ? (
            <EmptyState figure={figure} onAsk={(q) => submit(q)} />
          ) : phase === 'error' ? (
            <div style={{ maxWidth: 'var(--width-chat)', margin: '0 auto', padding: 'var(--space-6)' }}>
              {messages.map((m, i) => <Msg key={i} m={m} figure={figure} />)}
              <ErrorState onRetry={retry} />
            </div>
          ) : (
            <div className="sym-chat-turns" style={{ maxWidth: 'var(--width-chat)', margin: '0 auto', padding: 'var(--space-7) var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-7)' }}>
              {messages.map((m, i) => <Msg key={i} m={m} figure={figure} />)}
              {phase === 'thinking' && (
                <TypingIndicator author={figure.name} accentColor={figure.accentColor}
                  label={figure.category === 'creator' ? 'is scanning the transcripts' : 'is consulting the text'} />
              )}
              {phase === 'streaming' && (
                <MessageBubble role="assistant" author={figure.name} accentColor={figure.accentColor} streaming>
                  {streamText}
                </MessageBubble>
              )}
            </div>
          )}
        </div>
        <div className="sym-chat-composerbar" style={{ borderTop: '1px solid var(--border-line)', background: 'var(--surface-page)', padding: 'var(--space-4) var(--space-6) var(--space-5)' }}>
          <div style={{ maxWidth: 'var(--width-chat)', margin: '0 auto' }}>
            <Composer value={draft} onChange={setDraft} onSend={(t) => submit(t)} figureName={figure.name} busy={busy} />
          </div>
        </div>
      </div>
      {showSources && <SourcesOverlay figure={figure} onClose={() => setShowSources(false)} />}
    </div>
  )
}
