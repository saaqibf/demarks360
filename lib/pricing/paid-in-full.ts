// Pay-in-full settles both halves with one Stripe payment intent; a balance recorded
// by hand (cash/e-transfer) has no intent, so it must not read as paid-in-full
export function isPaidInFull(b: {
  balanceChargedAt: Date | null
  stripePaymentIntentId: string | null
  stripeBalancePaymentIntentId: string | null
}): boolean {
  return !!b.balanceChargedAt && !!b.stripePaymentIntentId && b.stripeBalancePaymentIntentId === b.stripePaymentIntentId
}
