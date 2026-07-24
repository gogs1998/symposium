import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FigureIntroScreen } from './FigureIntroScreen'
import { adaptFigure } from '../lib/adapters'

// The intro fetches the corpus summary from the sources endpoint on mount.
vi.mock('../lib/api', () => ({
  api: { figureSources: vi.fn(() => Promise.resolve({ sources: [{ item_id: 'meditations.txt', kind: 'document', detail: '143 chunks' }] })) },
}))

const figure = adaptFigure({
  id: 'aurelius', name: 'Marcus Aurelius', type: 'historical',
  description: 'Stoic emperor.', metadata: { era: '121–180 CE', openers: ['What is within my control?'] }, chunk_count: 10,
})

describe('FigureIntroScreen routing', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the figure, its openers, and a Begin button; fires onBegin', async () => {
    const onBegin = vi.fn()
    render(<FigureIntroScreen figure={figure} onBegin={onBegin} onOpenWith={() => {}} onBack={() => {}} />)

    expect(screen.getByText('Marcus Aurelius')).toBeInTheDocument()
    expect(screen.getByText('What is within my control?')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /Begin the conversation/i }))
    expect(onBegin).toHaveBeenCalledTimes(1)
  })

  it('passes a chosen opener through onOpenWith (intro → chat with prefill)', async () => {
    const onOpenWith = vi.fn()
    render(<FigureIntroScreen figure={figure} onBegin={() => {}} onOpenWith={onOpenWith} onBack={() => {}} />)

    await userEvent.click(screen.getByText('What is within my control?'))
    expect(onOpenWith).toHaveBeenCalledWith('What is within my control?')
  })

  it('shows the corpus summary drawn from the sources endpoint', async () => {
    render(<FigureIntroScreen figure={figure} onBegin={() => {}} onOpenWith={() => {}} onBack={() => {}} />)
    await waitFor(() => expect(screen.getByText(/1 document/)).toBeInTheDocument())
  })
})
