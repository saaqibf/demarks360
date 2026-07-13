'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  bookingId: string
  currentUrl: string | null
  galleryPath: string
}

export function TouchpixConnect({ bookingId, currentUrl, galleryPath }: Props) {
  const router = useRouter()
  const [url, setUrl] = useState(currentUrl ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ count: number } | null>(null)

  const connected = !!currentUrl

  async function connect() {
    if (!url.trim()) { setError('Paste the Touchpix gallery link first.'); return }
    setSaving(true); setError(null); setResult(null)
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/touchpix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? 'Could not connect the gallery')
      setResult({ count: data.itemCount })
      router.refresh()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function disconnect() {
    setSaving(true); setError(null); setResult(null)
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/touchpix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: null }),
      })
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error ?? 'Failed') }
      setUrl('')
      router.refresh()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <p className="adm-card-label" style={{ marginBottom: '0.4rem' }}>Connect Touchpix gallery</p>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--adm-text-2)', margin: '0 0 0.9rem', lineHeight: 1.5, maxWidth: '52ch' }}>
        Paste this event&apos;s Touchpix gallery link. Every clip appears on the guest gallery automatically, no uploading. New videos from the booth show up on their own.
      </p>

      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://gallery.phtbth-upload.com/public/…"
          className="adm-input"
          style={{ flex: 1, minWidth: '240px' }}
        />
        <button onClick={connect} disabled={saving} className="btn-primary btn--sm">
          {saving ? 'Checking…' : connected ? 'Update link' : 'Connect'}
        </button>
      </div>

      {error && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--adm-danger)', marginTop: '0.6rem' }}>{error}</p>
      )}

      {connected && !error && (
        <div style={{ marginTop: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <span className="adm-pill adm-pill--confirmed">
            {result ? `${result.count} videos connected` : 'Gallery connected'}
          </span>
          <a href={galleryPath} target="_blank" rel="noopener noreferrer" className="adm-link">Open guest gallery →</a>
          <button onClick={disconnect} disabled={saving} className="btn-danger btn--sm">Disconnect</button>
        </div>
      )}
    </div>
  )
}
