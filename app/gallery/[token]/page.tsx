import { notFound } from 'next/navigation'
import { resolveGalleryAccess } from '@/lib/gallery-access'
import { GalleryPlayer } from './gallery-player'

interface Props {
  params: Promise<{ token: string }>
}

function fmtDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-CA', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

function fmtTime(t: string): string {
  const [h, m] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

export default async function GalleryPage({ params }: Props) {
  const { token } = await params
  const result = await resolveGalleryAccess(token)

  if (result.status === 'not-found' || result.status === 'cancelled') notFound()

  const b = result.booking
  const items = result.status === 'published' ? result.items : []
  const hasVideos = items.length > 0

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-ink)' }}>
      {/* Header */}
      <div style={{ background: 'var(--color-ink)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '1.5rem 3rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 500, color: 'var(--color-text-light)', margin: 0 }}>
              DEMARKS <span style={{ color: 'var(--color-amber)' }}>360</span>
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(245,240,234,0.35)', margin: '0 0 0.2rem' }}>
              Your Gallery
            </p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'rgba(245,240,234,0.6)', margin: 0 }}>
              {fmtDate(b.eventDate)}
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem' }}>
        {/* Event info strip */}
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-amber)', margin: '0 0 0.35rem' }}>Event</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 400, color: 'var(--color-text-light)', margin: 0 }}>{b.eventType}</p>
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(245,240,234,0.3)', margin: '0 0 0.35rem' }}>Date</p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.88rem', color: 'rgba(245,240,234,0.7)', margin: 0 }}>{fmtDate(b.eventDate)}</p>
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(245,240,234,0.3)', margin: '0 0 0.35rem' }}>Time</p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.88rem', color: 'rgba(245,240,234,0.7)', margin: 0 }}>{fmtTime(b.startTime)} → {fmtTime(b.endTime)}</p>
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(245,240,234,0.3)', margin: '0 0 0.35rem' }}>Videos</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 400, color: 'var(--color-text-light)', margin: 0 }}>{items.length}</p>
          </div>
        </div>

        {hasVideos ? (
          <>
            <div style={{ marginBottom: '2rem' }}>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(245,240,234,0.35)', margin: '0 0 0.5rem' }}>
                {items.length} video{items.length !== 1 ? 's' : ''} · tap to play · right-click to download
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 400, color: 'var(--color-text-light)', margin: 0 }}>
                Your moments
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.06)' }}>
              {items.map((item, i) => (
                <GalleryPlayer key={item.id} playbackId={item.muxPlaybackId} index={i + 1} title={item.title} />
              ))}
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
            {/* Animated icon */}
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid rgba(201,145,63,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', fontSize: '1.5rem' }}>
              🎬
            </div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-amber)', marginBottom: '0.75rem' }}>
              Coming Soon
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, color: 'var(--color-text-light)', marginBottom: '1rem' }}>
              Your videos<br />are being prepared
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'rgba(245,240,234,0.45)', fontWeight: 300, lineHeight: 1.75, maxWidth: '400px', margin: '0 auto' }}>
              We&apos;re processing your 360 recordings. You&apos;ll receive an email when everything is ready, usually the same day as your event.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
