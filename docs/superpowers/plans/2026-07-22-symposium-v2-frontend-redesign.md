# Symposium v2 Frontend Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Symposium frontend from the v1 purple-gradient single-file app into the project's editorial/archival design system (serif display type, paper-and-ink neutrals, one cinnabar accent). Copy the canonical UI-kit components verbatim, wire them to the real v2 API, and preserve the reference app's look exactly — roster → chat with streaming, dual-variant citations (book excerpt for historical figures, clickable video-timestamp deep-link for creators), sessions sidebar, and the full set of states (loading, empty, thinking, streaming, error, unavailable).

**Architecture:** React 18 + Vite, plain CSS (design-system tokens + component-scoped `.jsx` style objects — no Tailwind, no CSS-in-JS deps, no UI library). The design system is copied into `frontend/src/design/` (tokens + `styles.css`) and its components into `frontend/src/components/ds/` as-is (they are self-contained ESM React modules using relative imports). App-level screens (`RosterScreen`, `ChatScreen`) are ported from `ui_kits/symposium-app/` and re-pointed from `window.SYM_DATA`/`window.SymposiumDesignSystem_*` to ESM imports + real API data. A `useChatStream` hook extracts the working SSE consumption from the v1 `App.jsx`. A thin `api.js` client + a `figureAdapter` translate v2 API shapes (`metadata.era`, `metadata.channel`, citation `metadata.start_seconds`) into the props the DS components expect (`category`, `accentColor`, `meta`, citation `variant`).

**Tech Stack:** React 18.3, Vite 5, plain CSS design tokens, `fetch` + `ReadableStream` for SSE (no axios in the stream path; axios retained only for simple GETs, or replaced by `fetch` — see Task 3), Vitest + React Testing Library + jsdom for tests. Fonts via Google Fonts `<link>` in `index.html` (see Task 1).

**Spec:** `docs/superpowers/specs/2026-07-21-symposium-v2-design.md` §3.5 (Frontend).

**Design source of truth:** `.claude/skills/symposium-design/` — `readme.md`, `styles.css`, `tokens/`, `components/{core,figures,chat}/`, and the assembled reference app `ui_kits/symposium-app/`. The UI-kit components are canonical: copy them, do not re-implement. Visual fidelity is verified against `ui_kits/symposium-app/index.html` and `states.html`.

---

## Conventions for all tasks

- Run commands from `D:\Claude\Symposium\frontend` unless stated. Paths in this plan are relative to `frontend/` unless prefixed with `.claude/` or `docs/`.
- The design skill lives at repo root: `.claude/skills/symposium-design/`. When a step says "copy from skill", the absolute source is `D:\Claude\Symposium\.claude\skills\symposium-design\...`.
- One commit per task, message form `frontend: <task summary>`. Do NOT push; the controller reviews first.
- Dev server runs on port 3000 with a `/api` → backend proxy targeting **port 8010** (already fixed in `vite.config.js` — the backend runs on 8010 via `PORT=8010` in the repo-root `.env`, because another local app contests port 8000. Do not change it.)
- Real API field shapes (verified against `backend/schemas.py`, `backend/rag/engine.py`, `ingestion/transcripts.py`):
  - `GET /figures` → `[{ id, name, type: "historical"|"creator", description, metadata: {}, chunk_count }]`. `metadata` is free-form JSON: historical figures carry `{ era, fields }`; creators carry `{ channel, ... }`. **The API does NOT return `accentColor`, `category`, or `meta`** — those are demo-only fields in `ui_kits/.../data.js`; derive them in `figureAdapter` (Task 4).
  - `POST /chat/stream` SSE events: `{type:"start", conversation_id, figure}` → `{type:"citations", citations:[…]}` → repeated `{type:"content", content}` → `{type:"end"}` (or `{type:"error", error}`). The `conversation_id` in `start` is the **session id** — persist it and send it back as `conversation_id` on the next turn.
  - Citation object: `{ source, excerpt, score, metadata }`. `metadata` for a historical chunk carries the source filename; for a video chunk it carries `{ source: <video title>, video_id, url, upload_date, duration, start_seconds, chunk_index }`. **Variant selection rule: video if `citation.metadata.video_id` is present, else book.** Deep-link: `citation.metadata.url + "?t=" + Math.floor(citation.metadata.start_seconds) + "s"`. Timestamp label: `start_seconds` → `mm:ss` (or `h:mm:ss`).
  - `GET /sessions?user_id=default` → `{ sessions: [...] }`. `GET /sessions/{id}/history` → `{ session_id, history: { <figure_id>: [messages] } }`. `PUT /sessions/{id}/title?title=`, `DELETE /sessions/{id}`.

---

### Task 1: Design system + fonts wired into the Vite app

Copy the design tokens/stylesheet into the app and load the four font families. Nothing renders differently yet, but `styles.css` and fonts become available to every later task.

**Files:**
- Create: `src/design/styles.css` (copy of skill `styles.css`)
- Create: `src/design/tokens/{fonts.css,colors.css,typography.css,spacing.css,effects.css,animations.css}` (copies)
- Modify: `index.html` (font `<link>`, title, description, favicon)
- Modify: `src/main.jsx` (import the design stylesheet)

- [ ] **Step 1: Copy the design system into the app**

Copy the six token files and the root stylesheet verbatim:

```powershell
New-Item -ItemType Directory -Force src\design\tokens | Out-Null
Copy-Item ..\.claude\skills\symposium-design\styles.css src\design\styles.css
Copy-Item ..\.claude\skills\symposium-design\tokens\*.css src\design\tokens\
```

