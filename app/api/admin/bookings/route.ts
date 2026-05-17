import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth/roles'
import { getAllBookings } from '@/lib/db/queries/bookings'

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  const data = await getAllBookings()
  return NextResponse.json(data)
}
