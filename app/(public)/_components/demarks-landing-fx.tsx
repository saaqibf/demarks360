'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

// One idle lap of the hero orbit takes ~11 seconds — visibly alive without being dizzying
const IDLE_DEG_PER_SEC = 360 / 11
// The hero orbit's resting start angle; the intro head lands here so the light never teleports
const HERO_START_ANGLE = -50

// Wrap every visible character of an element (recursing into <em> etc.) in an
// inline-block span so each letter can be animated on its own — used for the
// hero headline forming letter by letter. Returns the char spans in reading order.
function splitToChars(root: HTMLElement): HTMLElement[] {
  const chars: HTMLElement[] = []
  const walk = (node: Node) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent ?? ''
        const frag = document.createDocumentFragment()
        for (const ch of text) {
          if (ch === ' ') { frag.appendChild(document.createTextNode(' ')); continue }
          const span = document.createElement('span')
          span.textContent = ch
          span.style.display = 'inline-block'
          span.style.willChange = 'transform, opacity, filter'
          chars.push(span)
          frag.appendChild(span)
        }
        node.replaceChild(frag, child)
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child)
      }
    }
  }
  walk(root)
  return chars
}

type Phase = 'pending' | 'intro' | 'none'

export function DemarksLandingFx() {
  const ran = useRef(false)
  const [phase, setPhase] = useState<Phase>('pending')
  const [introDone, setIntroDone] = useState(false)

  const introRef = useRef<HTMLDivElement>(null)
  const introHeadRef = useRef<HTMLDivElement>(null)
  const introRingRef = useRef<HTMLDivElement>(null)
  const introMarkRef = useRef<HTMLDivElement>(null)

  // No full-screen ignition intro — the hero loads clean, with the H1 lines rising out of
  // their masks over the live orbit, the way the original first page did. (The intro
  // component below stays in the tree, gated off, so it can be re-enabled later.)
  useEffect(() => {
    setPhase('none')
  }, [])

  useEffect(() => {
    if (phase === 'pending') return
    if (ran.current) return
    ran.current = true

    gsap.registerPlugin(ScrollTrigger)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const playIntro = phase === 'intro'

    let velocity = 0

    // Reduced-motion users keep native scrolling; the Lenis glide is itself motion
    let lenis: Lenis | null = null
    let lenisRaf: ((time: number) => void) | null = null
    if (!reduceMotion) {
      lenis = new Lenis({ lerp: 0.1 })
      lenis.on('scroll', ScrollTrigger.update)
      lenisRaf = (t) => lenis?.raf(t * 1000)
      gsap.ticker.add(lenisRaf)
      gsap.ticker.lagSmoothing(0)
      lenis.on('scroll', (l: { velocity?: number }) => { velocity = l.velocity ?? 0 })
    }

    // In-page anchor smoothing that clears the fixed nav
    const anchorHandlers: Array<[Element, (e: Event) => void]> = []
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      const handler = (e: Event) => {
        const href = (a as HTMLAnchorElement).getAttribute('href')
        const target = href && href.length > 1 ? document.querySelector(href) : null
        if (target) {
          e.preventDefault()
          if (lenis) lenis.scrollTo(href!, { offset: -70 })
          else window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 70 })
        }
      }
      a.addEventListener('click', handler)
      anchorHandlers.push([a, handler])
    })

    // Remove any image whose file is missing so the designed placeholder underneath stays visible
    document.querySelectorAll<HTMLElement>('.dm-media').forEach((el) => {
      const remove = () => el.remove()
      el.addEventListener('error', remove, { once: true })
      if (el instanceof HTMLImageElement && el.complete && el.naturalWidth === 0) remove()
    })

    // Date band: the CTA carries the chosen date into the wizard as a query param
    const dateInput = document.getElementById('dm-check-date') as HTMLInputElement | null
    const dateCta = document.getElementById('dm-check-cta')
    let onDateChange: (() => void) | null = null
    if (dateInput && dateCta) {
      onDateChange = () => {
        const v = dateInput.value
        dateCta.setAttribute('href', v ? `/book?date=${v}` : '/book')
      }
      dateInput.addEventListener('change', onDateChange)
      onDateChange()
    }

    // FAQ: grid-template-rows collapse with a content fade, keeping the accordion accessible.
    // Native `open` is toggled around the animation so closed answers stay out of the flow.
    const faqCleanups: Array<() => void> = []
    document.querySelectorAll<HTMLDetailsElement>('.dm-faq').forEach((details) => {
      const summary = details.querySelector('summary')
      if (!summary) return
      if (details.open) details.classList.add('dm-faq--open')
      let closeTimer: number | undefined
      const onClick = (e: Event) => {
        e.preventDefault()
        window.clearTimeout(closeTimer)
        if (details.classList.contains('dm-faq--open')) {
          details.classList.remove('dm-faq--open')
          // Keep it in the DOM until the collapse finishes, then let native hiding take over
          closeTimer = window.setTimeout(() => { details.open = false }, 300)
        } else {
          details.open = true
          requestAnimationFrame(() => details.classList.add('dm-faq--open'))
        }
      }
      summary.addEventListener('click', onClick)
      faqCleanups.push(() => summary.removeEventListener('click', onClick))
    })

    let orbitTick: ((time: number, deltaTime: number) => void) | null = null
    let farTick: ((time: number, deltaTime: number) => void) | null = null
    let mm: gsap.MatchMedia | null = null
    let introTl: gsap.core.Timeline | null = null
    const skipEvents = ['pointerdown', 'keydown', 'wheel', 'touchstart']
    let onSkip: (() => void) | null = null

    if (reduceMotion) {
      // Everything sits at its final state; the orbit lights park mid-track
      gsap.set('#dm-orbit-rotator', { rotation: HERO_START_ANGLE })
      gsap.set('#dm-orbit-rotator-far', { rotation: 40 })
      gsap.set('#dm-finale-rotator', { rotation: -50 })
      gsap.set('.dm-em-glow', { opacity: 0.35 })
    } else {
      // ── Ignition: one GSAP timeline over the fixed veil, handing off mid-motion ──
      if (playIntro && introRef.current && introHeadRef.current && introRingRef.current && introMarkRef.current) {
        const veil = introRef.current
        const headRot = introHeadRef.current
        const ring = introRingRef.current
        const mark = introMarkRef.current

        introTl = gsap.timeline({ onComplete: () => setIntroDone(true) })
        gsap.set(veil, { opacity: 1 })
        gsap.set('.dm-intro-head', { opacity: 0 })
        gsap.set(ring, { opacity: 0, scale: 1 })
        gsap.set(mark, { yPercent: 110 })

        introTl
          // 0 → 0.12: head ignites at the ellipse start point
          .to('.dm-intro-head', { opacity: 1, duration: 0.12, ease: 'power2.out' }, 0)
          // 0.12 → 0.80: one full lap, the ring chasing it like a long exposure
          .fromTo(headRot,
            { rotation: HERO_START_ANGLE },
            { rotation: HERO_START_ANGLE + 360, duration: 0.68, ease: 'power4.inOut' }, 0.12)
          .to(ring, { opacity: 0.9, duration: 0.5, ease: 'power2.out' }, 0.16)
          // 0.65 → 1.05: wordmark rises, ring contracts and settles behind the 360
          .to(mark, { yPercent: 0, duration: 0.55, ease: 'expo.out' }, 0.65)
          .to(ring, { scale: 0.12, opacity: 0.6, duration: 0.4, ease: 'power4.inOut' }, 0.65)
          // 1.05 → 1.45: the veil releases while the hero H1 is already rising
          .to(veil, { opacity: 0, duration: 0.4, ease: 'power2.out' }, 1.05)
          .from('#dm-hero h1 .dm-line > span',
            { yPercent: 110, duration: 0.9, stagger: 0.1, ease: 'expo.out' }, 1.15)

        // The intro can never block interaction: any input snaps it to the end
        onSkip = () => { introTl?.progress(1) }
        skipEvents.forEach((ev) => window.addEventListener(ev, onSkip!, { once: true, passive: true }))
      } else {
        // Intro: the headline forms letter by letter — each character resolves from
        // a blurred, slightly-enlarged state into focus, left to right, like it is
        // being written into existence. This is the entrance the hero opens on.
        const h1 = document.querySelector<HTMLElement>('#dm-hero h1')
        if (h1) {
          // the .dm-line masks clip for the old rise; the formation needs them open
          h1.querySelectorAll<HTMLElement>('.dm-line').forEach((l) => { l.style.overflow = 'visible' })
          const chars = splitToChars(h1)
          gsap.set(h1, { autoAlpha: 1 })
          gsap.from(chars, {
            opacity: 0,
            filter: 'blur(12px)',
            scale: 0.6,
            transformOrigin: '50% 62%',
            duration: 0.6,
            ease: 'power2.out',
            stagger: 0.032,
            delay: 0.15,
          })
        }
      }

      // Signature ambient motion: an amber head laps the tilted track with a comet tail,
      // surged by scroll velocity like the real camera arm being spun
      const rotator = document.getElementById('dm-orbit-rotator')
      const emGlow = document.querySelector('.dm-hero .dm-em-glow')
      const heroSet = document.getElementById('dm-hero-set')
      const setRotation = rotator ? gsap.quickSetter(rotator, 'rotation', 'deg') : null
      const setGlow = emGlow ? gsap.quickSetter(emGlow, 'opacity') : null
      const trails = gsap.utils.toArray<HTMLElement>('.dm-orbit-trail').map((el) => ({
        set: gsap.quickSetter(el, 'rotation', 'deg'),
        lag: Number(el.dataset.dmTrail ?? 1) * 3,
      }))
      let angle = HERO_START_ANGLE
      let heroActive = true
      orbitTick = (_t, deltaMS) => {
        if (!heroActive) return
        const dt = deltaMS / 1000
        // Surge clamp: a hard flick reaches roughly 3x idle, never a blur
        angle += (IDLE_DEG_PER_SEC + Math.min(Math.abs(velocity) * 0.4, 30)) * dt
        setRotation?.(angle)
        trails.forEach((t) => t.set(angle - t.lag))
        // The em glints while the head passes behind the headline (top of the ellipse)
        const rad = (angle * Math.PI) / 180
        setGlow?.(Math.pow(Math.max(0, Math.cos(rad)), 8) * 0.85)
      }
      gsap.ticker.add(orbitTick)

      // Second glint: the venue's back light rig, counter-rotating deeper and dimmer
      const farRotator = document.getElementById('dm-orbit-rotator-far')
      const setFar = farRotator ? gsap.quickSetter(farRotator, 'rotation', 'deg') : null
      let farAngle = 40
      if (setFar) {
        farTick = (_t, deltaMS) => {
          if (!heroActive) return
          farAngle -= (IDLE_DEG_PER_SEC / 2.4) * (deltaMS / 1000)
          setFar(farAngle)
        }
        gsap.ticker.add(farTick)
      }

      ScrollTrigger.create({
        trigger: '.dm-hero', start: 'top bottom', end: 'bottom top',
        onToggle: (self) => {
          heroActive = self.isActive
          heroSet?.classList.toggle('dm-atmo-paused', !self.isActive)
        },
      })

      // Fine-pointer micro-parallax: far layer leads, mid follows, both inverse to the cursor
      mm = gsap.matchMedia()
      mm.add('(pointer: fine)', () => {
        const farX = gsap.quickTo('.dm-parallax--far', 'x', { duration: 0.9, ease: 'power3' })
        const farY = gsap.quickTo('.dm-parallax--far', 'y', { duration: 0.9, ease: 'power3' })
        const midX = gsap.quickTo('.dm-parallax--mid', 'x', { duration: 0.9, ease: 'power3' })
        const midY = gsap.quickTo('.dm-parallax--mid', 'y', { duration: 0.9, ease: 'power3' })
        const onMove = (e: PointerEvent) => {
          const cx = e.clientX / window.innerWidth - 0.5
          const cy = e.clientY / window.innerHeight - 0.5
          farX(-cx * 14); farY(-cy * 14)
          midX(-cx * 8); midY(-cy * 8)
        }
        window.addEventListener('pointermove', onMove, { passive: true })
        return () => window.removeEventListener('pointermove', onMove)
      })

      // H2 masked rises: the only per-section entrance
      gsap.utils.toArray<HTMLElement>('.dm-landing h2 .dm-line > span').forEach((el) => {
        gsap.from(el, {
          yPercent: 110, duration: 0.9, ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        })
      })

      // The "Most booked" badge rides in on its own masked rise
      gsap.utils.toArray<HTMLElement>('.dm-pack-badge').forEach((el) => {
        gsap.from(el, {
          yPercent: 140, duration: 0.6, ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        })
      })

      // Step photos: a soft one-way fade-up as they enter. No covering shutter —
      // that re-covered images on ScrollTrigger refresh and never reopened them.
      gsap.utils.toArray<HTMLElement>('.dm-step-visual').forEach((el) => {
        gsap.from(el, {
          autoAlpha: 0, y: 40, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        })
      })
      mm.add('(min-width: 641px)', () => {
        const imgs = gsap.utils.toArray<HTMLElement>('.dm-step-img')
        imgs.forEach((img) => {
          gsap.to(img, {
            yPercent: 8, ease: 'none',
            scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true },
          })
        })
      })

      // Amber rules draw: the orbit path flattened into a line
      gsap.utils.toArray<HTMLElement>('.dm-amber-rule').forEach((el) => {
        gsap.from(el, {
          scaleX: 0, duration: 1.2, ease: 'power4.inOut',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        })
      })

      // Gallery filmstrip: plain native horizontal scroll, plus click-drag on desktop
      // so mouse users can pull through the reel (touch/trackpad already work natively).
      const reelScroller = document.querySelector<HTMLElement>('.dm-reel-scroller')
      if (reelScroller) {
        let down = false, startX = 0, startScroll = 0, moved = 0
        const onDown = (e: PointerEvent) => {
          down = true; moved = 0
          startX = e.clientX; startScroll = reelScroller.scrollLeft
          reelScroller.classList.add('dm-dragging')
        }
        const onMove = (e: PointerEvent) => {
          if (!down) return
          const dx = e.clientX - startX
          moved = Math.max(moved, Math.abs(dx))
          reelScroller.scrollLeft = startScroll - dx
        }
        const onUp = () => { down = false; reelScroller.classList.remove('dm-dragging') }
        // Swallow the click that ends a real drag so it doesn't open a frame link
        const onClick = (e: MouseEvent) => { if (moved > 6) { e.preventDefault(); e.stopPropagation() } }
        reelScroller.addEventListener('pointerdown', onDown)
        window.addEventListener('pointermove', onMove, { passive: true })
        window.addEventListener('pointerup', onUp)
        reelScroller.addEventListener('click', onClick, true)
      }

      // Bokeh discs drift slowly as the hero scrolls away
      gsap.to('.dm-bokeh--a', {
        yPercent: -12, ease: 'none',
        scrollTrigger: { trigger: '.dm-hero', start: 'top top', end: 'bottom top', scrub: true },
      })
      gsap.to('.dm-bokeh--b', {
        yPercent: -20, ease: 'none',
        scrollTrigger: { trigger: '.dm-hero', start: 'top top', end: 'bottom top', scrub: true },
      })

      // Finale: scrolling through the section turns the arm through one full revolution
      const finaleRotator = document.getElementById('dm-finale-rotator')
      if (finaleRotator) {
        const finaleSet = gsap.quickSetter(finaleRotator, 'rotation', 'deg')
        ScrollTrigger.create({
          trigger: '.dm-finale', start: 'top bottom', end: 'bottom top', scrub: true,
          onUpdate: (self) => {
            const deg = self.progress * 360 - 180
            finaleSet(deg)
            const rad = (deg * Math.PI) / 180
            gsap.set('.dm-finale .dm-em-glow', { opacity: Math.pow(Math.max(0, Math.cos(rad)), 8) * 0.85 })
          },
        })
      }
    }

    return () => {
      if (orbitTick) gsap.ticker.remove(orbitTick)
      if (farTick) gsap.ticker.remove(farTick)
      if (lenisRaf) gsap.ticker.remove(lenisRaf)
      if (onSkip) skipEvents.forEach((ev) => window.removeEventListener(ev, onSkip!))
      if (dateInput && onDateChange) dateInput.removeEventListener('change', onDateChange)
      faqCleanups.forEach((fn) => fn())
      anchorHandlers.forEach(([el, fn]) => el.removeEventListener('click', fn))
      introTl?.kill()
      mm?.revert()
      lenis?.destroy()
      ScrollTrigger.getAll().forEach((st) => st.kill())
    }
  }, [phase])

  if (phase !== 'intro' || introDone) return null

  return (
    <div className="dm-intro" ref={introRef} aria-hidden="true">
      <div className="dm-intro-track">
        <div className="dm-intro-head-rotator" ref={introHeadRef}>
          <span className="dm-intro-head" />
        </div>
        <div className="dm-intro-ring" ref={introRingRef} />
      </div>
      <div className="dm-intro-mark-mask">
        <div className="dm-intro-mark" ref={introMarkRef}>Demarks<em>360</em></div>
      </div>
    </div>
  )
}
