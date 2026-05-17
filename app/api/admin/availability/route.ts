import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth/roles'
import { getAllBlocks, blockDate } from '@/lib/db/queries/availability'

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

  const block = await blockDate(body.date, body.startTime, body.endTime, body.reason)
  return NextResponse.json(block)
}
