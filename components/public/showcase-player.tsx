'use client'
import MuxPlayer from '@mux/mux-player-react'

interface Props {
  playbackId: string
  title?: string | null
}

export function ShowcasePlayer({ playbackId, title }: Props) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <MuxPlayer
        playbackId={playbackId}
        streamType="on-demand"
        style={{ width: '100%', height: '100%' }}
        accentColor="#C0293A"
        thumbnailTime={1}
      />
      {title && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '0.75rem',
          background: 'linear-gradient(transparent, rgba(8,8,8,0.85))',
          pointerEvents: 'none',
        }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(245,240,234,0.5)', margin: 0 }}>
            {title}
          </p>
        </div>
      )}
    </div>
  )
}
