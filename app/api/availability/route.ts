import { NextRequest, NextResponse } from 'next/server'
import { checkBookingAvailability } from '@/lib/availability'

export async function GET(req: NextRequest) {
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
