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
