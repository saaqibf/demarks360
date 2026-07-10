import { ADDON_CATALOG, PRICING, addOnPrice } from './config'

export function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export interface PricingInput {
  durationMinutes: number
  addOnIds: string[]
  locationCity: string
}

export interface PricingLineItem {
  label: string
  amount: number
}

export interface PricingBreakdown {
  durationHours: number
  hourlySubtotal: number
  addOnSubtotal: number
  travelSurcharge: number
  subtotal: number
  depositAmount: number
  balanceAmount: number
  depositCents: number
  balanceCents: number
  lineItems: PricingLineItem[]
}

export function calculateBookingCost(input: PricingInput): PricingBreakdown {
  const durationHours = input.durationMinutes / 60
  const hourlySubtotal = durationHours * PRICING.HOURLY_RATE
  const addOnSubtotal = input.addOnIds.reduce(
    (sum, id) => sum + addOnPrice(id, durationHours),
    0,
  )
  const travelSurcharge = input.locationCity === 'Calgary' ? 0 : PRICING.TRAVEL_SURCHARGE
  const subtotal = hourlySubtotal + addOnSubtotal + travelSurcharge

  const depositAmount = Math.round(subtotal * PRICING.DEPOSIT_PERCENT * 100) / 100
  const balanceAmount = Math.round((subtotal - depositAmount) * 100) / 100
  const depositCents = Math.round(depositAmount * 100)
  const balanceCents = Math.round(balanceAmount * 100)

  const lineItems: PricingLineItem[] = [
    {
      label: `${durationHours.toFixed(1).replace('.0', '')} hrs × $${PRICING.HOURLY_RATE}/hr`,
      amount: hourlySubtotal,
    },
    ...input.addOnIds
      .filter(id => id in ADDON_CATALOG)
      .map(id => ({ label: ADDON_CATALOG[id].name, amount: addOnPrice(id, durationHours) })),
    ...(travelSurcharge > 0 ? [{ label: 'Travel surcharge', amount: travelSurcharge }] : []),
  ]

  return {
    durationHours,
    hourlySubtotal,
    addOnSubtotal,
    travelSurcharge,
    subtotal,
    depositAmount,
    balanceAmount,
    depositCents,
    balanceCents,
    lineItems,
  }
}

export function balanceChargeDate(eventDate: string): string {
  // UTC math so the result never drifts a day depending on the server timezone
  const d = new Date(eventDate + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() - PRICING.BALANCE_CHARGE_DAYS_BEFORE_EVENT)
  return d.toISOString().split('T')[0]
}
