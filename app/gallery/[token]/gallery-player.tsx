'use client'
import MuxPlayer from '@mux/mux-player-react'

interface Props {
  playbackId: string
  index: number
  title: string | null
}

export function GalleryPlayer({ playbackId, index, title }: Props) {
  return (
    <div style={{ background: 'var(--color-surface)', position: 'relative', aspectRatio: '9/16', overflow: 'hidden' }}>
      <MuxPlayer
        playbackId={playbackId}
        streamType="on-demand"
        style={{ width: '100%', height: '100%' }}
        accentColor="var(--color-amber-light)"
        thumbnailTime={1}
      />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '0.75rem', background: 'linear-gradient(transparent, rgba(8,8,8,0.85))',
        pointerEvents: 'none',
      }}>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(245,240,234,0.5)', margin: 0 }}>
          {title ?? `Take ${index}`}
        </p>
      </div>
    </div>
  )
}
