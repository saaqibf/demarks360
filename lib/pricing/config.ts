export const PRICING = {
  HOURLY_RATE: 120,
  MIN_DURATION_MINUTES: 90,
  DEPOSIT_PERCENT: 0.50,
  BALANCE_PERCENT: 0.50,
  TRAVEL_SURCHARGE: 50,
  // The second payment is collected the day before the event (link or saved card)
  BALANCE_CHARGE_DAYS_BEFORE_EVENT: 1,
  CARD_DELETE_DAYS_AFTER_EVENT: 7,
  MAX_BOOKINGS_PER_DAY: 2,
  LEAD_TIME_DAYS: 5,
} as const

export interface AddOnPricing {
  name: string
  price?: number
  // One booth attendant covers both machines, so SmileCam prices as a base
  // covering the first hours plus a per-hour rate for longer rentals
  scaled?: { base: number; baseHours: number; perHour: number }
}

export const ADDON_CATALOG: Record<string, AddOnPricing> = {
  firecrackers: { name: 'Firecrackers', price: 75 },
  smilecam: { name: 'SmileCam Photo Booth', scaled: { base: 149, baseHours: 2, perHour: 40 } },
}

export function addOnPrice(id: string, durationHours: number): number {
  const entry = ADDON_CATALOG[id]
  if (!entry) return 0
  if (entry.scaled) {
    const extraHours = Math.max(0, durationHours - entry.scaled.baseHours)
    return entry.scaled.base + Math.ceil(extraHours * entry.scaled.perHour)
  }
  return entry.price ?? 0
}
