import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { LandingPage } from './LandingPage'

describe('LandingPage', () => {
  it('renders the primary CTA and points to the assessment route', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    )

    const link = screen.getByRole('link', { name: /begin an assessment/i })

    expect(link).toHaveAttribute('href', '/assessment')
  })
})
