import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth/roles'
import { updateBookingStatus, updateBookingNotes } from '@/lib/db/queries/bookings'

// Approve/decline only via their dedicated endpoints so emails and Stripe side effects cannot be skipped
const BOOKING_STATUSES = ['cancelled', 'completed'] as const
type BookingStatus = typeof BOOKING_STATUSES[number]

function isBookingStatus(value: unknown): value is BookingStatus {
  return typeof value === 'string' && BOOKING_STATUSES.includes(value as BookingStatus)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  const { id } = await params
  let body: { status?: string; notes?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const status = body.status
  const notes = body.notes
  const hasStatus = status !== undefined
  const hasNotes = notes !== undefined
  if (!hasStatus && !hasNotes) {
    return NextResponse.json({ error: 'status or notes is required' }, { status: 400 })
  }
  if (hasStatus && !isBookingStatus(status)) {
    return NextResponse.json({ error: 'Invalid booking status' }, { status: 400 })
  }
  if (hasNotes && typeof notes !== 'string') {
    return NextResponse.json({ error: 'notes must be a string' }, { status: 400 })
  }

  if (hasStatus) {
    await updateBookingStatus(id, status)
  }
  if (hasNotes) {
    await updateBookingNotes(id, notes)
  }

  return NextResponse.json({ ok: true })
}
