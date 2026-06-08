'use client'
import { useEffect, useRef } from 'react'

// Module-level guard — survives StrictMode's unmount/remount cycle
let _introStarted = false

export function IntroAnimation() {
  const introRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // Already played this session
    if (sessionStorage.getItem('dmIntro')) {
      if (introRef.current) introRef.current.style.display = 'none'
      return
    }

    // StrictMode guard — only start once per page load
    if (_introStarted) return
    _introStarted = true

    const intro = introRef.current
    const canvas = canvasRef.current
    if (!intro || !canvas) return

    const ctx = canvas.getContext('2d')!
    let W = 0, H = 0
    let arcProgress = 0
    let rafId: number
    let animating = true

    function resize() {
      W = canvas!.width = window.innerWidth
      H = canvas!.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    function draw() {
      if (!animating) return
      ctx.clearRect(0, 0, W, H)
      if (arcProgress > 0) {
        const cx = W / 2, cy = H / 2
        const r = Math.min(W, H) * 0.22
        ctx.beginPath()
        ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * arcProgress)
        ctx.strokeStyle = `rgba(212,133,106,${0.5 + arcProgress * 0.4})`
        ctx.lineWidth = 1.5
        ctx.stroke()
        const angle = -Math.PI / 2 + Math.PI * 2 * arcProgress
        const dx = cx + Math.cos(angle) * r
        const dy = cy + Math.sin(angle) * r
        ctx.beginPath()
        ctx.arc(dx, dy, 3, 0, Math.PI * 2)
        ctx.fillStyle = '#D4856A'
        ctx.fill()
      }
      rafId = requestAnimationFrame(draw)
    }
    draw()

    import('gsap').then(({ gsap }) => {
      // Kill any lingering tweens from a previous StrictMode run
      gsap.killTweensOf(['#dm-intro-logo', '#dm-intro-sub', '#dm-intro-left', '#dm-intro-right'])

      gsap.timeline({
        onComplete() {
          animating = false
          cancelAnimationFrame(rafId)
          sessionStorage.setItem('dmIntro', '1')
          // Use the ref directly — guaranteed current at callback time
          if (introRef.current) introRef.current.style.display = 'none'
        },
      })
        .to({ v: 0 }, {
          v: 1,
          duration: 1.4,
          ease: 'power2.inOut',
          onUpdate: function () { arcProgress = (this.targets()[0] as { v: number }).v },
        })
        .to('#dm-intro-logo', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.2')
        .to('#dm-intro-sub', { opacity: 1, duration: 0.4, ease: 'power2.out' }, '-=0.1')
        .to({}, { duration: 0.5 })
        .to('#dm-intro-left', { x: '-100%', duration: 0.85, ease: 'power3.inOut' })
        .to('#dm-intro-right', { x: '100%', duration: 0.85, ease: 'power3.inOut' }, '<')
    })

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div
      ref={introRef}
      id="dm-intro"
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      <div
        id="dm-intro-left"
        style={{
          position: 'absolute', top: 0, left: 0,
          width: '50%', height: '100%',
          background: '#0C0808',
        }}
      />
      <div
        id="dm-intro-right"
        style={{
          position: 'absolute', top: 0, right: 0,
          width: '50%', height: '100%',
          background: '#0C0808',
        }}
      />
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      />
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '0.75rem',
        pointerEvents: 'none',
      }}>
        <div
          id="dm-intro-logo"
          style={{
            fontFamily: 'var(--font-wordmark)',
            fontSize: 'clamp(2rem, 4vw, 3.5rem)',
            fontWeight: 400,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#FAF4F2',
            opacity: 0,
            transform: 'translateY(12px)',
          }}
        >
          DEMARKS<span style={{ color: '#D4856A' }}>360</span>
        </div>
        <div
          id="dm-intro-sub"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'rgba(212,133,106,0.7)',
            opacity: 0,
          }}
        >
          360° Video Experience
        </div>
      </div>
    </div>
  )
}
