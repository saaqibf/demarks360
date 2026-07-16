import type { Metadata } from 'next'
import { SiteFooter } from '@/components/public/site-footer'
import { SiteNav } from '@/components/public/site-nav'
import { ShowcasePlayer } from '@/components/public/showcase-player'
import { getPublicShowcaseItems } from '@/lib/db/queries/gallery'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'The Gallery | Demarks 360',
  description: 'Cinematic 360 video booth reels from Demarks 360 events in Calgary.',
}

export default async function GalleryIndexPage() {
  let items: Awaited<ReturnType<typeof getPublicShowcaseItems>> = []

  try {
    items = await getPublicShowcaseItems()
  } catch {
    items = []
  }

  return (
    <>
      <SiteNav />
      <main style={{
        minHeight: '100vh',
        background: 'var(--color-ink)',
        color: 'var(--color-text-light)',
        padding: '8rem 3rem 5rem',
      }}>
        <section style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            alignItems: 'end',
            justifyContent: 'space-between',
            gap: '2rem',
            flexWrap: 'wrap',
            marginBottom: '3rem',
          }}>
            <div>
              <p className="t-label" style={{ color: 'var(--color-amber)', marginBottom: '1.25rem' }}>
                Fresh reels
              </p>
              <h1 className="t-display" style={{ color: 'var(--color-sand)', maxWidth: '12ch' }}>
                The gallery
              </h1>
            </div>
            <p className="t-body-dark" style={{ color: 'var(--color-muted-light)', maxWidth: '36ch' }}>
              Recent public clips from Demarks360 events, cut for vertical screens and ready to share.
            </p>
          </div>

          {items.length > 0 ? (
            <div className="gallery-page-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '1rem',
            }}>
              {items.map((item, index) => (
                <figure key={item.id} style={{ margin: 0 }}>
                  <div style={{
                    aspectRatio: '9 / 16',
                    overflow: 'hidden',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border-dark)',
                    borderRadius: '8px',
                  }}>
                    <ShowcasePlayer playbackId={item.muxPlaybackId} title={item.title} />
                  </div>
                  <figcaption className="t-label" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    color: 'var(--color-muted-light)',
                    marginTop: '0.85rem',
                    letterSpacing: '0.18em',
                  }}>
                    <span>{item.title ?? 'Demarks reel'}</span>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <div style={{
              minHeight: '360px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--color-border-dark)',
              background: 'var(--color-surface)',
              textAlign: 'center',
              padding: '3rem 1.5rem',
            }}>
              <p className="t-subheading" style={{ color: 'var(--color-amber-light)', margin: 0 }}>
                First bookings dropping soon
              </p>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
