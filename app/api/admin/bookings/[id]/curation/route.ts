import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth/roles'
import { getBookingById, setClipCuration } from '@/lib/db/queries/bookings'

function cleanList(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return [...new Set(v.filter((x): x is string => typeof x === 'string' && x.length < 400))].slice(0, 400)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  const { id } = await params
  const booking = await getBookingById(id)
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

  let body: { hidden?: unknown; featured?: unknown }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  await setClipCuration(id, { hidden: cleanList(body.hidden), featured: cleanList(body.featured) })
  return NextResponse.json({ ok: true })
}
