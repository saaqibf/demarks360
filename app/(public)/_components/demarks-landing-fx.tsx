'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

// One idle lap of the hero orbit takes 26 seconds: a real camera arm has constant angular velocity
const IDLE_DEG_PER_SEC = 360 / 26

export function DemarksLandingFx() {
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    gsap.registerPlugin(ScrollTrigger)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let velocity = 0
    const navEl = document.getElementById('dm-nav')
    const toggleNav = (scroll: number) => {
      if (navEl) navEl.classList.toggle('dm-nav--scrolled', scroll > 80)
    }

    // Reduced-motion users keep native scrolling; the Lenis glide is itself motion
    let lenis: Lenis | null = null
    let lenisRaf: ((time: number) => void) | null = null
    let onNativeScroll: (() => void) | null = null
    if (reduceMotion) {
      onNativeScroll = () => toggleNav(window.scrollY)
      window.addEventListener('scroll', onNativeScroll, { passive: true })
      toggleNav(window.scrollY)
    } else {
      lenis = new Lenis({ lerp: 0.1 })
      lenis.on('scroll', ScrollTrigger.update)
      lenisRaf = (t) => lenis?.raf(t * 1000)
      gsap.ticker.add(lenisRaf)
      gsap.ticker.lagSmoothing(0)
      lenis.on('scroll', (l: { scroll?: number; velocity?: number }) => {
        velocity = l.velocity ?? 0
        toggleNav(l.scroll ?? window.scrollY)
      })
    }

    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const href = (a as HTMLAnchorElement).getAttribute('href')
        const target = href && href.length > 1 ? document.querySelector(href) : null
        if (target) {
          e.preventDefault()
          document.body.classList.remove('dm-menu-open')
          if (lenis) lenis.scrollTo(href!, { offset: -70 })
          else window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 70 })
        }
      })
    })

    const burger = document.getElementById('dm-burger')
    if (burger) {
      burger.addEventListener('click', () => document.body.classList.toggle('dm-menu-open'))
    }

    // Remove any image whose file is missing so the designed placeholder underneath stays visible
    document.querySelectorAll<HTMLElement>('.dm-media').forEach((el) => {
      const remove = () => el.remove()
      el.addEventListener('error', remove, { once: true })
      if (el instanceof HTMLImageElement && el.complete && el.naturalWidth === 0) remove()
    })

    let orbitTick: ((time: number, deltaTime: number) => void) | null = null
    let mm: gsap.MatchMedia | null = null

    if (reduceMotion) {
      // Everything sits at its final state; the orbit lights park mid-track
      gsap.set('#dm-orbit-rotator', { rotation: -50 })
      gsap.set('#dm-finale-rotator', { rotation: -50 })
      gsap.set('.dm-em-glow', { opacity: 0.35 })
    } else {
      // Load entrance: the two H1 lines rise out of their masks. Nothing else animates on load.
      gsap.from('#dm-hero h1 .dm-line > span', {
        yPercent: 110, duration: 0.9, stagger: 0.1, ease: 'expo.out',
      })

      // Signature ambient motion: an amber light head laps the tilted track behind the
      // headline, surged by scroll velocity like the real camera arm being spun
      const rotator = document.getElementById('dm-orbit-rotator')
      const emGlow = document.querySelector('.dm-hero .dm-em-glow')
      const setRotation = rotator ? gsap.quickSetter(rotator, 'rotation', 'deg') : null
      const setGlow = emGlow ? gsap.quickSetter(emGlow, 'opacity') : null
      let angle = -50
      let heroActive = true
      orbitTick = (_t, deltaMS) => {
        if (!heroActive) return
        const dt = deltaMS / 1000
        // Surge clamp: a hard flick reaches roughly 3x the idle lap speed, never a blur
        angle += (IDLE_DEG_PER_SEC + Math.min(Math.abs(velocity) * 0.4, 30)) * dt
        setRotation?.(angle)
        // The em glints while the head passes behind the headline (near the top of the ellipse)
        const rad = (angle * Math.PI) / 180
        setGlow?.(Math.pow(Math.max(0, Math.cos(rad)), 8) * 0.85)
      }
      gsap.ticker.add(orbitTick)
      ScrollTrigger.create({
        trigger: '.dm-hero', start: 'top bottom', end: 'bottom top',
        onToggle: (self) => { heroActive = self.isActive },
      })

      // H2 masked rises: the only per-section entrance
      gsap.utils.toArray<HTMLElement>('.dm-landing h2 .dm-line > span').forEach((el) => {
        gsap.from(el, {
          yPercent: 110, duration: 0.9, ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        })
      })

      // Film-gate shutters open toward the copy side, plus a restrained image parallax
      gsap.utils.toArray<HTMLElement>('.dm-step').forEach((step, i) => {
        const shutter = step.querySelector('.dm-shutter')
        const img = step.querySelector('.dm-step-img')
        if (shutter) {
          gsap.fromTo(shutter,
            { xPercent: 0 },
            {
              xPercent: i % 2 === 1 ? 101 : -101,
              duration: 1.0, ease: 'power4.inOut', immediateRender: true,
              scrollTrigger: { trigger: step, start: 'top 75%', once: true },
            },
          )
        }
        if (img) {
          gsap.to(img, {
            yPercent: 8, ease: 'none',
            scrollTrigger: { trigger: step, start: 'top bottom', end: 'bottom top', scrub: true },
          })
        }
      })

      // Amber rules draw: the orbit path flattened into a line
      gsap.utils.toArray<HTMLElement>('.dm-amber-rule').forEach((el) => {
        gsap.from(el, {
          scaleX: 0, duration: 1.2, ease: 'power4.inOut',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        })
      })

      // Gallery filmstrip: scrubbed drift on fine pointers; the scroller stays natively
      // swipeable everywhere else (touch, reduced motion, no JS)
      mm = gsap.matchMedia()
      mm.add('(pointer: fine)', () => {
        const reel = document.getElementById('dm-reel')
        const scroller = document.querySelector<HTMLElement>('.dm-reel-scroller')
        if (!reel || !scroller) return
        scroller.style.overflowX = 'hidden'
        gsap.to(reel, {
          x: () => -Math.max(0, reel.scrollWidth - innerWidth + 60) * 0.6,
          ease: 'none',
          scrollTrigger: { trigger: '.dm-gallery-wrap', start: 'top 70%', end: 'bottom top', scrub: 1.5 },
        })
        return () => { scroller.style.overflowX = '' }
      })

      // Bokeh discs drift slowly as the hero scrolls away
      gsap.to('.dm-bokeh--a', {
        yPercent: -12, ease: 'none',
        scrollTrigger: { trigger: '.dm-hero', start: 'top top', end: 'bottom top', scrub: true },
      })
      gsap.to('.dm-bokeh--b', {
        yPercent: -20, ease: 'none',
        scrollTrigger: { trigger: '.dm-hero', start: 'top top', end: 'bottom top', scrub: true },
      })

      // Finale: scrolling through the section personally turns the arm through one full 360
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
      if (lenisRaf) gsap.ticker.remove(lenisRaf)
      if (onNativeScroll) window.removeEventListener('scroll', onNativeScroll)
      mm?.revert()
      lenis?.destroy()
      ScrollTrigger.getAll().forEach((st) => st.kill())
    }
  }, [])

  return <div className="dm-grain" aria-hidden="true" />
}
