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
