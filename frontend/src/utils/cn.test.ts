import { describe, expect, it } from 'vitest'

import { formatAge, formatPAD } from './cn'

describe('formatAge', () => {
  it('formats valid age values to one decimal place', () => {
    expect(formatAge(62)).toBe('62.0 yrs')
  })

  it('returns a placeholder for null-like and invalid values', () => {
    expect(formatAge(null)).toBe('--')
    expect(formatAge(undefined)).toBe('--')
    expect(formatAge(Number.NaN)).toBe('--')
  })
})

describe('formatPAD', () => {
  it('marks accelerated values as accelerated', () => {
    expect(formatPAD(5.2)).toMatchObject({
      text: '+5.2 yrs',
      status: 'accelerated',
    })
  })

  it('marks resilient values as resilient', () => {
    expect(formatPAD(-4.4)).toMatchObject({
      text: '-4.4 yrs',
      status: 'resilient',
    })
  })

  it('returns a neutral value for missing or invalid input', () => {
    expect(formatPAD(null)).toMatchObject({
      text: '--',
      status: 'typical',
    })
  })
})
