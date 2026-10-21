// Business dates (event days, deposit windows) are anchored to America/Edmonton,
// while servers run in UTC; every wall-clock decision must go through these helpers.

const DAY_MS = 24 * 60 * 60 * 1000
// A sent quote holds the date this long; unpaid, the date goes back on the calendar
export const HOLD_DAYS = 3

export function todayInEdmonton(): string {
  // en-CA yields YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Edmonton' }).format(new Date())
}

export function eventDayStartEdmonton(eventDate: string): Date {
  // Resolve the offset twice: the first guess can straddle a DST switch,
  // re-resolving at the candidate instant lands on the true local midnight
  const utcGuess = new Date(`${eventDate}T00:00:00Z`)
  const candidate = new Date(utcGuess.getTime() - edmontonOffsetMs(utcGuess))
  return new Date(utcGuess.getTime() - edmontonOffsetMs(candidate))
}

export function depositExpiryFrom(now: Date, eventDate: string): Date {
  // The hold must end before the event day begins, even if that is sooner than HOLD_DAYS
  const windowEnd = new Date(now.getTime() + HOLD_DAYS * DAY_MS)
  const eventStart = eventDayStartEdmonton(eventDate)
  return windowEnd.getTime() < eventStart.getTime() ? windowEnd : eventStart
}

function edmontonOffsetMs(at: Date): number {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Edmonton',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    }).formatToParts(at).map((p) => [p.type, p.value]),
  )
  const asUtc = Date.UTC(
    Number(parts.year), Number(parts.month) - 1, Number(parts.day),
    Number(parts.hour) % 24, Number(parts.minute), Number(parts.second),
  )
  return asUtc - at.getTime()
}
