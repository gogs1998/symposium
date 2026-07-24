import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LandingScreen } from './LandingScreen'
import { adaptFigure } from '../lib/adapters'

const figures = [
  adaptFigure({ id: 'darwin', name: 'Charles Darwin', type: 'historical', description: 'Naturalist.', metadata: { era: '1809–1882' }, chunk_count: 10 }),
  adaptFigure({ id: 'rogan', name: 'Joe Rogan', type: 'creator', description: 'Podcaster.', metadata: { channel: 'JRE', format: 'podcast' }, chunk_count: 10 }),
]

describe('LandingScreen', () => {
  it('shows the showcase roster and fires onEnter from the reading-room CTA', async () => {
    const onEnter = vi.fn()
    render(<LandingScreen figures={figures} onEnter={onEnter} />)

    // Darwin appears both in the promise-section demo bubble and the showcase card;
    // assert the showcase card specifically (rendered as a heading).
    expect(screen.getByRole('heading', { name: 'Charles Darwin' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Enter the reading room/i }))
    expect(onEnter).toHaveBeenCalledTimes(1)
  })
})
