import { NextRequest, NextResponse } from 'next/server'
import { Readable } from 'stream'
import { isAdmin } from '@/lib/auth/roles'
import { getMux } from '@/lib/mux'
import { listDriveFolderVideos, streamDriveFile, parseFolderId } from '@/lib/google-drive'
import { pollMuxAsset, createGalleryItemFromUpload, MuxAssetTimeoutError, MuxNoPlaybackIdError } from '@/lib/mux-poll-upload'

export const maxDuration = 300

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  let body: { action?: string; folderId?: string; bookingId?: string; fileId?: string; fileName?: string; uploadId?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  // ── List videos in a Drive folder ────────────────────────────────────────
  if (body.action === 'list_files') {
    if (!body.folderId) return NextResponse.json({ error: 'folderId required' }, { status: 400 })
    const files = await listDriveFolderVideos(parseFolderId(body.folderId))
    return NextResponse.json({ files })
  }

  // ── Import a single file: Drive → Mux → gallery_item ────────────────────
  if (body.action === 'import_file') {
    const { bookingId, fileId, fileName } = body
    if (!bookingId || !fileId) {
      return NextResponse.json({ error: 'bookingId and fileId required' }, { status: 400 })
    }

    const mux = getMux()
    const upload = await mux.video.uploads.create({
      cors_origin: '*',
      new_asset_settings: { playback_policies: ['public'] },
    })

    const driveStream = await streamDriveFile(fileId)
    const putRes = await fetch(upload.url!, {
      method: 'PUT',
      body: Readable.toWeb(driveStream) as ReadableStream,
      headers: { 'Content-Type': 'video/mp4' },
      // @ts-ignore — Node fetch requires duplex for streaming bodies
      duplex: 'half',
    })
    if (!putRes.ok) {
      return NextResponse.json({ error: `Mux upload failed: ${putRes.status}` }, { status: 502 })
    }

    try {
      const item = await createGalleryItemFromUpload({ uploadId: upload.id, bookingId, fileName, mux })
      return NextResponse.json({ item })
    } catch (e) {
      if (e instanceof MuxAssetTimeoutError) return NextResponse.json({ error: 'Mux asset not created in time — check Mux dashboard' }, { status: 504 })
      if (e instanceof MuxNoPlaybackIdError) return NextResponse.json({ error: 'No playback ID on Mux asset' }, { status: 500 })
      throw e
    }
  }

  // ── Create a Mux upload URL for direct browser → Mux upload ─────────────
  if (body.action === 'create_upload_url') {
    const upload = await getMux().video.uploads.create({
      cors_origin: '*',
      new_asset_settings: { playback_policies: ['public'] },
    })
    return NextResponse.json({ uploadId: upload.id, uploadUrl: upload.url })
  }

  // ── Finalize: poll for asset, create gallery_item ────────────────────────
  if (body.action === 'finalize_upload') {
    const { uploadId, bookingId, fileName } = body
    if (!uploadId || !bookingId) {
      return NextResponse.json({ error: 'uploadId and bookingId required' }, { status: 400 })
    }

    try {
      const item = await createGalleryItemFromUpload({ uploadId, bookingId, fileName, mux: getMux() })
      return NextResponse.json({ item })
    } catch (e) {
      if (e instanceof MuxAssetTimeoutError) return NextResponse.json({ error: 'Mux asset not ready — try again in a moment' }, { status: 504 })
      if (e instanceof MuxNoPlaybackIdError) return NextResponse.json({ error: 'No playback ID on Mux asset' }, { status: 500 })
      throw e
    }
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
