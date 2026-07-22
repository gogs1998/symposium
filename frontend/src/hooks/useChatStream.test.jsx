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
