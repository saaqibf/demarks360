import type Mux from '@mux/mux-node'
import { addGalleryItem } from '@/lib/db/queries/gallery'

const POLL_INTERVAL_MS = 2000
const POLL_MAX_ATTEMPTS = 30

export class MuxAssetTimeoutError extends Error {
  constructor() {
    super('Mux asset not ready after maximum poll attempts')
    this.name = 'MuxAssetTimeoutError'
  }
}

export class MuxNoPlaybackIdError extends Error {
  constructor() {
    super('No playback ID on Mux asset')
    this.name = 'MuxNoPlaybackIdError'
  }
}

export async function pollMuxAsset(uploadId: string, mux: Mux): Promise<string> {
  for (let i = 0; i < POLL_MAX_ATTEMPTS; i++) {
    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS))
    const upload = await mux.video.uploads.retrieve(uploadId)
    if (upload.asset_id) return upload.asset_id
  }
  throw new MuxAssetTimeoutError()
}

export async function createGalleryItemFromUpload(params: {
  uploadId: string
  bookingId: string
  fileName?: string
  mux: Mux
}) {
  const assetId = await pollMuxAsset(params.uploadId, params.mux)
  const asset = await params.mux.video.assets.retrieve(assetId)
  const playbackId = asset.playback_ids?.[0]?.id
  if (!playbackId) throw new MuxNoPlaybackIdError()

  return addGalleryItem({
    bookingId: params.bookingId,
    muxAssetId: assetId,
    muxPlaybackId: playbackId,
    title: params.fileName ? params.fileName.replace(/\.[^.]+$/, '') : undefined,
  })
}
