'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import {
  HEADLINE_LETTERS,
  HEADLINE_VIEWBOX,
} from './hero-headline-paths'

const HEADLINE_TEXT = 'Every angle of the moment'
const START_DELAY = 0.1
const PEN_SPEED = 620 // path units drawn per second — a steady, natural writing pace
const MIN_LETTER_DUR = 0.16
const LETTER_OVERLAP = 0.055 // letters begin slightly before the previous finishes, so the line flows

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

/**
 * Hero headline, hand-written. Each letter is a single pen-stroke from a cursive
 * single-line font (EMS Allure); the component draws them one at a time by
 * growing each stroke along its own path, so the line appears to be written by
 * hand in reading order. Waits for the opening intro to hand off (custom event)
 * so the writing is seen, and rewrites whenever it re-enters view. Reduced-motion
 * and no-JS get the finished line.
 */
export function HeroHeadline() {
  const rootRef = useRef<SVGSVGElement>(null)

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const paths = Array.from(root.querySelectorAll<SVGPathElement>('.dm-hw-letter'))
    if (paths.length === 0) return

    const lengths = paths.map((p) => p.getTotalLength())

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      paths.forEach((p, i) => {
        p.style.strokeDasharray = `${lengths[i]}`
        p.style.strokeDashoffset = '0'
      })
      return
    }

    const hide = () => {
      paths.forEach((p, i) => {
        p.style.strokeDasharray = `${lengths[i]}`
        p.style.strokeDashoffset = `${lengths[i]}`
      })
    }
    // Hidden before first paint so no letters flash in solid.
    hide()

    const tl = gsap.timeline({ paused: true, delay: START_DELAY })
    let at = 0
    paths.forEach((p, i) => {
      const dur = Math.max(MIN_LETTER_DUR, lengths[i] / PEN_SPEED)
      tl.to(p, { strokeDashoffset: 0, duration: dur, ease: 'none' }, at)
      at += Math.max(0.04, dur - LETTER_OVERLAP)
    })

    // The intro plays on every load and hands off with dm-intro-done; the
    // writing waits for that so it is seen. A fallback timer covers the case
    // where the intro is absent, so it can never get stuck hidden.
    let introPending = true
    let inView = false
    const play = () => {
      if (inView && !introPending) {
        hide()
        tl.restart(true)
      }
    }
    const fallback = window.setTimeout(() => onIntroDone(), 6000)
    const onIntroDone = () => {
      introPending = false
      window.clearTimeout(fallback)
      play()
    }
    window.addEventListener('dm-intro-done', onIntroDone, { once: true })

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          inView = entry.isIntersecting
          if (entry.isIntersecting) play()
          else tl.pause()
        }
      },
      { threshold: 0.4 },
    )
    io.observe(root)

    return () => {
      io.disconnect()
      tl.kill()
      window.clearTimeout(fallback)
      window.removeEventListener('dm-intro-done', onIntroDone)
    }
  }, [])

  return (
    <h1 className="dm-hero-headline" aria-label={HEADLINE_TEXT}>
      <svg
        ref={rootRef}
        className="dm-hw"
        viewBox={HEADLINE_VIEWBOX}
        role="img"
        aria-label={HEADLINE_TEXT}
        preserveAspectRatio="xMidYMid meet"
      >
        {HEADLINE_LETTERS.map((letter, i) => (
          <path
            key={i}
            className={`dm-hw-letter${letter.color === '#E8B25C' ? ' dm-hw-gold' : ''}`}
            d={letter.d}
            fill="none"
            stroke={letter.color}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
    </h1>
  )
}
