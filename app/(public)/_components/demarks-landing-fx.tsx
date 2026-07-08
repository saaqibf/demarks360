'use client'

import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

import { Timecode } from '@/components/public/timecode'

// three.js loads in its own async chunk, after the main bundle is interactive.
// The canvas is decorative, so there is nothing to show while it loads.
const RingScene = dynamic(() => import('./ring-scene').then((m) => m.RingScene), {
  ssr: false,
  loading: () => null,
})

export function DemarksLandingFx() {
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    gsap.registerPlugin(ScrollTrigger)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const lenis = new Lenis({ lerp: 0.1 })
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((t) => lenis.raf(t * 1000))
    gsap.ticker.lagSmoothing(0)

    const navEl = document.getElementById('dm-nav')
    if (navEl) {
      lenis.on('scroll', (l: { scroll?: number }) => {
        navEl.classList.toggle('dm-nav--scrolled', (l.scroll ?? window.scrollY) > 80)
      })
    }

    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const href = (a as HTMLAnchorElement).getAttribute('href')
        if (href && href.length > 1 && document.querySelector(href)) {
          e.preventDefault()
          document.body.classList.remove('dm-menu-open')
          lenis.scrollTo(href, { offset: -70 })
        }
      })
    })

    const burger = document.getElementById('dm-burger')
    if (burger) {
      burger.addEventListener('click', () => document.body.classList.toggle('dm-menu-open'))
    }

    // Footage layers: remove any media element whose file hasn't been provided yet,
    // so the designed placeholder underneath stays visible
    document.querySelectorAll<HTMLElement>('.dm-media').forEach((el) => {
      const remove = () => el.remove()
      el.addEventListener('error', remove, { once: true })
      if (el instanceof HTMLImageElement && el.complete && el.naturalWidth === 0) remove()
    })

    // Pause footage that has scrolled out of view
    const footage = document.querySelectorAll<HTMLVideoElement>('video.dm-media')
    let footageObserver: IntersectionObserver | null = null
    if (footage.length) {
      footageObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const v = entry.target as HTMLVideoElement
            if (entry.isIntersecting) v.play().catch(() => {})
            else v.pause()
          })
        },
        { threshold: 0.15 },
      )
      footage.forEach((v) => footageObserver!.observe(v))
    }

    // The WebGL torus ring lives in <RingScene /> (dynamic import) so three.js
    // stays out of this critical chunk

    // Preloader degree counter
    const degEl = document.querySelector('#dm-loader .dm-loader-deg') as HTMLElement | null
    if (degEl) {
      const count = { v: 0 }
      gsap.timeline()
        .to(count, {
          v: 360,
          duration: reduceMotion ? 0 : 1.6,
          ease: 'power2.inOut',
          onUpdate: () => { degEl.textContent = Math.round(count.v) + '°' },
        })
        .to('#dm-loader', { yPercent: -100, duration: 0.9, ease: 'power4.inOut' })
        // Bars fade in as the loader exits — never starts at scaleY:4 so nothing is ever clipped
        .to('.dm-bar-top, .dm-bar-bottom', { scaleY: 1, duration: 0.5, ease: 'power2.out' }, '<0.2')
        .from('#dm-hero h1 .dm-line span', {
          yPercent: 110, duration: 1.1, stagger: 0.12, ease: 'power4.out',
        }, '-=.5')
        .from('.dm-hero-kicker, .dm-hero-sub, .dm-hero-ctas, .dm-hero-proof, .dm-scroll-hint', {
          opacity: 0, y: 18, duration: 0.8, stagger: 0.09,
        }, '-=.7')
        .from('#dm-nav', { opacity: 0, y: -16, duration: 0.7 }, '-=.6')
    }

    // Bars fully disappear as user scrolls into experience section
    gsap.to('.dm-bar-top, .dm-bar-bottom', {
      scaleY: 0,
      scrollTrigger: { trigger: '#dm-experience', start: 'top bottom', end: 'top 40%', scrub: true },
    })

    // Section head reveals
    gsap.utils.toArray<HTMLElement>('.dm-sect-head').forEach((el) => {
      gsap.from(el, {
        opacity: 0, y: 50, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 80%' },
      })
    })

    // Step reveals + parallax
    gsap.utils.toArray<HTMLElement>('.dm-step').forEach((step) => {
      const copy = step.querySelector('.dm-step-copy')
      const visual = step.querySelector('.dm-step-visual')
      const img = step.querySelector('.dm-step-img')
      if (copy) {
        gsap.from(copy, {
          opacity: 0, y: 50, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: step, start: 'top 75%' },
        })
      }
      if (visual) {
        gsap.from(visual, {
          clipPath: 'inset(12% 12% 12% 12%)', duration: 1.2, ease: 'power3.out',
          scrollTrigger: { trigger: step, start: 'top 75%' },
        })
      }
      if (img) {
        gsap.to(img, {
          yPercent: 14, ease: 'none',
          scrollTrigger: { trigger: step, start: 'top bottom', end: 'bottom top', scrub: true },
        })
      }
    })

    gsap.from('.dm-pack', {
      opacity: 0, y: 60, stagger: 0.12, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: '.dm-packs', start: 'top 78%' },
    })
    gsap.from('.dm-check-inner > *', {
      opacity: 0, y: 40, stagger: 0.15, duration: 0.9,
      scrollTrigger: { trigger: '.dm-check-band', start: 'top 78%' },
    })

    // Gallery reel horizontal drift
    const reel = document.getElementById('dm-reel')
    if (reel) {
      gsap.to('#dm-reel', {
        x: () => -(reel.scrollWidth - innerWidth + 60),
        ease: 'none',
        scrollTrigger: { trigger: '.dm-gallery-wrap', start: 'top 70%', end: 'bottom top', scrub: 1 },
      })
    }
    gsap.from('.dm-frame', {
      opacity: 0, y: 60, stagger: 0.1, duration: 0.9,
      scrollTrigger: { trigger: '.dm-gallery-wrap', start: 'top 75%' },
    })

    gsap.from('.dm-rev-main, .dm-rev', {
      opacity: 0, y: 50, stagger: 0.12, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: '.dm-reviews', start: 'top 78%' },
    })
    gsap.from('.dm-faq', {
      opacity: 0, y: 30, stagger: 0.08, duration: 0.7, ease: 'power3.out',
      scrollTrigger: { trigger: '.dm-faq-wrap', start: 'top 80%' },
    })
    gsap.from('.dm-finale h2, .dm-finale .dm-cta-btn', {
      opacity: 0, y: 40, stagger: 0.15, duration: 1,
      scrollTrigger: { trigger: '.dm-finale', start: 'top 75%' },
    })
    gsap.from('.dm-foot-grid > *', {
      opacity: 0, y: 30, stagger: 0.08, duration: 0.8,
      scrollTrigger: { trigger: 'footer', start: 'top 88%' },
    })

    return () => {
      lenis.destroy()
      ScrollTrigger.getAll().forEach((st) => st.kill())
      footageObserver?.disconnect()
    }
  }, [])

  return (
    <>
      <RingScene />
      <div id="dm-loader" aria-hidden="true">
        <div className="dm-loader-deg">0°</div>
        <div className="dm-loader-lbl">Demarks 360 · Calgary</div>
      </div>
      <div className="dm-bar-top" aria-hidden="true" />
      <div className="dm-bar-bottom" aria-hidden="true">
        <Timecode />
      </div>
      <div className="dm-grain" aria-hidden="true" />
    </>
  )
}
