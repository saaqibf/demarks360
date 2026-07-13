'use client'
import { useEffect, useRef } from 'react'

type Props = React.VideoHTMLAttributes<HTMLVideoElement>

/**
 * A muted loop video that only plays while it is actually on screen, and pauses
 * the moment it scrolls out of view. Saves bandwidth and matches the intent that
 * a reel should not be running when nobody is looking at it.
 */
export function InviewVideo(props: Props) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          v.play().catch(() => {})
        } else {
          v.pause()
        }
      },
      { threshold: 0.35 },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [])

  // No autoPlay attribute: the observer owns playback so it never runs off-screen.
  return <video ref={ref} muted loop playsInline {...props} />
}
