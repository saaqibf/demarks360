'use client'
import { useEffect, useRef, useState } from 'react'

interface CountUpProps {
  value: string
}

// Animates the leading number in a stat ("150+", "5.0★") once it scrolls into
// view; passes non-numeric values ("Same day", "YYC") through untouched.
export function CountUp({ value }: CountUpProps) {
  const match = value.match(/^(\d+(?:\.\d+)?)(.*)$/)
  const target = match ? parseFloat(match[1]) : null
  const suffix = match ? match[2] : ''
  const decimals = match && match[1].includes('.') ? match[1].split('.')[1].length : 0

  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(target === null ? value : (0).toFixed(decimals))

  useEffect(() => {
    if (target === null) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(target.toFixed(decimals))
      return
    }
    const el = ref.current
    if (!el) return
    let raf = 0
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        obs.disconnect()
        const duration = 1200
        const start = performance.now()
        const tick = (now: number) => {
          const t = Math.min((now - start) / duration, 1)
          const eased = 1 - Math.pow(1 - t, 4)
          setDisplay((target * eased).toFixed(decimals))
          if (t < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
      },
      { threshold: 0.4 },
    )
    obs.observe(el)
    return () => {
      obs.disconnect()
      cancelAnimationFrame(raf)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <span ref={ref} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {display}
      {suffix}
    </span>
  )
}
