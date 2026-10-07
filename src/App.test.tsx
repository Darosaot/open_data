import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('OpenEU Lens', () => {
  it('searches the catalogue from the main search field', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByRole('searchbox', { name: 'Search datasets' }), 'bicycle')

    await waitFor(() => {
      expect(screen.getByText('1 dataset')).toBeInTheDocument()
    })
    expect(screen.getByRole('heading', { name: 'Permanent bicycle counter readings in Paris' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'European air quality observations' })).not.toBeInTheDocument()
  })

  it('opens a dataset inspection drawer with preview and schema tabs', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('heading', { name: 'European air quality observations' }))

    const dialog = screen.getByRole('dialog', { name: 'European air quality observations' })
    expect(within(dialog).getByText('Usability check')).toBeInTheDocument()
    expect(within(dialog).getByText('Brussels Arts-Loi')).toBeInTheDocument()

    await user.click(within(dialog).getByRole('tab', { name: 'Schema' }))
    expect(within(dialog).getByText('pollutant')).toBeInTheDocument()
    expect(within(dialog).getByText('Measured pollutant notation')).toBeInTheDocument()
  })

  it('filters to datasets that expose an API', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('checkbox', { name: /API available/i }))

    await waitFor(() => {
      expect(screen.getByText('7 datasets')).toBeInTheDocument()
    })
    expect(screen.queryByRole('heading', { name: 'Public electric vehicle charging infrastructure' })).not.toBeInTheDocument()
  })
})
