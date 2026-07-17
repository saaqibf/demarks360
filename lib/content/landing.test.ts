import { describe, it, expect } from 'vitest'

import { FAQS, PACKAGES } from './landing'

describe('landing packages — quote model, no public prices', () => {
  it('keeps every tier', () => {
    expect(PACKAGES.map((p) => p.tier)).toEqual(['Essential', 'Celebration', 'All-night'])
  })

  it('never renders a dollar amount in a package label', () => {
    expect(PACKAGES.some((p) => p.quoteLabel.includes('$'))).toBe(false)
  })

  it('gives every package a quote-oriented label', () => {
    expect(PACKAGES.every((p) => p.quoteLabel.toLowerCase().includes('quote'))).toBe(true)
  })

  it('keeps every package feature list', () => {
    expect(PACKAGES.every((p) => p.features.length > 0)).toBe(true)
  })
})

describe('landing FAQ — quote language, no checkout', () => {
  it('never prints a dollar amount', () => {
    expect(FAQS.some((f) => f.a.includes('$'))).toBe(false)
  })

  it('never mentions a secure checkout', () => {
    expect(FAQS.some((f) => /secure checkout/i.test(f.a))).toBe(false)
  })

  it('explains that pricing comes via a quote', () => {
    expect(FAQS.some((f) => /request a quote/i.test(f.a))).toBe(true)
  })
})
