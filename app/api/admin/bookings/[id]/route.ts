import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth/roles'
import { updateBookingStatus, updateBookingNotes } from '@/lib/db/queries/bookings'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  const { id } = await params
  let body: { status?: string; notes?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  if (body.status && ['pending', 'confirmed', 'cancelled', 'completed'].includes(body.status)) {
    await updateBookingStatus(id, body.status as 'pending' | 'confirmed' | 'cancelled' | 'completed')
  }
  if (typeof body.notes === 'string') {
    await updateBookingNotes(id, body.notes)
  }

  return NextResponse.json({ ok: true })
}
