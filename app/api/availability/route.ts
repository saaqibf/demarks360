import { NextRequest, NextResponse } from 'next/server'
import { checkBookingAvailability, getUnavailableDatesForMonth } from '@/lib/availability'
import { checkRateLimit } from '@/lib/rate-limit'

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const rl = checkRateLimit(`avail:${ip}`, { limit: 10, windowMs: 60_000 })
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const month = req.nextUrl.searchParams.get('month')
  if (month) {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      return NextResponse.json({ error: 'Invalid month' }, { status: 400 })
    }
    const [y, m] = month.split('-').map(Number)
    try {
      const unavailableDates = await getUnavailableDatesForMonth(y, m)
      return NextResponse.json({ unavailableDates })
    } catch {
      return NextResponse.json({ unavailableDates: [] })
    }
  }

  const date = req.nextUrl.searchParams.get('date')

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
  }

  try {
    const availability = await checkBookingAvailability(date)
    return NextResponse.json(availability)
  } catch {
    return NextResponse.json({ status: 'available', bookedSlots: [], bookingCount: 0, adminBlocks: [] })
  }
}
