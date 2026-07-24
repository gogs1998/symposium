import { describe, it, expect } from 'vitest'
import { adaptFigure, adaptCitation, formatTimestamp, registersFor } from './adapters'

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

  it('derives a portrait imageUrl from the figure id', () => {
    const f = adaptFigure({ id: 'aurelius', name: 'Marcus Aurelius', type: 'historical', description: '', metadata: {}, chunk_count: 5 })
    expect(f.imageUrl).toBe('/portraits/aurelius.png')
  })
})

describe('registersFor', () => {
  const creator = (format) => adaptFigure({ id: 'c', name: 'C', type: 'creator', description: '', metadata: { format }, chunk_count: 5 })

  it('returns null for a historical figure', () => {
    const f = adaptFigure({ id: 'm', name: 'M', type: 'historical', description: '', metadata: {}, chunk_count: 5 })
    expect(registersFor(f)).toBeNull()
  })

  it('maps podcast/interview formats to the conversational voice', () => {
    expect(registersFor(creator('podcast')).active).toBe('conversational')
    expect(registersFor(creator('interviews+x')).active).toBe('conversational')
  })

  it('defaults a creator with no telling format to the on-camera voice', () => {
    expect(registersFor(creator('speeches+rallies')).active).toBe('on-camera')
    expect(registersFor(creator('')).active).toBe('on-camera')
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

  it('appends t with & when the url already has a query string', () => {
    const c = adaptCitation({
      source: 'V', excerpt: 'x', score: 0.5,
      metadata: { video_id: 'abc', url: 'https://www.youtube.com/watch?v=abc', start_seconds: 60 },
    })
    expect(c.href).toBe('https://www.youtube.com/watch?v=abc&t=60s')
  })
})
