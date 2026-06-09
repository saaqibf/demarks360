import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth/roles'
import { getAllBlocks, blockDate } from '@/lib/db/queries/availability'

function isDateString(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function isTimeString(value: unknown): value is string {
  return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  const blocks = await getAllBlocks()
  return NextResponse.json(blocks)
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  let body: { date?: string; startTime?: string; endTime?: string; reason?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  if (!body.date) return NextResponse.json({ error: 'date is required' }, { status: 400 })
  if (!isDateString(body.date)) return NextResponse.json({ error: 'date must use YYYY-MM-DD format' }, { status: 400 })
  if (body.startTime !== undefined && !isTimeString(body.startTime)) {
    return NextResponse.json({ error: 'startTime must use HH:mm format' }, { status: 400 })
  }
  if (body.endTime !== undefined && !isTimeString(body.endTime)) {
    return NextResponse.json({ error: 'endTime must use HH:mm format' }, { status: 400 })
  }
  if (body.startTime && body.endTime && body.startTime >= body.endTime) {
    return NextResponse.json({ error: 'endTime must be after startTime' }, { status: 400 })
  }

  const block = await blockDate(body.date, body.startTime, body.endTime, body.reason)
  return NextResponse.json(block)
}
