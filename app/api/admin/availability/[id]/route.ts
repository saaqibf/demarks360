import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth/roles'
import { unblockDate } from '@/lib/db/queries/availability'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  const { id } = await params
  await unblockDate(id)
  return NextResponse.json({ ok: true })
}
