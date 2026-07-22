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
