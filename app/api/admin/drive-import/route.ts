import { NextRequest, NextResponse } from 'next/server'
import { Readable } from 'stream'
import { isAdmin } from '@/lib/auth/roles'
import { getMux } from '@/lib/mux'
import { listDriveFolderVideos, streamDriveFile, parseFolderId } from '@/lib/google-drive'
import { addGalleryItem } from '@/lib/db/queries/gallery'

export const maxDuration = 300

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  let body: { action?: string; folderId?: string; bookingId?: string; fileId?: string; fileName?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  // ── List videos in a Drive folder ────────────────────────────────────────
  if (body.action === 'list_files') {
    if (!body.folderId) return NextResponse.json({ error: 'folderId required' }, { status: 400 })
    const folderId = parseFolderId(body.folderId)
    const files = await listDriveFolderVideos(folderId)
    return NextResponse.json({ files })
  }

  // ── Import a single file: Drive → Mux → gallery_item ────────────────────
  if (body.action === 'import_file') {
    const { bookingId, fileId, fileName } = body
    if (!bookingId || !fileId) {
      return NextResponse.json({ error: 'bookingId and fileId required' }, { status: 400 })
    }

    const mux = getMux()

    // 1. Create a Mux direct upload slot
    const upload = await mux.video.uploads.create({
      cors_origin: '*',
      new_asset_settings: { playback_policies: ['public'] },
    })

    // 2. Stream the Drive file directly to Mux's GCS upload URL
    const driveStream = await streamDriveFile(fileId)
    const webStream = Readable.toWeb(driveStream) as ReadableStream

    const putRes = await fetch(upload.url!, {
      method: 'PUT',
      body: webStream,
      headers: { 'Content-Type': 'video/mp4' },
      // @ts-ignore — Node fetch requires duplex for streaming bodies
      duplex: 'half',
    })

    if (!putRes.ok) {
      return NextResponse.json({ error: `Mux upload failed: ${putRes.status}` }, { status: 502 })
    }

    // 3. Poll until Mux creates the asset (typically < 10s after upload completes)
    let assetId: string | undefined
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 2000))
      const u = await mux.video.uploads.retrieve(upload.id)
      if (u.asset_id) { assetId = u.asset_id; break }
    }

    if (!assetId) {
      return NextResponse.json({ error: 'Mux asset not created in time — check Mux dashboard' }, { status: 504 })
    }

    // 4. Get the playback ID from the asset
    const asset = await mux.video.assets.retrieve(assetId)
    const playbackId = asset.playback_ids?.[0]?.id

    if (!playbackId) {
      return NextResponse.json({ error: 'No playback ID on Mux asset' }, { status: 500 })
    }

    // 5. Create the gallery item in DB
    const item = await addGalleryItem({
      bookingId,
      muxAssetId: assetId,
      muxPlaybackId: playbackId,
      title: fileName ? fileName.replace(/\.[^.]+$/, '') : undefined,
    })

    return NextResponse.json({ item })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
