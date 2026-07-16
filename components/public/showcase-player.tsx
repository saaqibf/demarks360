'use client'
import dynamic from 'next/dynamic'
import { useState } from 'react'

// Mux's player is a heavy custom-element bundle; on the grid we render a
// lightweight thumbnail facade and only load the player when a tile is opened.
const MuxPlayer = dynamic(() => import('@mux/mux-player-react'), { ssr: false })

interface Props {
  playbackId: string
  title?: string | null
}

export function ShowcasePlayer({ playbackId, title }: Props) {
  const [active, setActive] = useState(false)

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {active ? (
        <MuxPlayer
          playbackId={playbackId}
          streamType="on-demand"
          autoPlay
          style={{ width: '100%', height: '100%' }}
          accentColor="var(--color-amber-light)"
          thumbnailTime={1}
        />
      ) : (
        <button
          type="button"
          onClick={() => setActive(true)}
          aria-label={title ? `Play ${title}` : 'Play reel'}
          style={{
            width: '100%',
            height: '100%',
            padding: 0,
            border: 'none',
            display: 'block',
            position: 'relative',
            cursor: 'pointer',
            background: 'var(--color-surface)',
          }}
        >
          <img
            src={`https://image.mux.com/${playbackId}/thumbnail.jpg?time=1`}
            alt=""
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'color-mix(in srgb, var(--color-ink) 55%, transparent)',
              border: '1px solid var(--color-amber-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingLeft: '3px',
              color: 'var(--color-amber-light)',
              fontSize: '1.1rem',
            }}
          >
            ▶
          </span>
        </button>
      )}
      {title && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '0.75rem',
          background: 'linear-gradient(transparent, color-mix(in srgb, var(--color-ink) 85%, transparent))',
          pointerEvents: 'none',
        }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--color-muted-light)', margin: 0 }}>
            {title}
          </p>
        </div>
      )}
    </div>
  )
}
