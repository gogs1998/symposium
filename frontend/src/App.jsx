import React from 'react'
import { RosterScreen } from './screens/RosterScreen'
import { ChatScreen } from './screens/ChatScreen'
import { FigureIntroScreen } from './screens/FigureIntroScreen'
import { api } from './lib/api'
import { adaptFigure } from './lib/adapters'

export default function App() {
  const [figures, setFigures] = React.useState([])
  const [loadingFigures, setLoadingFigures] = React.useState(true)
  const [view, setView] = React.useState('roster')       // 'roster' | 'intro' | 'chat'
  const [figure, setFigure] = React.useState(null)
  const [sessions, setSessions] = React.useState([])
  const [activeSession, setActiveSession] = React.useState(null)
  const [pendingOpener, setPendingOpener] = React.useState(null)  // opener chosen on the intro

  React.useEffect(() => {
    let live = true
    api.listFigures()
      .then((data) => { if (live) setFigures((Array.isArray(data) ? data : []).map(adaptFigure)) })
      .catch((e) => { console.error('load figures failed:', e); if (live) setFigures([]) })
      .finally(() => { if (live) setLoadingFigures(false) })
    return () => { live = false }
  }, [])

  const [restored, setRestored] = React.useState([])   // messages restored for a resumed session

  // GET /sessions rows are exactly: { id, title, created_at, updated_at, metadata,
  // conversation_count, message_count } (backend/conversations.py get_user_sessions).
  // There is NO figure field on a session — figures live on its conversations, so
  // resuming a session resolves its figure via GET /sessions/{id}/history.
  const loadSessions = React.useCallback(() => {
    api.listSessions()
      .then((res) => setSessions((res.sessions || []).map((s) => ({
        id: s.id,
        title: s.title || 'Untitled conversation',
        time: s.updated_at || '',
        messageCount: s.message_count,
      }))))
      .catch((e) => { console.error('load sessions failed:', e); setSessions([]) })
  }, [])

  React.useEffect(() => { loadSessions() }, [loadSessions])

  // Roster click → intro waypoint (portrait, corpus summary, openers), then Begin → chat.
  const openFigure = (f) => {
    if (f.status === 'coming-soon') return
    setFigure(f)
    setRestored([])
    setActiveSession(null)          // fresh conversation; backend mints the session id
    setPendingOpener(null)
    setView('intro')
  }

  // Begin from the intro (optionally carrying a chosen opener) → chat.
  const beginChat = (opener = null) => {
    setPendingOpener(opener)
    setView('chat')
  }

  const openSession = async (id) => {
    try {
      const res = await api.sessionHistory(id)
      const figureIds = Object.keys(res.history || {})
      const f = figures.find((x) => figureIds.includes(x.id))
      if (!f) return
      setFigure(f)
      setRestored((res.history[f.id] || []).map((m) => ({
        role: m.role, content: m.content, citations: m.citations || null,
      })))
      setActiveSession(id)
      localStorage.setItem('currentSessionId', id)
      setView('chat')
    } catch (e) { console.error('open session failed:', e) }
  }

  const newConversation = () => { setRestored([]); setActiveSession(null); localStorage.removeItem('currentSessionId'); setView('roster') }

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
      {view === 'roster' ? (
        <div style={{ height: '100%', overflowY: 'auto' }}>
          <RosterScreen figures={figures} loading={loadingFigures} onOpenFigure={openFigure} />
        </div>
      ) : view === 'intro' ? (
        <div style={{ height: '100%', overflowY: 'auto' }}>
          <FigureIntroScreen
            figure={figure}
            onBegin={() => beginChat(null)}
            onOpenWith={(q) => beginChat(q)}
            onBack={() => setView('roster')}
          />
        </div>
      ) : (
        <ChatScreen
          figure={figure}
          sessions={sessions}
          activeSession={activeSession}
          initialMessages={restored}
          initialDraft={pendingOpener}
          onBack={() => { loadSessions(); setView('roster') }}
          onSelectSession={openSession}
          onNewConversation={newConversation}
        />
      )}
    </div>
  )
}
