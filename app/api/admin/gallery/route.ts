import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth/roles'
import { addGalleryItem, setShowcaseStatus, publishGallery } from '@/lib/db/queries/gallery'

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  let body: {
    action?: string
    bookingId?: string
    muxAssetId?: string
    muxPlaybackId?: string
    thumbnailUrl?: string
    title?: string
    itemId?: string
    isPublicShowcase?: boolean
  }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  if (body.action === 'add_item') {
    if (!body.bookingId || !body.muxAssetId || !body.muxPlaybackId) {
      return NextResponse.json({ error: 'bookingId, muxAssetId, muxPlaybackId required' }, { status: 400 })
    }
    const item = await addGalleryItem({
      bookingId: body.bookingId,
      muxAssetId: body.muxAssetId,
      muxPlaybackId: body.muxPlaybackId,
      thumbnailUrl: body.thumbnailUrl,
      title: body.title,
    })
    return NextResponse.json(item)
  }

  if (body.action === 'set_showcase') {
    if (!body.itemId || body.isPublicShowcase === undefined) {
      return NextResponse.json({ error: 'itemId and isPublicShowcase required' }, { status: 400 })
    }
    await setShowcaseStatus(body.itemId, body.isPublicShowcase)
    return NextResponse.json({ ok: true })
  }

  if (body.action === 'publish_gallery') {
    if (!body.bookingId) return NextResponse.json({ error: 'bookingId required' }, { status: 400 })
    await publishGallery(body.bookingId)
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
