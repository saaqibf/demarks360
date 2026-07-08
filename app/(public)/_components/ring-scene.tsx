'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh,
  TorusGeometry, SphereGeometry, MeshStandardMaterial, MeshBasicMaterial,
  PointLight, AmbientLight, DirectionalLight,
} from 'three'

// The decorative hero torus ring. Loaded via next/dynamic so three.js stays out of
// the landing page's critical bundle; visuals are identical to the original inline scene.
export function RingScene() {
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const canvas = document.getElementById('dm-ring-canvas') as HTMLCanvasElement | null
    if (!canvas) return

    gsap.registerPlugin(ScrollTrigger)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    const scene = new Scene()
    const cam = new PerspectiveCamera(40, 1, 0.1, 100)
    cam.position.set(0, 0.6, 7)

    const ringGroup = new Group()
    scene.add(ringGroup)

    const ring = new Mesh(
      new TorusGeometry(2.6, 0.045, 16, 200),
      new MeshStandardMaterial({
        color: 0xc9913f,
        metalness: 0.9,
        roughness: 0.25,
        emissive: 0x3a2708,
        emissiveIntensity: 0.6,
      })
    )
    ring.rotation.x = Math.PI / 2.25
    ringGroup.add(ring)

    const ring2 = new Mesh(
      new TorusGeometry(2.95, 0.012, 12, 200),
      new MeshBasicMaterial({ color: 0xe8b25c, transparent: true, opacity: 0.35 })
    )
    ring2.rotation.x = Math.PI / 2.05
    ringGroup.add(ring2)

    const head = new Mesh(
      new SphereGeometry(0.09, 24, 24),
      new MeshBasicMaterial({ color: 0xf3ead9 })
    )
    ringGroup.add(head)
    head.add(new PointLight(0xe8b25c, 8, 6))

    scene.add(new AmbientLight(0xfff2dc, 0.25))
    const key = new DirectionalLight(0xe8b25c, 1.4)
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
    const onPointerMove = (e: PointerEvent) => {
      mx = e.clientX / innerWidth - 0.5
      my = e.clientY / innerHeight - 0.5
    }
    window.addEventListener('pointermove', onPointerMove)

    let t = 0
    const ringTicker = () => {
      if (!reduceMotion) t += 0.008
      const a = t * 2
      head.position.set(
        Math.cos(a) * 2.6,
        Math.sin(a) * 2.6 * Math.cos(Math.PI / 2.25),
        Math.sin(a) * 2.6 * Math.sin(Math.PI / 2.25)
      )
      ringGroup.rotation.y = t * 0.35 + mx * 0.5
      ringGroup.rotation.x = my * 0.25
      renderer.render(scene, cam)
    }
    gsap.ticker.add(ringTicker)

    const scaleTween = gsap.to(ringGroup.scale, {
      x: 1.6, y: 1.6, z: 1.6,
      scrollTrigger: { trigger: '#dm-experience', start: 'top bottom', end: 'top top', scrub: true },
    })
    const fadeTween = gsap.to(canvas, {
      opacity: 0,
      scrollTrigger: { trigger: '#dm-experience', start: 'top 70%', end: 'top 20%', scrub: true },
    })

    return () => {
      gsap.ticker.remove(ringTicker)
      scaleTween.scrollTrigger?.kill()
      scaleTween.kill()
      fadeTween.scrollTrigger?.kill()
      fadeTween.kill()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      renderer.dispose()
    }
  }, [])

  return null
}
