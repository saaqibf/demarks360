'use client'
import { useState } from 'react'

interface AddonsStepProps {
  selectedIds: string[]
  onNext: (ids: string[]) => void
  onBack: () => void
}

const ADDONS = [
  { id: 'firecrackers', name: 'Firecrackers', price: 75, desc: 'Pyro-style sparks effect, maximum visual impact', active: true },
  { id: 'smilecam', name: 'SmileCam', price: 0, desc: 'AI-powered smile detection camera', active: false, comingSoon: true },
]

export function AddonsStep({ selectedIds, onNext, onBack }: AddonsStepProps) {
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
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '1.5rem', background: isSelected ? 'var(--color-surface-2)' : 'var(--color-surface)',
                border: 'none', cursor: disabled ? 'default' : 'pointer',
                textAlign: 'left', opacity: disabled ? 0.5 : 1,
                transition: 'background 0.2s',
              }}
            >
              <div style={{ flex: 1 }}>
                {addon.id === 'firecrackers' && (
                  <div style={{
                    aspectRatio: '16 / 9',
                    width: '100%',
                    marginBottom: '1rem',
                    border: '1px solid var(--color-amber)',
                    borderRadius: '8px',
                    background: 'var(--color-ink)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}>
                    <span className="t-label" style={{
                      color: 'var(--color-amber-light)',
                      letterSpacing: '0.14em',
                    }}>
                      Preview coming soon
                    </span>
                  </div>
                )}
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
                  {'comingSoon' in addon && addon.comingSoon && (
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.55rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.2rem 0.5rem', border: '1px solid var(--color-border-dark)', color: 'var(--color-muted-light)' }}>
                      Coming Soon
                    </span>
                  )}
                </div>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--color-muted-light)', fontWeight: 300, paddingLeft: '1.6rem' }}>
                  {addon.desc}
                </p>
              </div>
              {addon.active && (
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 400, color: isSelected ? 'var(--color-amber-light)' : 'var(--color-text-light)', marginLeft: '2rem', flexShrink: 0 }}>
                  +${addon.price}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button
          onClick={() => onNext(Array.from(selected))}
          style={{
            background: 'var(--color-amber-light)', color: 'var(--color-charcoal)', border: 'none', borderRadius: '999px',
            padding: '0.85rem 2rem', fontFamily: 'var(--font-ui)', fontSize: '0.7rem',
            fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
          }}
        >
          Continue →
        </button>
        <button onClick={onBack} style={{ background: 'none', border: '1px solid var(--color-amber)', borderRadius: '999px', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-amber)', padding: '0.85rem 1.6rem', transition: 'border-color 0.2s' }}>
          ← Back
        </button>
      </div>
    </div>
  )
}
