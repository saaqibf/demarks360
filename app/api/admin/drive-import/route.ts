import { NextRequest, NextResponse } from 'next/server'
import { Readable } from 'stream'
import { isAdmin } from '@/lib/auth/roles'
import { getMux } from '@/lib/mux'
import {
  DriveConfigurationError,
  getDriveServiceAccountEmail,
  listDriveFolderVideos,
  parseFolderId,
  streamDriveFile,
} from '@/lib/google-drive'
import { createGalleryItemFromUpload, MuxAssetTimeoutError, MuxNoPlaybackIdError } from '@/lib/mux-poll-upload'

export const maxDuration = 300

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const serviceAccountEmail = getDriveServiceAccountEmail()
  return NextResponse.json({
    configured: Boolean(serviceAccountEmail),
    serviceAccountEmail,
    requiredEnv: 'GOOGLE_SERVICE_ACCOUNT_JSON',
    note: 'Use a Google Cloud service account with Drive readonly access. Share Drive folders with its client_email; OAuth is intentionally not implemented here because it requires user secrets and consent setup.',
  })
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  let body: { action?: string; folderId?: string; bookingId?: string; fileId?: string; fileName?: string; uploadId?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  // ── List videos in a Drive folder ────────────────────────────────────────
  if (body.action === 'list_files') {
    if (!body.folderId) return NextResponse.json({ error: 'folderId required' }, { status: 400 })
    try {
      const files = await listDriveFolderVideos(parseFolderId(body.folderId))
      return NextResponse.json({ files })
    } catch (e) {
      if (e instanceof DriveConfigurationError) {
        return NextResponse.json({ error: e.message }, { status: 503 })
      }
      throw e
    }
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

    let driveStream: Awaited<ReturnType<typeof streamDriveFile>>
    try {
      driveStream = await streamDriveFile(fileId)
    } catch (e) {
      if (e instanceof DriveConfigurationError) {
        return NextResponse.json({ error: e.message }, { status: 503 })
      }
      throw e
    }
    const putRes = await fetch(upload.url!, {
      method: 'PUT',
      body: Readable.toWeb(driveStream) as ReadableStream,
      headers: { 'Content-Type': 'application/octet-stream' },
      // Bound a hung upload just under the 300s function limit so it fails cleanly
      // instead of silently consuming the whole invocation.
      signal: AbortSignal.timeout(280_000),
      // Node fetch requires duplex for streaming request bodies.
      // @ts-expect-error duplex is supported by Node but not yet in the DOM RequestInit type.
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
