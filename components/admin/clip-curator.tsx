'use client'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star, EyeOff } from 'lucide-react'

export interface CuratorClip {
  videoUrl: string
  thumbnailUrl: string
  capturedAt: string | null
}

interface Props {
  bookingId: string
  clips: CuratorClip[]
  initialHidden: string[]
  initialFeatured: string[]
}

function fmtClock(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' })
}

export function ClipCurator({ bookingId, clips, initialHidden, initialFeatured }: Props) {
  const router = useRouter()
  const [hidden, setHidden] = useState<Set<string>>(() => new Set(initialHidden))
  const [featured, setFeatured] = useState<Set<string>>(() => new Set(initialFeatured))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)

  function toggle(set: Set<string>, url: string): Set<string> {
    const next = new Set(set)
    if (next.has(url)) next.delete(url); else next.add(url)
    return next
  }

  function onFeature(url: string) {
    setDirty(true); setSaved(false)
    setFeatured(prev => toggle(prev, url))
    setHidden(prev => { const n = new Set(prev); n.delete(url); return n }) // can't be both
  }
  function onHide(url: string) {
    setDirty(true); setSaved(false)
    setHidden(prev => toggle(prev, url))
    setFeatured(prev => { const n = new Set(prev); n.delete(url); return n })
  }

  async function save() {
    setSaving(true); setError(null)
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/curation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hidden: [...hidden], featured: [...featured] }),
      })
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error ?? 'Failed to save') }
      setSaved(true); setDirty(false)
      router.refresh()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const counts = useMemo(() => ({ featured: featured.size, hidden: hidden.size, shown: clips.length - hidden.size }), [featured, hidden, clips.length])

  return (
    <div>
      <p className="adm-card-label" style={{ marginBottom: '0.4rem' }}>Choose which clips guests see</p>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--adm-text-2)', margin: '0 0 1rem', lineHeight: 1.5, maxWidth: '58ch' }}>
        Tap the star to feature a clip on the guest gallery, or the eye to hide one you cannot show (guests with kids, blurry takes). Hidden clips never appear anywhere public.
      </p>

      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem' }}>
        <span className="adm-pill adm-pill--confirmed">{counts.featured} featured</span>
        <span className="adm-pill adm-pill--completed">{counts.shown} shown</span>
        {counts.hidden > 0 && <span className="adm-pill adm-pill--declined">{counts.hidden} hidden</span>}
        <span style={{ flex: 1 }} />
        <button onClick={save} disabled={saving || !dirty} className="btn-primary btn--sm">
          {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save selection'}
        </button>
      </div>
      {error && <p style={{ color: 'var(--adm-danger)', fontSize: '0.78rem', marginBottom: '0.75rem' }}>{error}</p>}

      <div className="clip-curator-grid">
        {clips.map(clip => {
          const isHidden = hidden.has(clip.videoUrl)
          const isFeatured = featured.has(clip.videoUrl)
          return (
            <div key={clip.videoUrl} className={`clip-curator-tile${isFeatured ? ' is-featured' : ''}${isHidden ? ' is-hidden' : ''}`}>
              <img src={clip.thumbnailUrl} alt="" loading="lazy" decoding="async" />
              {clip.capturedAt && <span className="clip-curator-time">{fmtClock(clip.capturedAt)}</span>}
              <div className="clip-curator-actions">
                <button
                  type="button"
                  onClick={() => onFeature(clip.videoUrl)}
                  className={`clip-curator-btn${isFeatured ? ' on' : ''}`}
                  aria-pressed={isFeatured}
                  aria-label={isFeatured ? 'Unfeature clip' : 'Feature clip'}
                  title="Feature"
                >
                  <Star size={15} fill={isFeatured ? 'currentColor' : 'none'} />
                </button>
                <button
                  type="button"
                  onClick={() => onHide(clip.videoUrl)}
                  className={`clip-curator-btn danger${isHidden ? ' on' : ''}`}
                  aria-pressed={isHidden}
                  aria-label={isHidden ? 'Unhide clip' : 'Hide clip'}
                  title="Hide"
                >
                  <EyeOff size={15} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
