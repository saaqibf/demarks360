export const PRICING = {
  HOURLY_RATE: 120,
  MIN_DURATION_MINUTES: 90,
  DEPOSIT_PERCENT: 0.30,
  BALANCE_PERCENT: 0.70,
  TRAVEL_SURCHARGE: 50,
  BALANCE_CHARGE_DAYS_BEFORE_EVENT: 7,
  CARD_DELETE_DAYS_AFTER_EVENT: 7,
  MAX_BOOKINGS_PER_DAY: 2,
  LEAD_TIME_DAYS: 7,
} as const

export const ADDON_CATALOG: Record<string, { name: string; price: number }> = {
  firecrackers: { name: 'Firecrackers', price: 75 },
}
