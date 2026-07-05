'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

interface FileState {
  file: File
  status: 'idle' | 'uploading' | 'processing' | 'done' | 'error'
  progress: number
  error?: string
}

interface Props {
  bookingId: string
}

const D = 'rgba(255,255,255,0.06)'

export function DeviceUpload({ bookingId }: Props) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<FileState[]>([])
  const [running, setRunning] = useState(false)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    setFiles(selected.map(f => ({ file: f, status: 'idle', progress: 0 })))
    // Reset input so same files can be re-selected after clearing
    e.target.value = ''
  }

  function updateFile(index: number, patch: Partial<FileState>) {
    setFiles(prev => prev.map((f, i) => i === index ? { ...f, ...patch } : f))
  }

  async function uploadFile(fileState: FileState, index: number) {
    updateFile(index, { status: 'uploading', progress: 0, error: undefined })

    // 1. Get a Mux direct upload URL from our server
    let uploadId: string, uploadUrl: string
    try {
      const res = await fetch('/api/admin/drive-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_upload_url' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create upload URL')
      uploadId = data.uploadId
      uploadUrl = data.uploadUrl
    } catch (err) {
      updateFile(index, { status: 'error', error: (err as Error).message })
      return
    }

    // 2. PUT the file directly from browser to Mux (with progress tracking via XHR)
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.upload.onprogress = e => {
        if (e.lengthComputable) {
          updateFile(index, { progress: Math.round((e.loaded / e.total) * 100) })
        }
      }
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve()
        else reject(new Error(`Upload failed: ${xhr.status}`))
      }
      xhr.onerror = () => reject(new Error('Network error during upload'))
      xhr.open('PUT', uploadUrl)
      xhr.setRequestHeader('Content-Type', fileState.file.type || 'video/mp4')
      xhr.send(fileState.file)
    }).catch(err => {
      updateFile(index, { status: 'error', error: (err as Error).message })
      return Promise.reject(err)
    })

    // 3. Poll server until Mux creates the asset and we save the gallery item
    updateFile(index, { status: 'processing', progress: 100 })
    try {
      const res = await fetch('/api/admin/drive-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'finalize_upload',
          uploadId,
          bookingId,
          fileName: fileState.file.name,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Finalize failed')
      updateFile(index, { status: 'done' })
      router.refresh()
    } catch (err) {
      updateFile(index, { status: 'error', error: (err as Error).message })
    }
  }

  async function handleUploadAll() {
    setRunning(true)
    for (let i = 0; i < files.length; i++) {
      if (files[i].status === 'done') continue
      await uploadFile(files[i], i)
    }
    setRunning(false)
  }

  const allDone = files.length > 0 && files.every(f => f.status === 'done')
  const anyActive = files.some(f => f.status === 'uploading' || f.status === 'processing')

  return (
    <div>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(245,240,234,0.3)', marginBottom: '1rem' }}>
        Upload from Device
      </p>

      {/* Drop zone / file picker */}
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        multiple
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={running}
        style={{
          width: '100%', border: `1px dashed rgba(255,255,255,0.12)`, borderRadius: '2px',
          padding: '2rem 1rem', background: 'transparent', cursor: running ? 'not-allowed' : 'pointer',
          marginBottom: files.length ? '1rem' : 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
        }}
      >
        <span style={{ fontSize: '1.5rem' }}>📱</span>
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(245,240,234,0.45)' }}>
          Select videos from camera roll
        </span>
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.58rem', color: 'rgba(245,240,234,0.25)' }}>
          Tap to browse · multiple files supported
        </span>
      </button>

      {/* File list */}
      {files.length > 0 && (
        <>
          <div style={{ border: `1px solid ${D}`, borderRadius: '2px', overflow: 'hidden', marginBottom: '1rem' }}>
            {files.map((f, i) => (
              <div key={i} style={{
                padding: '0.75rem 0.9rem',
                borderBottom: i < files.length - 1 ? `1px solid ${D}` : 'none',
                background: f.status === 'done' ? 'rgba(52,211,153,0.05)' : f.status === 'error' ? 'rgba(192,41,58,0.04)' : 'transparent',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: f.status === 'uploading' ? '0.4rem' : 0 }}>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.7rem', color: 'var(--color-text-light)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                    {f.file.name}
                  </p>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', flexShrink: 0,
                    color: f.status === 'done' ? 'var(--color-success)' : f.status === 'error' ? 'var(--color-amber-light)' : f.status === 'processing' ? 'var(--color-pending)' : 'rgba(245,240,234,0.35)'
                  }}>
                    {f.status === 'done' ? '✓ Done' : f.status === 'error' ? 'Error' : f.status === 'processing' ? 'Processing…' : f.status === 'uploading' ? `${f.progress}%` : 'Ready'}
                  </span>
                </div>

                {f.status === 'uploading' && (
                  <div style={{ height: '2px', background: 'rgba(255,255,255,0.06)', borderRadius: '1px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${f.progress}%`, background: 'var(--color-amber-light)', transition: 'width 0.2s' }} />
                  </div>
                )}

                {f.error && (
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', color: 'var(--color-amber-light)', margin: '0.25rem 0 0' }}>{f.error}</p>
                )}
              </div>
            ))}
          </div>

          {!allDone && (
            <button
              onClick={handleUploadAll}
              disabled={anyActive}
              style={{
                background: 'var(--color-amber-light)', border: 'none', borderRadius: '999px',
                padding: '0.6rem 1.25rem', cursor: anyActive ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-charcoal)',
                opacity: anyActive ? 0.6 : 1,
              }}
            >
              {anyActive ? 'Uploading…' : `Upload ${files.length} Video${files.length !== 1 ? 's' : ''}`}
            </button>
          )}

          {allDone && (
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--color-success)' }}>
              All videos uploaded. Gallery is ready to publish.
            </p>
          )}
        </>
      )}
    </div>
  )
}
