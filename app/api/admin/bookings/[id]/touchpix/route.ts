import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth/roles'
import { getBookingById, setTouchpixGalleryUrl } from '@/lib/db/queries/bookings'
import { isTouchpixGalleryUrl, fetchTouchpixGallery } from '@/lib/touchpix'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  const { id } = await params

  const booking = await getBookingById(id)
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

  let body: { url?: string | null }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  // Disconnect
  if (body.url === null || body.url === '') {
    await setTouchpixGalleryUrl(id, null)
    return NextResponse.json({ ok: true, url: null, itemCount: 0 })
  }

  const url = body.url?.trim()
  if (!url || !isTouchpixGalleryUrl(url)) {
    return NextResponse.json({ error: 'That does not look like a Touchpix gallery link.' }, { status: 400 })
  }

  // Confirm the link actually resolves to a gallery with clips before saving,
  // so the operator gets immediate feedback instead of an empty page later.
  let itemCount = 0
  try {
    const gallery = await fetchTouchpixGallery(url, { revalidate: 0 })
    itemCount = gallery.items.length
  } catch {
    return NextResponse.json({ error: 'Could not read that gallery. Check the link and try again.' }, { status: 502 })
  }
  if (itemCount === 0) {
    return NextResponse.json({ error: 'That gallery has no videos yet. Try again once the booth has uploaded.' }, { status: 422 })
  }

  await setTouchpixGalleryUrl(id, url)
  return NextResponse.json({ ok: true, url, itemCount })
}
