'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

const RING_R = 108
const RING_C = 2 * Math.PI * RING_R

/**
 * Opening intro: a cinematic 0°→360° revolution. A golden orbit clip plays under
 * a degree counter that ticks to 360 as its ring fills, then the whole thing
 * dissolves into the hero. Plays once per session; reduced-motion and no-JS skip
 * straight to the site.
 */
export function HeroIntro() {
  const [done, setDone] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const countRef = useRef<HTMLSpanElement>(null)
  const ringRef = useRef<SVGCircleElement>(null)

  useEffect(() => {
    // Plays on every load of the landing, not once per session.
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      finish(true)
      return
    }

    document.body.style.overflow = 'hidden'
    const counter = { v: 0 }
    const tl = gsap.timeline({ delay: 0.25 })
    tl.to(counter, {
      v: 360,
      duration: 2.7,
      ease: 'power2.inOut',
      onUpdate: () => {
        if (countRef.current) countRef.current.textContent = `${Math.round(counter.v)}°`
        if (ringRef.current) ringRef.current.style.strokeDashoffset = String(RING_C * (1 - counter.v / 360))
      },
    })
    tl.to(rootRef.current, {
      opacity: 0,
      scale: 1.12,
      duration: 1,
      ease: 'power2.inOut',
      // Signal at the START of the dissolve so the hero headline begins writing
      // while the ring is still fading, making the handoff feel continuous.
      onStart: () => window.dispatchEvent(new Event('dm-intro-done')),
      onComplete: () => finish(),
    }, '+=0.3')

    return () => { tl.kill(); document.body.style.overflow = '' }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function finish(instant = false) {
    document.body.style.overflow = ''
    // When the intro is skipped outright, still release the headline (the dissolve
    // path signals on its own onStart).
    if (instant) window.dispatchEvent(new Event('dm-intro-done'))
    setDone(true)
  }

  function skip() {
    gsap.to(rootRef.current, { opacity: 0, duration: 0.4, onComplete: () => finish() })
  }

  if (done) return null

  return (
    <div ref={rootRef} className="dm-intro" role="presentation" onClick={skip}>
      <video className="dm-intro-video" autoPlay muted playsInline preload="auto" poster="/media/intro-still.jpg">
        <source src="/media/intro.mp4" type="video/mp4" />
      </video>
      <div className="dm-intro-scrim" />

      <div className="dm-intro-center">
        <svg className="dm-intro-ring" viewBox="0 0 240 240" aria-hidden="true">
          <circle cx="120" cy="120" r={RING_R} className="dm-intro-ring-track" />
          <circle
            ref={ringRef}
            cx="120" cy="120" r={RING_R}
            className="dm-intro-ring-fill"
            style={{ strokeDasharray: RING_C, strokeDashoffset: RING_C }}
          />
        </svg>
        <span ref={countRef} className="dm-intro-count">0°</span>
      </div>

      <p className="dm-intro-brand">DEMARKS <span>360</span></p>
      <button className="dm-intro-skip" onClick={(e) => { e.stopPropagation(); skip() }} aria-label="Skip intro">Skip</button>
    </div>
  )
}
