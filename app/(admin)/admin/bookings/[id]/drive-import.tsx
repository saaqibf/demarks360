'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface DriveFile {
  id: string
  name: string
  size: number
  mimeType: string
}

interface Props {
  bookingId: string
}

function fmtSize(bytes: number): string {
  if (bytes === 0) return 'Not set'
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const D = 'rgba(255,255,255,0.06)'
const LABEL: React.CSSProperties = { fontFamily: 'var(--font-ui)', fontSize: '0.68rem', color: 'rgba(245,240,234,0.35)' }
const VAL: React.CSSProperties = { fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--color-text-light)' }

export function DriveImport({ bookingId }: Props) {
  const router = useRouter()
  const [folderUrl, setFolderUrl] = useState('')
  const [serviceAccountEmail, setServiceAccountEmail] = useState<string | null>(null)
  const [configNote, setConfigNote] = useState('')
  const [files, setFiles] = useState<DriveFile[]>([])
  const [listing, setListing] = useState(false)
  const [listError, setListError] = useState('')
  const [importing, setImporting] = useState<Record<string, 'idle' | 'loading' | 'done' | 'error'>>({})
  const [importErrors, setImportErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    let mounted = true
    fetch('/api/admin/drive-import')
      .then(async res => {
        const data = await res.json().catch(() => ({}))
        if (!mounted || !res.ok) return
        setServiceAccountEmail(data.serviceAccountEmail ?? null)
        setConfigNote(data.note ?? '')
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  async function handleList() {
    if (!folderUrl.trim()) return
    setListing(true)
    setListError('')
    setFiles([])
    try {
      const res = await fetch('/api/admin/drive-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list_files', folderId: folderUrl }),
      })
      const data = await res.json()
      if (!res.ok) { setListError(data.error ?? 'Failed to list files'); return }
      setFiles(data.files)
      if (data.files.length === 0) setListError('No video files found in that folder.')
    } catch {
      setListError('Network error. Check folder URL and try again.')
    } finally {
      setListing(false)
    }
  }

  async function handleImport(file: DriveFile) {
    setImporting(p => ({ ...p, [file.id]: 'loading' }))
    setImportErrors(p => ({ ...p, [file.id]: '' }))
    try {
      const res = await fetch('/api/admin/drive-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'import_file', bookingId, fileId: file.id, fileName: file.name }),
      })
      const data = await res.json()
      if (!res.ok) {
        setImporting(p => ({ ...p, [file.id]: 'error' }))
        setImportErrors(p => ({ ...p, [file.id]: data.error ?? 'Import failed' }))
        return
      }
      setImporting(p => ({ ...p, [file.id]: 'done' }))
      router.refresh()
    } catch {
      setImporting(p => ({ ...p, [file.id]: 'error' }))
      setImportErrors(p => ({ ...p, [file.id]: 'Network error' }))
    }
  }

  async function handleImportAll() {
    for (const file of files) {
      if (importing[file.id] === 'done') continue
      await handleImport(file)
    }
  }

  const anyLoading = Object.values(importing).some(s => s === 'loading')
  const allDone = files.length > 0 && files.every(f => importing[f.id] === 'done')

  return (
    <div>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(245,240,234,0.3)', marginBottom: '1rem' }}>
        Import from Google Drive
      </p>

      {/* Folder input */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          type="text"
          value={folderUrl}
          onChange={e => setFolderUrl(e.target.value)}
          placeholder="Paste Drive folder link or ID…"
          onKeyDown={e => e.key === 'Enter' && handleList()}
          style={{
            flex: 1, background: 'rgba(255,255,255,0.04)', border: `1px solid ${D}`,
            borderRadius: '2px', padding: '0.6rem 0.8rem',
            fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--color-text-light)',
            outline: 'none',
          }}
        />
        <button
          onClick={handleList}
          disabled={listing || !folderUrl.trim()}
          style={{
            background: 'rgba(255,255,255,0.06)', border: `1px solid ${D}`,
            borderRadius: '2px', padding: '0 1rem',
            fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: listing ? 'rgba(245,240,234,0.3)' : 'var(--color-text-light)',
            cursor: listing ? 'not-allowed' : 'pointer',
          }}
        >
          {listing ? 'Loading…' : 'List Files'}
        </button>
      </div>

      {listError && (
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.7rem', color: 'var(--color-amber-light)', marginBottom: '1rem' }}>
          {listError}
        </p>
      )}

      {/* File list */}
      {files.length > 0 && (
        <>
          <div style={{ border: `1px solid ${D}`, borderRadius: '2px', overflow: 'hidden', marginBottom: '1rem' }}>
            {files.map((file, i) => {
              const state = importing[file.id] ?? 'idle'
              return (
                <div key={file.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.65rem 0.9rem', gap: '0.75rem',
                  borderBottom: i < files.length - 1 ? `1px solid ${D}` : 'none',
                  background: state === 'done' ? 'rgba(52,211,153,0.05)' : 'transparent',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ ...VAL, marginBottom: '0.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</p>
                    <p style={{ ...LABEL, fontSize: '0.6rem' }}>{fmtSize(file.size)}</p>
                    {importErrors[file.id] && (
                      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', color: 'var(--color-amber-light)', marginTop: '0.2rem' }}>{importErrors[file.id]}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleImport(file)}
                    disabled={state === 'loading' || state === 'done'}
                    style={{
                      flexShrink: 0,
                      background: state === 'done' ? 'rgba(52,211,153,0.15)' : state === 'error' ? 'rgba(192,41,58,0.15)' : 'rgba(255,255,255,0.06)',
                      border: `1px solid ${state === 'done' ? 'rgba(52,211,153,0.3)' : D}`,
                      borderRadius: '2px', padding: '0.3rem 0.75rem',
                      fontFamily: 'var(--font-ui)', fontSize: '0.58rem', fontWeight: 700,
                      letterSpacing: '0.1em', textTransform: 'uppercase',
                      color: state === 'done' ? '#34D399' : state === 'loading' ? 'rgba(245,240,234,0.35)' : 'var(--color-text-light)',
                      cursor: state === 'loading' || state === 'done' ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {state === 'loading' ? 'Importing…' : state === 'done' ? '✓ Imported' : state === 'error' ? 'Retry' : 'Import'}
                  </button>
                </div>
              )
            })}
          </div>

          {!allDone && (
            <button
              onClick={handleImportAll}
              disabled={anyLoading}
              style={{
                background: 'var(--color-amber-light)', border: 'none', borderRadius: '999px',
                padding: '0.6rem 1.25rem', cursor: anyLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-charcoal)',
                opacity: anyLoading ? 0.6 : 1,
              }}
            >
              {anyLoading ? 'Importing…' : `Import All (${files.length})`}
            </button>
          )}

          {allDone && (
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: '#34D399' }}>
              All videos imported. Gallery is ready to publish.
            </p>
          )}
        </>
      )}

      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', color: 'rgba(245,240,234,0.25)', marginTop: '1rem', lineHeight: 1.6 }}>
        {serviceAccountEmail
          ? <>Share the Drive folder with <strong style={{ color: 'rgba(245,240,234,0.45)' }}>{serviceAccountEmail}</strong> (Viewer access) before listing files.</>
          : 'Google Drive import requires GOOGLE_SERVICE_ACCOUNT_JSON with a service account client_email. Share folders with that service account; OAuth is intentionally not implemented here because it requires user secrets.'}
        {configNote && <span style={{ display: 'block', marginTop: '0.4rem' }}>{configNote}</span>}
      </p>
    </div>
  )
}
