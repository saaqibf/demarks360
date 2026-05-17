import { NextRequest, NextResponse } from 'next/server'
import { getAvailabilityForDate } from '@/lib/db/queries/availability'

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date')

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
  }

  // Enforce 7-day minimum lead time
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const requestedDate = new Date(date + 'T00:00:00')
  const diffDays = Math.floor((requestedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 7) {
    return NextResponse.json({
      bookedSlots: [],
      adminBlocks: [],
      bookingCount: 0,
      isDateFull: true,
      tooSoon: true,
    })
  }

  const availability = await getAvailabilityForDate(date)
  return NextResponse.json(availability)
}
