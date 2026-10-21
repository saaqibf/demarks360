/**
 * Friendly, plain-language labels for booking statuses.
 * The visible text becomes human; the pill color stays keyed to the raw status.
 */
const STATUS_LABELS: Record<string, string> = {
  requested: 'New request',
  approved: 'Quote sent',
  pending: 'Waiting for deposit',
  confirmed: 'Booked',
  completed: 'Done',
  declined: 'Declined',
  cancelled: 'Cancelled',
  expired: 'Hold ended',
}

export function statusLabel(s: string): string {
  return STATUS_LABELS[s] ?? s
}