`src/design/styles.css` `@import`s `tokens/fonts.css`, `tokens/colors.css`, etc. — the relative paths resolve unchanged because the `tokens/` folder sits beside it.

- [ ] **Step 2: Load fonts via `<link>` in `index.html`**

`tokens/fonts.css` loads fonts with an `@import url('https://fonts.googleapis.com/...')`. `@import` inside a CSS file processed by Vite works but is render-blocking and easy to miss; add an explicit `<link>` in `index.html` as the primary loader (self-hosting is the production hardening step, out of scope here — see the skill readme CAVEATS). Replace the whole `<head>`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="data:," />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Symposium — a room of remarkable people</title>
    <meta name="description" content="Chat with AI recreations of historical figures and creators, grounded in their own words. Every reply cites its source." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Libre+Caslon+Display&family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=Newsreader:ital,opsz,wght@0,6..72,300..600;1,6..72,300..500&family=Archivo:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

(The font family list is copied exactly from `tokens/fonts.css` so the two loaders reference identical families.)

- [ ] **Step 3: Import the design stylesheet in `main.jsx`**

Replace the old `index.css`/`App.css` imports. `src/main.jsx` becomes:

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './design/styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [ ] **Step 4: Verify the design system loads**

Run `npm run dev`, open `http://localhost:3000`. The old App still renders (untouched in this task) but with design fonts available. Confirm no console errors about missing `styles.css` or token files. In DevTools, check `getComputedStyle(document.documentElement).getPropertyValue('--accent')` returns `#C0442C` (or the token's value).

- [ ] **Step 5: Commit**

```powershell
git add frontend/src/design frontend/index.html frontend/src/main.jsx
git commit -m "frontend: vendor Symposium design system tokens + fonts into the app"
```

---

### Task 2: Copy the design-system components (core, figures, chat)

The 14 DS components are self-contained ESM React modules (`import React from "react"` + relative sibling imports). Copy them verbatim into the app; they compile under Vite with zero changes. They are the canonical building blocks — later tasks import from here, never re-implement.

**Files:**
- Create: `src/components/ds/core/{Button,IconButton,Badge,Tag}.jsx`
- Create: `src/components/ds/figures/{FigureCard,FigurePortrait,CategoryTabs}.jsx`
- Create: `src/components/ds/chat/{MessageBubble,CitationCard,Composer,SessionSidebar,TypingIndicator,DisclosureBanner,SuggestedQuestion}.jsx`
- Create: `src/components/ds/index.js` (barrel re-export)

- [ ] **Step 1: Copy the component tree verbatim**

```powershell
$src = "..\.claude\skills\symposium-design\components"
foreach ($g in "core","figures","chat") {
  New-Item -ItemType Directory -Force "src\components\ds\$g" | Out-Null
  Copy-Item "$src\$g\*.jsx" "src\components\ds\$g\"
}
```

Do NOT copy the `.d.ts`, `.prompt.md`, or `.card.html` files — only the `.jsx`. The relative imports inside them (`../core/Badge.jsx`, `./CitationCard.jsx`, `./FigurePortrait.jsx`) resolve because the folder structure is preserved.

- [ ] **Step 2: Add a barrel export** so screens can `import { FigureCard, MessageBubble } from '../components/ds'`.

Create `src/components/ds/index.js`:

```js
export { Button } from './core/Button.jsx'
export { IconButton } from './core/IconButton.jsx'
export { Badge } from './core/Badge.jsx'
export { Tag } from './core/Tag.jsx'
export { FigureCard } from './figures/FigureCard.jsx'
export { FigurePortrait } from './figures/FigurePortrait.jsx'
export { CategoryTabs } from './figures/CategoryTabs.jsx'
export { MessageBubble } from './chat/MessageBubble.jsx'
export { CitationCard } from './chat/CitationCard.jsx'
export { Composer } from './chat/Composer.jsx'
export { SessionSidebar } from './chat/SessionSidebar.jsx'
export { TypingIndicator } from './chat/TypingIndicator.jsx'
export { DisclosureBanner } from './chat/DisclosureBanner.jsx'
export { SuggestedQuestion } from './chat/SuggestedQuestion.jsx'
```

- [ ] **Step 3: Smoke-verify the components compile**

Temporarily render one component to prove the tree resolves. In `src/App.jsx`, at the very top of the returned JSX, mount `<FigureCard name="Test" description="probe" category="historical" meta="Probe · 2026" />` (import from `./components/ds`). Run `npm run dev`; the card should render with the serif name and accent edge. Remove the probe after confirming (App.jsx is fully replaced in Task 5 anyway).

- [ ] **Step 4: Commit**

```powershell
git add frontend/src/components/ds
git commit -m "frontend: vendor Symposium DS components (core, figures, chat)"
```

---

### Task 3: `useChatStream` hook — extract the working SSE consumer

Extract the SSE fetch + `ReadableStream` parsing from the v1 `App.jsx` (lines ~171–282) into a reusable hook. **This logic works — port it, do not reinvent.** Drop the v1 multi-figure panel loop and `@mention` routing (single figure per conversation in v2). This is the first testable unit, so write it TDD.

**Files:**
- Create: `src/lib/api.js`
- Create: `src/hooks/useChatStream.js`
- Create: `src/hooks/useChatStream.test.jsx` (Vitest — infra added in Task 8; this test is written now and run once infra lands, or add infra first if executing linearly)

> **Ordering note:** If executing strictly top-to-bottom, do Task 8 (test infra) before running this task's test. The hook code itself does not depend on the test infra.

- [ ] **Step 1: Write the API base + simple client**

Create `src/lib/api.js`:

```js
const API_BASE = import.meta.env.VITE_API_URL || '/api'

async function jsonGet(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'ngrok-skip-browser-warning': 'true' },
  })
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`)
  return res.json()
}

