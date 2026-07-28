import { useCallback, useRef, useState } from 'react'
import { api } from '../lib/api'

// A room turn stream. `turns` is the display list:
//   { kind: 'user', content }
//   { kind: 'figure', figureId, name, content, citations, streaming }
// The server is stateless, so we replay the accumulated transcript on every send.
// phase: 'idle' | 'thinking' | 'streaming' | 'error'
export function useRoomStream() {
  const [turns, setTurns] = useState([])
  const [phase, setPhase] = useState('idle')
  const turnsRef = useRef([])
  turnsRef.current = turns

  const reset = useCallback((initial = []) => {
    setTurns(initial); setPhase('idle')
  }, [])

  // Map display turns → the [{speaker, content}] the server replays.
  const toTranscript = (list) =>
    list.map((t) => ({ speaker: t.kind === 'user' ? 'You' : t.name, content: t.content }))

  const send = useCallback(async ({ figures, message, includeCitations = true }) => {
    if (!message?.trim() || figures.length < 2) return
    const priorTranscript = toTranscript(turnsRef.current)
    setTurns((t) => [...t, { kind: 'user', content: message }])
    setPhase('thinking')

    let currentId = null
    try {
      const res = await fetch(`${api.base}/room/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ figures, message, transcript: priorTranscript, include_citations: includeCitations }),
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
          if (data.type === 'speaker') {
            currentId = data.figure.id
            setPhase('streaming')
            setTurns((t) => [...t, {
              kind: 'figure', figureId: data.figure.id, name: data.figure.name,
              content: '', citations: null, streaming: true,
            }])
          } else if (data.type === 'citations') {
            setTurns((t) => patchLast(t, data.figure, (turn) => ({ ...turn, citations: data.citations })))
          } else if (data.type === 'content') {
            setTurns((t) => patchLast(t, data.figure, (turn) => ({ ...turn, content: turn.content + data.content })))
          } else if (data.type === 'turn_end') {
            setTurns((t) => patchLast(t, data.figure, (turn) => ({ ...turn, streaming: false })))
          } else if (data.type === 'error') {
            setTurns((t) => patchLast(t, data.figure, (turn) => ({ ...turn, streaming: false, content: turn.content || '(no reply)' })))
          } else if (data.type === 'end') {
            setPhase('idle')
          }
        }
      }
      setPhase('idle')
    } catch (err) {
      console.error('room stream failed:', err)
      setPhase('error')
    }
  }, [])

  return { turns, phase, send, reset }
}

// Patch the most recent figure-turn matching figureId.
function patchLast(list, figureId, fn) {
  for (let i = list.length - 1; i >= 0; i--) {
    if (list[i].kind === 'figure' && list[i].figureId === figureId) {
      const copy = list.slice()
      copy[i] = fn(copy[i])
      return copy
    }
  }
  return list
}
