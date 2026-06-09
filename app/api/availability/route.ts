import { NextRequest, NextResponse } from 'next/server'
import { checkBookingAvailability } from '@/lib/availability'
import { checkRateLimit } from '@/lib/rate-limit'

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const rl = checkRateLimit(`avail:${ip}`, { limit: 10, windowMs: 60_000 })
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
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
