import { google } from 'googleapis'
import type { Readable } from 'stream'

export class DriveConfigurationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DriveConfigurationError'
  }
}

type ServiceAccountCredentials = {
  client_email?: string
}

function getServiceAccountCredentials(): ServiceAccountCredentials {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!raw) {
    throw new DriveConfigurationError(
      'Google Drive import requires GOOGLE_SERVICE_ACCOUNT_JSON for a service account with Drive readonly access.'
    )
  }

  try {
    return JSON.parse(raw) as ServiceAccountCredentials
  } catch {
    throw new DriveConfigurationError('GOOGLE_SERVICE_ACCOUNT_JSON must be valid service account JSON.')
  }
}

export function getDriveServiceAccountEmail(): string | null {
  try {
    return getServiceAccountCredentials().client_email ?? null
  } catch {
    return null
  }
}

function getAuth() {
  const credentials = getServiceAccountCredentials()
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
