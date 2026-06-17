'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import * as THREE from 'three'

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

    // WebGL torus ring
    const canvas = document.getElementById('dm-ring-canvas') as HTMLCanvasElement | null
    if (canvas) {
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
      const scene = new THREE.Scene()
      const cam = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
      cam.position.set(0, 0.6, 7)

      const ringGroup = new THREE.Group()
      scene.add(ringGroup)

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(2.6, 0.045, 16, 200),
        new THREE.MeshStandardMaterial({
          color: 0xc9913f,
          metalness: 0.9,
          roughness: 0.25,
          emissive: 0x3a2708,
          emissiveIntensity: 0.6,
        })
      )
      ring.rotation.x = Math.PI / 2.25
      ringGroup.add(ring)

      const ring2 = new THREE.Mesh(
        new THREE.TorusGeometry(2.95, 0.012, 12, 200),
        new THREE.MeshBasicMaterial({ color: 0xe8b25c, transparent: true, opacity: 0.35 })
      )
      ring2.rotation.x = Math.PI / 2.05
      ringGroup.add(ring2)

      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 24, 24),
        new THREE.MeshBasicMaterial({ color: 0xf3ead9 })
      )
      ringGroup.add(head)
      head.add(new THREE.PointLight(0xe8b25c, 8, 6))

      scene.add(new THREE.AmbientLight(0xfff2dc, 0.25))
      const key = new THREE.DirectionalLight(0xe8b25c, 1.4)
      key.position.set(4, 6, 5)
      scene.add(key)

      const resize = () => {
        const w = canvas.clientWidth
        const h = canvas.clientHeight
        renderer.setSize(w, h, false)
        cam.aspect = w / h
        cam.updateProjectionMatrix()
      }
      window.addEventListener('resize', resize)
      resize()

      let mx = 0
      let my = 0
      window.addEventListener('pointermove', (e) => {
        mx = e.clientX / innerWidth - 0.5
        my = e.clientY / innerHeight - 0.5
      })

      let t = 0
      const ringTicker = () => {
        if (!reduceMotion) t += 0.008
        const a = t * 2
        head.position.set(
          Math.cos(a) * 2.6,
          Math.sin(a) * 2.6 * Math.cos(Math.PI / 2.25),
          Math.sin(a) * 2.6 * Math.sin(Math.PI / 2.25) * 0.4
        )
        ringGroup.rotation.y = t * 0.35 + mx * 0.5
        ringGroup.rotation.x = my * 0.25
        renderer.render(scene, cam)
      }
      gsap.ticker.add(ringTicker)

      gsap.to(ringGroup.scale, {
        x: 1.6, y: 1.6, z: 1.6,
        scrollTrigger: { trigger: '#dm-experience', start: 'top bottom', end: 'top top', scrub: true },
      })
      gsap.to(canvas, {
        opacity: 0,
        scrollTrigger: { trigger: '#dm-experience', start: 'top 70%', end: 'top 20%', scrub: true },
      })
    }

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
        .from('.dm-bar-top', { scaleY: 4 }, '<')
        .from('.dm-bar-bottom', { scaleY: 4 }, '<')
        .from('#dm-hero h1 .dm-line span', {
          yPercent: 110, duration: 1.1, stagger: 0.12, ease: 'power4.out',
        }, '-=.4')
        .from('.dm-hero-kicker, .dm-hero-sub, .dm-hero-ctas, .dm-hero-proof, .dm-scroll-hint', {
          opacity: 0, y: 18, duration: 0.8, stagger: 0.09,
        }, '-=.7')
        .from('#dm-nav', { opacity: 0, y: -16, duration: 0.7 }, '-=.6')
    }

    // Letterbox collapse
    gsap.to('.dm-bar-top', {
      scaleY: 0.16,
      scrollTrigger: { trigger: '#dm-experience', start: 'top bottom', end: 'top 30%', scrub: true },
    })
    gsap.to('.dm-bar-bottom', {
      scaleY: 0.16,
      scrollTrigger: { trigger: '#dm-experience', start: 'top bottom', end: 'top 30%', scrub: true },
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
    }
  }, [])

  return (
    <>
      <div id="dm-loader" aria-hidden="true">
        <div className="dm-loader-deg">0°</div>
        <div className="dm-loader-lbl">Demarks 360 · Calgary</div>
      </div>
      <div className="dm-bar-top" aria-hidden="true" />
      <div className="dm-bar-bottom" aria-hidden="true" />
      <div className="dm-grain" aria-hidden="true" />
    </>
  )
}