export const api = {
  base: API_BASE,
  listFigures: () => jsonGet('/figures'),
  listSessions: (userId = 'default') => jsonGet(`/sessions?user_id=${encodeURIComponent(userId)}`),
  sessionHistory: (id) => jsonGet(`/sessions/${encodeURIComponent(id)}/history`),
  deleteSession: (id) =>
    fetch(`${API_BASE}/sessions/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  renameSession: (id, title) =>
    fetch(`${API_BASE}/sessions/${encodeURIComponent(id)}/title?title=${encodeURIComponent(title)}`, { method: 'PUT' }),
}
```

- [ ] **Step 2: Write the failing hook test**

Create `src/hooks/useChatStream.test.jsx`. It mocks `fetch` with a `ReadableStream` that emits SSE frames and asserts the hook surfaces phase transitions, streamed text, citations, and the session id.

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useChatStream } from './useChatStream'

function sseStream(frames) {
  const enc = new TextEncoder()
  let i = 0
  return new ReadableStream({
    pull(ctrl) {
      if (i >= frames.length) return ctrl.close()
      ctrl.enqueue(enc.encode(`data: ${JSON.stringify(frames[i++])}\n\n`))
    },
  })
}

beforeEach(() => { vi.restoreAllMocks() })

describe('useChatStream', () => {
  it('streams content, captures citations and session id, ends idle', async () => {
    const frames = [
      { type: 'start', conversation_id: 'sess-1', figure: 'marcus' },
      { type: 'citations', citations: [{ source: 'Meditations', excerpt: 'x', score: 0.9, metadata: {} }] },
      { type: 'content', content: 'Consider ' },
      { type: 'content', content: 'the obstacle.' },
      { type: 'end' },
    ]
    global.fetch = vi.fn().mockResolvedValue({ ok: true, body: sseStream(frames) })

    const { result } = renderHook(() => useChatStream())
    await act(async () => { await result.current.send({ figure: 'marcus', message: 'hi' }) })

    await waitFor(() => expect(result.current.phase).toBe('idle'))
    const last = result.current.messages.at(-1)
    expect(last.role).toBe('assistant')
    expect(last.content).toBe('Consider the obstacle.')
    expect(last.citations).toHaveLength(1)
    expect(result.current.sessionId).toBe('sess-1')
  })

  it('goes to error phase on an error frame', async () => {
    const frames = [
      { type: 'start', conversation_id: 'sess-2', figure: 'marcus' },
      { type: 'error', error: 'archive unreachable' },
    ]
    global.fetch = vi.fn().mockResolvedValue({ ok: true, body: sseStream(frames) })
    const { result } = renderHook(() => useChatStream())
    await act(async () => { await result.current.send({ figure: 'marcus', message: 'hi' }) })
    await waitFor(() => expect(result.current.phase).toBe('error'))
  })
})
```

Run `npm test` → expect FAIL (hook does not exist yet).

- [ ] **Step 3: Write the hook** (ported from v1 App.jsx SSE loop, single-figure)

Create `src/hooks/useChatStream.js`:

```js
import { useState, useCallback, useRef } from 'react'
import { api } from '../lib/api'

// phase: 'idle' | 'thinking' | 'streaming' | 'error'
export function useChatStream(initialSessionId = null) {
  const [messages, setMessages] = useState([])
  const [phase, setPhase] = useState('idle')
  const [streamText, setStreamText] = useState('')
  const [sessionId, setSessionId] = useState(initialSessionId)
  const lastSent = useRef(null)

  const reset = useCallback((msgs = [], session = null) => {
    setMessages(msgs); setPhase('idle'); setStreamText(''); setSessionId(session)
  }, [])

  const send = useCallback(async ({ figure, message, includeCitations = true }) => {
    if (!message?.trim()) return
    lastSent.current = { figure, message, includeCitations }
    setMessages((m) => [...m, { role: 'user', content: message }])
    setPhase('thinking')
    setStreamText('')

    let full = ''
    let citations = null
    try {
      const res = await fetch(`${api.base}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ figure, message, conversation_id: sessionId, include_citations: includeCitations }),
      })
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          let data
          try { data = JSON.parse(line.slice(6)) } catch { continue }
          if (data.type === 'start') {
            if (data.conversation_id) setSessionId(data.conversation_id)
          } else if (data.type === 'citations') {
            citations = data.citations
          } else if (data.type === 'content') {
            full += data.content
            setPhase('streaming')
            setStreamText(full)
          } else if (data.type === 'error') {
            throw new Error(data.error || 'stream error')
          } else if (data.type === 'end') {
            setMessages((m) => [...m, { role: 'assistant', content: full, citations }])
            setStreamText('')
            setPhase('idle')
          }
        }
      }
    } catch (err) {
      console.error('chat stream failed:', err)
      setPhase('error')
    }
  }, [sessionId])

  const retry = useCallback(() => {
    if (!lastSent.current) return
    // drop the failed turn's trailing user message duplication by resending
    setPhase('idle')
    return send(lastSent.current)
  }, [send])

  return { messages, phase, streamText, sessionId, send, retry, reset }
}
```

- [ ] **Step 4: Run the test** → expect PASS (both cases). Then `npm run lint`.

- [ ] **Step 5: Commit**

```powershell
git add frontend/src/lib/api.js frontend/src/hooks/useChatStream.js frontend/src/hooks/useChatStream.test.jsx
git commit -m "frontend: useChatStream SSE hook (ported from v1) + api client, tested"
```

---

### Task 4: Figure + citation adapters (API shape → DS props)

The DS components expect demo-data props (`category`, `accentColor`, `meta`, citation `variant`/`videoTitle`/`timestamp`/`href`) that the API does not return. Build pure adapter functions that translate v2 API objects into those props. Pure functions → TDD.

**Files:**
- Create: `src/lib/adapters.js`
- Create: `src/lib/adapters.test.js`

- [ ] **Step 1: Write the failing test**

Create `src/lib/adapters.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { adaptFigure, adaptCitation, formatTimestamp } from './adapters'

describe('adaptFigure', () => {
  it('maps a historical figure to DS props', () => {
    const f = adaptFigure({
      id: 'marcus', name: 'Marcus Aurelius', type: 'historical',
      description: 'Stoic emperor.', metadata: { era: '121–180 AD', fields: ['Stoicism'] }, chunk_count: 812,
    })
    expect(f.category).toBe('historical')
    expect(f.status).toBe('published')          // chunk_count > 0
    expect(f.meta).toBe('121–180 AD')
    expect(f.accentColor).toMatch(/^#/)         // deterministic hue derived
  })

  it('marks a figure with no chunks as coming-soon (unavailable)', () => {
    const f = adaptFigure({ id: 'x', name: 'X', type: 'creator', description: '', metadata: {}, chunk_count: 0 })
    expect(f.status).toBe('coming-soon')
    expect(f.category).toBe('creator')
  })

  it('uses channel for a creator meta line', () => {
    const f = adaptFigure({
      id: 'veritasium', name: 'Veritasium', type: 'creator',
      description: 'Science.', metadata: { channel: 'Science & Education' }, chunk_count: 400,
    })
    expect(f.meta).toBe('Science & Education')
  })
})

describe('formatTimestamp', () => {
  it('formats seconds as mm:ss and h:mm:ss', () => {
    expect(formatTimestamp(72)).toBe('1:12')
    expect(formatTimestamp(5)).toBe('0:05')
    expect(formatTimestamp(3725)).toBe('1:02:05')
  })
})

describe('adaptCitation', () => {
  it('produces a book variant for a historical citation', () => {
    const c = adaptCitation({ source: 'Meditations', excerpt: 'The obstacle is the way.', score: 0.9, metadata: {} })
    expect(c.variant).toBe('book')
    expect(c.excerpt).toContain('obstacle')
    expect(c.source).toBe('Meditations')
  })

  it('produces a video variant with a t-linked href for a creator citation', () => {
    const c = adaptCitation({
      source: 'Is Reality Real?', excerpt: 'The universe is consistent.', score: 0.8,
      metadata: { video_id: 'abc', url: 'https://youtu.be/abc', start_seconds: 754.2, source: 'Is Reality Real?' },
    }, '#2A6DF4')
    expect(c.variant).toBe('video')
    expect(c.videoTitle).toBe('Is Reality Real?')
    expect(c.timestamp).toBe('12:34')
    expect(c.href).toBe('https://youtu.be/abc?t=754s')
    expect(c.channelColor).toBe('#2A6DF4')
  })
})
```

Run `npm test` → FAIL (module missing).

- [ ] **Step 2: Write the adapters**

Create `src/lib/adapters.js`:

```js
// Deterministic accent hue for a figure when the API supplies none.
// Warm/era palette for historical, cooler channel-ish hues for creators.
const HIST_HUES = ['#40507A', '#3B6E7A', '#7A5230', '#5B6E43', '#8A5A6E', '#4A5A6E']
const CREATOR_HUES = ['#2A6DF4', '#E0563B', '#1F8A70', '#C4302B', '#6A4CB8', '#0E7C86']

function hueFor(id, palette) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return palette[h % palette.length]
}

export function adaptFigure(f) {
  const category = f.type === 'creator' ? 'creator' : 'historical'
  const m = f.metadata || {}
  const meta = category === 'creator'
    ? (m.channel || (Array.isArray(m.fields) ? m.fields.join(' · ') : '') || 'Creator')
    : (m.era || (Array.isArray(m.fields) ? m.fields.join(' · ') : '') || 'Historical')
  return {
    id: f.id,
    name: f.name,
    description: f.description || '',
    category,
    accentColor: hueFor(f.id, category === 'creator' ? CREATOR_HUES : HIST_HUES),
    meta,
    fields: Array.isArray(m.fields) ? m.fields : [],
    status: f.chunk_count > 0 ? 'published' : 'coming-soon',
    chunkCount: f.chunk_count,
    // static opener prompts per figure could come from the API later; empty for now.
    openers: Array.isArray(m.openers) ? m.openers : [],
  }
}

export function formatTimestamp(totalSeconds) {
  const s = Math.floor(totalSeconds || 0)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = String(s % 60).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`
}

export function adaptCitation(c, channelColor) {
  const md = c.metadata || {}
  const isVideo = !!md.video_id
  if (isVideo) {
    const start = Math.floor(md.start_seconds || 0)
    return {
      variant: 'video',
      excerpt: c.excerpt,
      videoTitle: md.source || c.source,
      timestamp: formatTimestamp(md.start_seconds || 0),
      href: md.url ? `${md.url}?t=${start}s` : '#',
      channelColor,
      thumbnail: md.thumbnail || undefined,
    }
  }
  return {
    variant: 'book',
    excerpt: c.excerpt,
    source: c.source,
    detail: md.locator || md.detail || undefined,
  }
}
```

- [ ] **Step 3: Run the test** → PASS. `npm run lint`.

- [ ] **Step 4: Commit**

```powershell
git add frontend/src/lib/adapters.js frontend/src/lib/adapters.test.js
git commit -m "frontend: figure + citation adapters (API → DS props), tested"
```

---

### Task 5: RosterScreen — port from the UI kit, wire to `GET /figures`

Port `ui_kits/symposium-app/RosterScreen.jsx` to ESM imports and real data. Preserve the masthead, hero, `CategoryTabs`, availability count line, and the `auto-fill minmax(300px)` `FigureCard` grid exactly. Add the loading-roster state.

**Files:**
- Create: `src/screens/RosterScreen.jsx`
- Create: `src/components/Masthead.jsx`

- [ ] **Step 1: Extract the Masthead**

Copy the `Masthead` from the UI kit (`ui_kits/symposium-app/RosterScreen.jsx` lines 3–19) into `src/components/Masthead.jsx`, changing the top line to ESM. Keep the wordmark ("Symposium" in display serif + cinnabar dot + eyebrow "The reading room") and the two buttons byte-for-byte:

```jsx
import { Button } from './ds'

export function Masthead() {
  return (
    <header style={{ borderBottom: '1px solid var(--border-line)', background: 'var(--surface-page)' }}>
      <div style={{ maxWidth: 'var(--width-page)', margin: '0 auto', padding: '0 var(--space-8)', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
          <span style={{ font: 'var(--fw-regular) 26px/1 var(--font-display)', letterSpacing: '0.02em', color: 'var(--text-strong)' }}>Symposium</span>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)' }} />
          <span className="sym-eyebrow" style={{ fontSize: 11 }}>The reading room</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Button variant="quiet" size="sm">About</Button>
          <Button variant="secondary" size="sm">Sign in</Button>
        </div>
      </div>
    </header>
  )
}
```

(Note: `import { Button } from './ds'` — `Masthead.jsx` lives in `src/components/`, next to `ds/`.)

- [ ] **Step 2: Write RosterScreen with real data + loading state**

Create `src/screens/RosterScreen.jsx`. Structure and inline styles are copied from the UI kit's `RosterScreen`; the only changes are (a) `figures` comes from a prop (adapted API data) not `window.SYM_DATA`, (b) a loading skeleton state, (c) category counts computed from the adapted list.

```jsx
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
            {shown.map((f) => (
              <FigureCard key={f.id} {...f} onClick={() => f.status !== 'coming-soon' && onOpenFigure(f)} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
```

`FigureCard` already renders the "coming soon" figures dimmed and non-interactive from its own `status` prop — that IS the unavailable-figure state on the roster (a figure with `chunk_count === 0` gets `status: 'coming-soon'` from the adapter). No extra styling needed.

- [ ] **Step 3: Manual check** — deferred to Task 7 (App wiring) since RosterScreen needs the App shell. Move on.

- [ ] **Step 4: Commit**

```powershell
git add frontend/src/screens/RosterScreen.jsx frontend/src/components/Masthead.jsx
git commit -m "frontend: RosterScreen + Masthead ported to real /figures data with loading state"
```

---

### Task 6: ChatScreen — port from the UI kit, wire to the SSE hook

Port `ui_kits/symposium-app/ChatScreen.jsx` (ChatHeader, EmptyState, ErrorState, thread, Composer) to ESM + the real `useChatStream` hook. Replace the faked `setTimeout` streaming with the hook; render citations through `adaptCitation` so the correct book/video variant shows. Keep every inline style and copy string exactly.

**Files:**
- Create: `src/screens/ChatScreen.jsx`

- [ ] **Step 1: Write ChatScreen**

Copy the four sub-components (`ChatHeader`, `EmptyState`, `ErrorState`, `Msg`) from the UI kit verbatim, changing only the imports line and the citation prop (adapted). Replace the faked `send`/phase machine with `useChatStream`. Sessions come from a prop (Task 7 loads them via `GET /sessions`).

```jsx
import React from 'react'
import {
  SessionSidebar, MessageBubble, TypingIndicator, Composer,
  SuggestedQuestion, DisclosureBanner, FigurePortrait, IconButton, Button,
} from '../components/ds'
import { useChatStream } from '../hooks/useChatStream'
import { adaptCitation } from '../lib/adapters'

function ChatHeader({ figure, onBack }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--border-line)', background: 'var(--surface-page)' }}>
      <IconButton label="Back to roster" variant="ghost" onClick={onBack}>←</IconButton>
      <FigurePortrait name={figure.name} category={figure.category} accentColor={figure.accentColor} shape="round" size={38} grain={false} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ font: 'var(--fw-regular) var(--text-xl)/1 var(--font-display)', color: 'var(--text-strong)' }}>{figure.name}</span>
          <DisclosureBanner figureName={figure.name} inline />
        </div>
        <span style={{ font: 'var(--fw-regular) var(--text-xs)/1.4 var(--font-sans)', color: 'var(--text-faint)' }}>{figure.meta}</span>
      </div>
      <Button variant="ghost" size="sm">Sources</Button>
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
    <div style={{ maxWidth: 'var(--width-chat)', margin: '0 auto', padding: 'var(--space-10) var(--space-6)', textAlign: 'center' }}>
      <FigurePortrait name={figure.name} category={figure.category} accentColor={figure.accentColor} size={92} style={{ margin: '0 auto' }} />
      <h2 style={{ margin: 'var(--space-5) 0 0', font: 'var(--fw-regular) var(--text-3xl)/1.1 var(--font-display)', color: 'var(--text-strong)' }}>{figure.name}</h2>
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

export function ChatScreen({ figure, sessions, activeSession, initialMessages = [], onBack, onSelectSession, onNewConversation }) {
  const { messages, phase, streamText, send, retry, reset } = useChatStream(activeSession)
  const [draft, setDraft] = React.useState('')
  const threadRef = React.useRef(null)

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
    <div style={{ display: 'flex', height: '100%', background: 'var(--surface-page)' }}>
      <SessionSidebar sessions={sessions} activeId={activeSession} onSelect={onSelectSession} onNew={onNewConversation} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <ChatHeader figure={figure} onBack={onBack} />
        <DisclosureBanner figureName={figure.name} />
        <div ref={threadRef} style={{ flex: 1, overflowY: 'auto', backgroundImage: 'var(--texture-grain)' }}>
          {empty ? (
            <EmptyState figure={figure} onAsk={(q) => submit(q)} />
          ) : phase === 'error' ? (
            <div style={{ maxWidth: 'var(--width-chat)', margin: '0 auto', padding: 'var(--space-6)' }}>
              {messages.map((m, i) => <Msg key={i} m={m} figure={figure} />)}
              <ErrorState onRetry={retry} />
            </div>
          ) : (
            <div style={{ maxWidth: 'var(--width-chat)', margin: '0 auto', padding: 'var(--space-7) var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-7)' }}>
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
        <div style={{ borderTop: '1px solid var(--border-line)', background: 'var(--surface-page)', padding: 'var(--space-4) var(--space-6) var(--space-5)' }}>
          <div style={{ maxWidth: 'var(--width-chat)', margin: '0 auto' }}>
            <Composer value={draft} onChange={setDraft} onSend={(t) => submit(t)} figureName={figure.name} busy={busy} />
          </div>
        </div>
      </div>
    </div>
  )
}
```

The Composer already renders the persistent AI-recreation disclosure line beneath the input (its `disclosure` prop defaults true), and `DisclosureBanner` renders the full ruled strip below the header — both figure types get "AI recreation, not the real person". No extra creator-only banner needed; the disclosure is universal per the design (readme "Person & address").

- [ ] **Step 2: Commit**

```powershell
git add frontend/src/screens/ChatScreen.jsx
git commit -m "frontend: ChatScreen ported to real SSE hook + dual-variant citations"
```

---

### Task 7: App shell — routing, figure load, session loading

Replace the 500-line v1 `App.jsx` with a thin shell: load figures once (loading state), route roster ↔ chat, load `GET /sessions` for the sidebar, and persist the active session in `localStorage`. This is where the roster loading state, unavailable-figure gating, and session restore come together. Delete v1 CSS.

**Files:**
- Modify: `src/App.jsx` (full rewrite)
- Delete: `src/App.css`, `src/index.css`

- [ ] **Step 1: Rewrite App.jsx**

```jsx
import React from 'react'
import { RosterScreen } from './screens/RosterScreen'
import { ChatScreen } from './screens/ChatScreen'
import { api } from './lib/api'
import { adaptFigure } from './lib/adapters'

export default function App() {
  const [figures, setFigures] = React.useState([])
  const [loadingFigures, setLoadingFigures] = React.useState(true)
  const [view, setView] = React.useState('roster')       // 'roster' | 'chat'
  const [figure, setFigure] = React.useState(null)
  const [sessions, setSessions] = React.useState([])
  const [activeSession, setActiveSession] = React.useState(null)

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

  const openFigure = (f) => {
    if (f.status === 'coming-soon') return
    setFigure(f)
    setRestored([])
    setActiveSession(null)          // fresh conversation; backend mints the session id
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
      ) : (
        <ChatScreen
          figure={figure}
          sessions={sessions}
          activeSession={activeSession}
          initialMessages={restored}
          onBack={() => { loadSessions(); setView('roster') }}
          onSelectSession={openSession}
          onNewConversation={newConversation}
        />
      )}
    </div>
  )
}
```

> Session field names are now exact (verified against `backend/conversations.py`): rows carry `id, title, created_at, updated_at, metadata, conversation_count, message_count` and **no figure field** — which is why `openSession` resolves the figure and prior messages through `GET /sessions/{id}/history`.

- [ ] **Step 2: Remove v1 styles** — delete `src/App.css` and `src/index.css` (their imports were already removed in Task 1 Step 3). Confirm nothing else imports them (`git grep "App.css\|index.css" frontend/src`).

- [ ] **Step 3: Commit**

```powershell
git add frontend/src/App.jsx
git rm frontend/src/App.css frontend/src/index.css
git commit -m "frontend: App shell — figure/session loading, roster↔chat routing"
```

---

### Task 8: Test infrastructure (Vitest + React Testing Library)

The project has no JS test infra. Add Vitest + RTL + jsdom minimally so the tests written in Tasks 3–4 run, and add the CitationCard + roster-filter component tests. Do this task before running any `npm test` from earlier tasks if executing linearly.

**Files:**
- Modify: `package.json` (devDeps + `test` script)
- Create: `vitest.config.js`
- Create: `src/test/setup.js`
- Create: `src/components/ds/chat/CitationCard.test.jsx`
- Create: `src/screens/RosterScreen.filter.test.jsx`

- [ ] **Step 1: Install dev dependencies**

```powershell
npm install -D vitest@^2 @testing-library/react@^16 @testing-library/jest-dom@^6 jsdom@^25 @testing-library/user-event@^14
```

Add to `package.json` scripts: `"test": "vitest run"`, `"test:watch": "vitest"`.

- [ ] **Step 2: Vitest config + setup**

Create `vitest.config.js`:

```js
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom', globals: true, setupFiles: ['./src/test/setup.js'] },
})
```

Create `src/test/setup.js`:

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 3: CitationCard timestamp-link test** (verifies the video deep-link renders and points at `?t=<seconds>s`)

Create `src/components/ds/chat/CitationCard.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CitationCard } from './CitationCard.jsx'
import { adaptCitation } from '../../../lib/adapters'

describe('CitationCard', () => {
  it('renders a book excerpt with source + detail', () => {
    const c = adaptCitation({ source: 'Meditations', excerpt: 'The obstacle is the way.', score: 0.9, metadata: { detail: 'Book V, 20' } })
    render(<CitationCard index={1} {...c} />)
    expect(screen.getByText(/The obstacle is the way/)).toBeInTheDocument()
    expect(screen.getByText('Meditations')).toBeInTheDocument()
    expect(screen.getByText('Book V, 20')).toBeInTheDocument()
  })

  it('renders a video citation as a timestamp deep-link', () => {
    const c = adaptCitation({
      source: 'Is Reality Real?', excerpt: 'The universe is consistent.', score: 0.8,
      metadata: { video_id: 'abc', url: 'https://youtu.be/abc', start_seconds: 754, source: 'Is Reality Real?' },
    }, '#2A6DF4')
    render(<CitationCard index={1} {...c} />)
    const link = screen.getByRole('link', { name: /said in Is Reality Real\? @ 12:34/ })
    expect(link).toHaveAttribute('href', 'https://youtu.be/abc?t=754s')
  })
})
```

- [ ] **Step 4: Roster category-filter test** (verifies tabs filter the grid)

Create `src/screens/RosterScreen.filter.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RosterScreen } from './RosterScreen'
import { adaptFigure } from '../lib/adapters'

const figures = [
  adaptFigure({ id: 'marcus', name: 'Marcus Aurelius', type: 'historical', description: 'Stoic.', metadata: { era: '121–180 AD' }, chunk_count: 10 }),
  adaptFigure({ id: 'veritasium', name: 'Veritasium', type: 'creator', description: 'Science.', metadata: { channel: 'Science' }, chunk_count: 10 }),
]

describe('RosterScreen filtering', () => {
  it('shows historical by default and switches to creators on tab click', async () => {
    render(<RosterScreen figures={figures} loading={false} onOpenFigure={() => {}} />)
    expect(screen.getByText('Marcus Aurelius')).toBeInTheDocument()
    expect(screen.queryByText('Veritasium')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('tab', { name: /Creators/ }))
    expect(screen.getByText('Veritasium')).toBeInTheDocument()
    expect(screen.queryByText('Marcus Aurelius')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 5: Run the full suite** — `npm test`. Expect all suites green: `useChatStream` (2), `adapters` (5), `CitationCard` (2), `RosterScreen.filter` (1). Fix any import-path drift.

- [ ] **Step 6: Commit**

```powershell
git add frontend/package.json frontend/package-lock.json frontend/vitest.config.js frontend/src/test frontend/src/components/ds/chat/CitationCard.test.jsx frontend/src/screens/RosterScreen.filter.test.jsx
git commit -m "frontend: Vitest + RTL infra; CitationCard + roster-filter tests"
```

---

### Task 9: Responsive layout (desktop-first, usable mobile)

The design is desktop-first (page 1240px, chat column 760px, sidebar 288px). Add a small responsive stylesheet so the sidebar collapses and the roster grid + hero stay usable below ~720px. Keep all changes in one plain-CSS file layered over the DS (no component edits — the DS uses inline styles, so overrides go through the `.sym-*` class hooks the components already carry).

**Files:**
- Create: `src/design/responsive.css`
- Modify: `src/main.jsx` (import it after `styles.css`)

- [ ] **Step 1: Write responsive.css** using the class hooks the DS components expose (`.sym-sidebar`, `.sym-figurecard`, `.sym-tabs`, `.sym-message`):

```css
/* Desktop-first overrides. DS components render inline styles; these class hooks
   (present on every DS component) let us adjust layout at small viewports. */
@media (max-width: 720px) {
  .sym-sidebar { display: none; }               /* hide the session rail on phones */
  .sym-figurecard { padding: var(--space-4); }
}
@media (max-width: 520px) {
  .sym-tabs { gap: var(--space-5); }
}
```

Additionally, in `RosterScreen.jsx` the hero `<h1>` uses a hard `<br />`; wrap the masthead/main horizontal padding tokens so they already shrink via `--space-8`. If the hero feels tight on mobile during manual check, reduce its font token in a media query here rather than editing the screen.

- [ ] **Step 2: Import after the base stylesheet** in `main.jsx`:

```jsx
import './design/styles.css'
import './design/responsive.css'
```

- [ ] **Step 3: Manual responsive check** (part of Task 10) — resize to 375px, 768px, 1240px; confirm roster grid reflows to one column, sidebar hides on phone, chat column stays centered and readable.

- [ ] **Step 4: Commit**

```powershell
git add frontend/src/design/responsive.css frontend/src/main.jsx
git commit -m "frontend: responsive overrides — collapse sidebar + reflow roster on small screens"
```

---

### Task 10: Manual verification pass + visual-fidelity check

No new source (except any small fixes found). Run the app against the live backend and verify every state and visual detail matches `ui_kits/symposium-app/`. This is the acceptance gate.

**Files:**
- Modify: none expected (fix-forward only if a defect is found; commit fixes separately)

- [ ] **Step 1: Start backend + frontend**

```powershell
# terminal 1 (repo root)
backend\venv\Scripts\python backend\main.py   # serves on :8010 (PORT in repo-root .env)
# terminal 2
cd frontend; npm run dev                       # serves on :3000, proxies /api → :8010
```

- [ ] **Step 2: Verify each state against the UI kit.** Open `.claude/skills/symposium-design/ui_kits/symposium-app/index.html` and `states.html` side-by-side with `http://localhost:3000` and confirm pixel-level parity:
  - **Loading roster:** skeleton cards show before `/figures` resolves.
  - **Roster:** masthead wordmark + cinnabar dot, hero headline in Libre Caslon Display, `CategoryTabs` underline treatment, availability count in mono, `auto-fill minmax(300px)` grid, 3px personal-accent edge on cards, paper-grain background.
  - **Unavailable figure:** a `chunk_count === 0` figure renders dimmed, non-clickable, "Coming soon" badge.
  - **Empty chat:** portrait monogram plate, "Begin with" rule, three `SuggestedQuestion` chips; clicking one sends it.
  - **Thinking:** `TypingIndicator` three rising dots + "{figure} is consulting the text" (historical) / "is scanning the transcripts" (creator).
  - **Streaming:** assistant text rises in serif with the blinking cinnabar caret.
  - **Cited reply (book):** historical figure — `CitationCard` book variant, hanging quotation mark, source rule, mono locator.
  - **Cited reply (video):** creator figure — `CitationCard` video variant, thumbnail/gradient plate, play glyph, mono timestamp chip, and the "said in {Title} @ mm:ss" link that opens `url?t=<seconds>s` in a new tab (verify the link href in DevTools).
  - **Error:** kill the backend mid-send → "The line went quiet." with a working "Try again".
  - **Disclosure:** the ruled `DisclosureBanner` under the header + the Composer's per-message disclosure line are present for BOTH figure types.
  - **Sessions:** `SessionSidebar` lists `GET /sessions` rows; a new session id from the first `start` event persists and back-to-roster refreshes the list.
- [ ] **Step 3: Responsive check** (375 / 768 / 1240px) as in Task 9 Step 3.
- [ ] **Step 4: Full test + lint gate:** `npm test` (all green) and `npm run lint` (clean).
- [ ] **Step 5:** Fix any defect fix-forward; commit each fix as `frontend: fix <thing>`. When all checks pass, the redesign is complete.

---

## Coverage checklist (self-review)

- **Screens:** RosterScreen (T5), ChatScreen (T6), App shell/routing (T7). ✓
- **Components (all copied from UI kit, wired to API):** FigureCard, CategoryTabs, FigurePortrait, MessageBubble, CitationCard (book + video), Composer, SessionSidebar, TypingIndicator, DisclosureBanner, SuggestedQuestion, Masthead, Button/IconButton/Badge/Tag. ✓ (T2, T5, T6)
- **States:** loading roster (T5 skeleton), empty chat w/ suggested questions (T6 EmptyState), thinking (T6 TypingIndicator), streaming (T6 caret), error (T6 ErrorState), unavailable figure (T5 coming-soon gating). ✓
- **Citations:** book excerpt for historical, video thumbnail + clickable `url?t=<start_seconds>s` timestamp deep-link for creators; variant chosen by `metadata.video_id` presence. ✓ (T4, T6, T8)
- **Disclosure:** "AI recreation, not the real person" via DisclosureBanner (both types) + Composer line. ✓ (T6)
- **API wiring:** real v2 shapes; v1 compat shim in `loadFigures` killed — `adaptFigure` replaces it, deriving `category`/`accentColor`/`meta`/`status` (T4, T7). ✓
- **SSE:** working v1 pattern extracted into `useChatStream` (T3), not reinvented. ✓
- **Sessions:** sidebar backed by `GET /sessions` (T7). ✓
- **Fonts:** Google Fonts `<link>` in index.html mirroring `tokens/fonts.css` (T1). ✓
- **Tests:** Vitest + RTL added (T8); SSE hook mocked-stream (T3), CitationCard timestamp link (T8), roster category filtering (T8), adapters (T4). ✓
- **Responsive:** desktop-first + small-screen overrides (T9). ✓
- **Manual fidelity:** side-by-side against ui_kits/symposium-app (T10). ✓

## Open items for the implementer to confirm during execution

1. ~~`GET /sessions` row shape~~ — RESOLVED during controller review: exact keys are `id, title, created_at, updated_at, metadata, conversation_count, message_count`; no figure field. Task 7 resolves figure + prior messages via `GET /sessions/{id}/history` and passes `initialMessages` to ChatScreen.
2. **Openers** — the API has no per-figure opener prompts; `EmptyState` falls back to three generic prompts (Task 6). If the operator later adds `metadata.openers`, the adapter already forwards them.
3. **axios** — no longer used in the redesigned code (all calls go through `fetch` in `api.js`). It can be removed from `package.json` dependencies in a cleanup commit, but leaving it is harmless; not required by this plan.
