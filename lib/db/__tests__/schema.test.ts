import { describe, it, expect } from 'vitest'
import { bookings, customers, addOns, galleryItems, availabilityBlocks, settings } from '../schema'

describe('schema', () => {
  it('exports all required tables', () => {
    expect(bookings).toBeDefined()
    expect(customers).toBeDefined()
    expect(addOns).toBeDefined()
    expect(galleryItems).toBeDefined()
    expect(availabilityBlocks).toBeDefined()
    expect(settings).toBeDefined()
  })
})
