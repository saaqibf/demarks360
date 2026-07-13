'use client'
import { useState } from 'react'
import { addOnPrice } from '@/lib/pricing/config'

interface AddonsStepProps {
  selectedIds: string[]
  durationMinutes: number
  onNext: (ids: string[]) => void
  onBack: () => void
}

const ADDONS = [
  { id: 'firecrackers', name: 'Firecrackers', desc: 'Pyro-style sparks effect, maximum visual impact', active: true },
  { id: 'smilecam', name: 'SmileCam Photo Booth', desc: 'Unlimited photo sessions beside the 360 booth, with instant sharing. Priced for your full rental.', active: true },
]

export function AddonsStep({ selectedIds, durationMinutes, onNext, onBack }: AddonsStepProps) {
  const durationHours = durationMinutes / 60
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedIds))

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-amber)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
        <span style={{ display: 'inline-block', width: '20px', height: '1.5px', background: 'var(--color-amber)' }} />
        Step 3
      </p>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 400, lineHeight: 0.95, color: 'var(--color-text-light)', marginBottom: '2.5rem' }}>
        Add-ons
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--color-border-dark)', maxWidth: '560px' }}>
        {ADDONS.map((addon) => {
          const isSelected = selected.has(addon.id)
          const disabled = !addon.active
          return (
            <button
              key={addon.id}
              onClick={() => !disabled && toggle(addon.id)}
              disabled={disabled}
              className="dm-addon-toggle"
              aria-pressed={isSelected}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '1.5rem', background: isSelected ? 'var(--color-surface-2)' : 'var(--color-surface)',
                border: 'none', cursor: disabled ? 'default' : 'pointer',
                textAlign: 'left', opacity: disabled ? 0.5 : 1,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
                  <span style={{
                    width: '18px', height: '18px', borderRadius: '2px', flexShrink: 0,
                    border: `1.5px solid ${isSelected ? 'transparent' : 'var(--color-border-dark)'}`,
                    background: isSelected ? 'var(--color-amber-light)' : 'transparent',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--color-charcoal)', fontSize: '0.7rem',
                  }}>
                    {isSelected ? '✓' : ''}
                  </span>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-light)' }}>
                    {addon.name}
                  </span>
                </div>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--color-muted-light)', fontWeight: 300, paddingLeft: '1.6rem' }}>
                  {addon.desc}
                </p>
              </div>
              {addon.active && (
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 400, color: isSelected ? 'var(--color-amber-light)' : 'var(--color-text-light)', marginLeft: '2rem', flexShrink: 0 }}>
                  +${addOnPrice(addon.id, durationHours)}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button onClick={() => onNext(Array.from(selected))} className="btn-primary btn--sm">
          Continue →
        </button>
        <button onClick={onBack} className="btn-back">
          ← Back
        </button>
      </div>
    </div>
  )
}
