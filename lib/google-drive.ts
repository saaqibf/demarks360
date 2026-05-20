import { google } from 'googleapis'
import type { Readable } from 'stream'

function getAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON not configured')
  const credentials = JSON.parse(raw)
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  })
}

function getDrive() {
  return google.drive({ version: 'v3', auth: getAuth() })
}

export function parseFolderId(input: string): string {
  const match = input.match(/\/folders\/([a-zA-Z0-9_-]+)/)
  return match ? match[1] : input.trim()
}

export async function listDriveFolderVideos(folderId: string) {
  const drive = getDrive()
  const res = await drive.files.list({
    q: `'${folderId}' in parents and mimeType contains 'video/' and trashed = false`,
    fields: 'files(id, name, size, mimeType)',
    pageSize: 100,
    orderBy: 'createdTime',
  })
  return (res.data.files ?? []).map(f => ({
    id: f.id!,
    name: f.name!,
    size: Number(f.size ?? 0),
    mimeType: f.mimeType ?? 'video/mp4',
  }))
}

export async function streamDriveFile(fileId: string): Promise<Readable> {
  const drive = getDrive()
  const res = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'stream' }
  )
  return res.data as Readable
}
