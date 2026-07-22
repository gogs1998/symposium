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
