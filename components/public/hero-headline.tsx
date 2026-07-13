'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { HEADLINE_LETTERS, HEADLINE_VIEWBOX } from './hero-headline-paths'

const HEADLINE_TEXT = 'Every angle of the moment'
const START_DELAY = 0.1
const PEN_SPEED = 300 // spine units revealed per second — a steady writing pace
const MIN_LETTER_DUR = 0.28
const LETTER_GAP = 0.62 // fraction of a letter's write before the next begins

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

/**
 * Hero headline in the real brand font (Bodoni Moda), revealed as if written by
 * hand. Each letter's true outline is used as a clip; a thick "pen" stroke sweeps
 * down the letter's centreline spine, so the genuine Bodoni ink appears in the
 * natural writing direction, letter by letter. As each write finishes the crisp
 * full glyph resolves (so serifs and thin tips are perfect). Waits for the intro
 * hand-off so the writing is seen, and rewrites on re-entering view. Reduced
 * motion and no-JS get the finished headline.
 */
export function HeroHeadline() {
  const rootRef = useRef<SVGSVGElement>(null)

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const pens = Array.from(root.querySelectorAll<SVGPathElement>('.dm-hw-pen'))
    const fills = Array.from(root.querySelectorAll<SVGPathElement>('.dm-hw-fill'))
    if (pens.length === 0) return

    const lengths = pens.map((p) => p.getTotalLength() || 1)

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      fills.forEach((f) => (f.style.opacity = '1'))
      pens.forEach((p) => (p.style.opacity = '0'))
      return
    }

    const hide = () => {
      pens.forEach((p, i) => {
        p.style.strokeDasharray = `${lengths[i]}`
        p.style.strokeDashoffset = `${lengths[i]}`
        p.style.opacity = '1'
      })
      fills.forEach((f) => (f.style.opacity = '0'))
    }
    hide()

    const tl = gsap.timeline({ paused: true, delay: START_DELAY })
    let at = 0
    pens.forEach((pen, i) => {
      const dur = Math.max(MIN_LETTER_DUR, lengths[i] / PEN_SPEED)
      tl.to(pen, { strokeDashoffset: 0, duration: dur, ease: 'none' }, at)
      // The crisp full glyph resolves as the pen nears the end of the letter.
      tl.to(fills[i], { opacity: 1, duration: dur * 0.32, ease: 'power1.out' }, at + dur * 0.72)
      at += dur * LETTER_GAP
    })

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
        <defs>
          {HEADLINE_LETTERS.map((letter, i) => (
            <clipPath key={i} id={`dm-hw-clip-${i}`}>
              <path d={letter.fill} />
            </clipPath>
          ))}
        </defs>
        {HEADLINE_LETTERS.map((letter, i) => (
          <g key={i} clipPath={`url(#dm-hw-clip-${i})`}>
            <path
              className="dm-hw-pen"
              d={letter.spine}
              fill="none"
              stroke={letter.color}
              strokeWidth={22}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        ))}
        {HEADLINE_LETTERS.map((letter, i) => (
          <path
            key={i}
            className={`dm-hw-fill${letter.color === '#E8B25C' ? ' dm-hw-gold' : ''}`}
            d={letter.fill}
            fill={letter.color}
          />
        ))}
      </svg>
    </h1>
  )
}
