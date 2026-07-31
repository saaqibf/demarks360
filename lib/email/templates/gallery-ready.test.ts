import { describe, expect, it } from 'vitest'
import { galleryReadyHtml } from './gallery-ready'

const base = {
  booking: { eventDate: '2026-08-15', eventType: 'Wedding', galleryToken: 'tok_abc' },
  customer: { name: 'Amara Okafor', email: 'a@example.com' },
  appUrl: 'https://demarks360.ca',
}

describe('galleryReadyHtml review request', () => {
  it('includes the review CTA when a review URL is set', () => {
    const html = galleryReadyHtml({ ...base, reviewUrl: 'https://g.page/r/demarks/review' })
    expect(html).toContain('https://g.page/r/demarks/review')
  })

  it('omits the review CTA entirely when no review URL is set', () => {
    const html = galleryReadyHtml(base)
    expect(html).not.toContain('Leave a Review')
  })
})
