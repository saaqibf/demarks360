'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'

const HEADLINE_TEXT = 'Every angle of the moment'
const START_DELAY = 0.1

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

// Per-letter spans so the line can reveal letter by letter. Spaces are kept as
// non-breaking so the inline-block letters don't collapse the word gaps.
function splitLetters(text: string, keyPrefix: string) {
  return text.split('').map((ch, i) => (
    <span className="dm-hh-ch" key={`${keyPrefix}-${i}`}>
      {ch === ' ' ? ' ' : ch}
    </span>
  ))
}

/**
 * Hero headline in the real Bodoni Moda web font (the crisp brand display face
 * used across the site). Each letter rises and sharpens into place in reading
 * order, so the line still reads as written out letter by letter, but as clean,
 * professional type rather than a traced outline. Waits for the intro hand-off so
 * the reveal is seen, and replays on re-entering view. Reduced motion and no-JS
 * get the finished headline.
 */
export function HeroHeadline() {
  const rootRef = useRef<HTMLHeadingElement>(null)

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const chars = Array.from(root.querySelectorAll<HTMLElement>('.dm-hh-ch'))
    if (chars.length === 0) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const hide = () =>
      gsap.set(chars, { opacity: 0, yPercent: 45, filter: 'blur(5px)' })
    hide()

    const tl = gsap.timeline({ paused: true, delay: START_DELAY })
    tl.to(chars, {
      opacity: 1,
      yPercent: 0,
      filter: 'blur(0px)',
      duration: 0.52,
      ease: 'power3.out',
      stagger: 0.042,
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
      { threshold: 0.5 },
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
    <h1 ref={rootRef} className="dm-hero-headline" aria-label={HEADLINE_TEXT}>
      <span className="dm-hh-line">{splitLetters('Every angle', 'a')}</span>
      <span className="dm-hh-line">
        {splitLetters('of ', 'b')}
        <em className="dm-em">{splitLetters('the moment.', 'c')}</em>
      </span>
    </h1>
  )
}
