'use client'
import { useState } from 'react'

interface AddonsStepProps {
  selectedIds: string[]
  onNext: (ids: string[]) => void
  onBack: () => void
}

const ADDONS = [
  { id: 'firecrackers', name: 'Firecrackers', price: 75, desc: 'Pyro-style sparks effect — maximum visual impact', active: true },
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
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#888880', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
        <span style={{ display: 'inline-block', width: '20px', height: '1.5px', background: 'linear-gradient(90deg,#EC4899,#8B5CF6)' }} />
        Step 3
      </p>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '0.02em', lineHeight: 0.9, color: '#0F0F0F', marginBottom: '2.5rem' }}>
        Add-ons
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(15,15,15,0.10)', maxWidth: '560px' }}>
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
                padding: '1.5rem', background: isSelected ? '#0F0F0F' : '#fff',
                border: 'none', cursor: disabled ? 'default' : 'pointer',
                textAlign: 'left', opacity: disabled ? 0.5 : 1,
                transition: 'background 0.2s',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
                  <span style={{
                    width: '18px', height: '18px', borderRadius: '2px', flexShrink: 0,
                    border: `1.5px solid ${isSelected ? 'transparent' : 'rgba(15,15,15,0.25)'}`,
                    background: isSelected ? 'linear-gradient(135deg,#EC4899,#8B5CF6)' : 'transparent',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: '0.7rem',
                  }}>
                    {isSelected ? '✓' : ''}
                  </span>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.95rem', fontWeight: 700, color: isSelected ? '#fff' : '#0F0F0F' }}>
                    {addon.name}
                  </span>
                  {'comingSoon' in addon && addon.comingSoon && (
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.55rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.2rem 0.5rem', border: '1px solid rgba(15,15,15,0.2)', color: '#888880' }}>
                      Coming Soon
                    </span>
                  )}
                </div>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: isSelected ? 'rgba(255,255,255,0.55)' : '#888880', fontWeight: 300, paddingLeft: '1.6rem' }}>
                  {addon.desc}
                </p>
              </div>
              {addon.active && (
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: isSelected ? '#fff' : '#0F0F0F', marginLeft: '2rem', flexShrink: 0 }}>
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
            background: 'linear-gradient(90deg,#EC4899,#8B5CF6)', color: '#fff', border: 'none',
            padding: '0.85rem 2rem', fontFamily: 'var(--font-ui)', fontSize: '0.7rem',
            fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
          }}
        >
          Continue →
        </button>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '0.68rem', color: '#888880', textDecoration: 'underline' }}>
          ← Back
        </button>
      </div>
    </div>
  )
}
