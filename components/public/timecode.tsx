'use client'
import { useEffect, useRef, useState } from 'react'

function pad(n: number) {
  return String(n).padStart(2, '0')
}

// Runs at 24fps like film; starts when the hero mounts
export function Timecode() {
  const [label, setLabel] = useState('00:00:00:00')
  const frame = useRef(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => {
      frame.current += 1
      const f = frame.current % 24
      const totalSeconds = Math.floor(frame.current / 24)
      const s = totalSeconds % 60
      const m = Math.floor(totalSeconds / 60) % 60
      const h = Math.floor(totalSeconds / 3600)
      setLabel(`${pad(h)}:${pad(m)}:${pad(s)}:${pad(f)}`)
    }, 1000 / 24)
    return () => clearInterval(id)
  }, [])

  return (
    <span
      aria-hidden
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.45rem',
        fontFamily: 'var(--font-body)',
        fontSize: '0.55rem',
        fontWeight: 500,
        letterSpacing: '0.22em',
        color: 'var(--color-amber-light)',
        opacity: 0.55,
        fontVariantNumeric: 'tabular-nums',
        userSelect: 'none',
      }}
    >
      <span
        style={{
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          background: 'var(--color-amber-light)',
          display: 'inline-block',
        }}
      />
      REC {label}
    </span>
  )
}
