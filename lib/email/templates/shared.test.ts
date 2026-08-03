import { describe, expect, it } from 'vitest'
import { fmtTime } from './shared'

describe('fmtTime', () => {
  it('renders a 24:00 end time as midnight, not noon', () => {
    expect(fmtTime('24:00')).toBe('12:00 AM')
  })

  it('renders 00:00 as midnight', () => {
    expect(fmtTime('00:00')).toBe('12:00 AM')
  })

  it('renders noon as 12:00 PM', () => {
    expect(fmtTime('12:00')).toBe('12:00 PM')
  })

  it('renders a late-evening time correctly', () => {
    expect(fmtTime('22:30')).toBe('10:30 PM')
  })

  it('renders an early-afternoon time correctly', () => {
    expect(fmtTime('13:15')).toBe('1:15 PM')
  })
})
