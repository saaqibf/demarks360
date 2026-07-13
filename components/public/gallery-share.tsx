'use client'
import { useState } from 'react'

interface Props {
  url: string
  title: string
  text: string
}

export function GalleryShare({ url, title, text }: Props) {
  const [copied, setCopied] = useState(false)
  const [canNativeShare] = useState(() => typeof navigator !== 'undefined' && !!navigator.share)

  async function share() {
    if (canNativeShare) {
      try {
        await navigator.share({ title, text, url })
        return
      } catch {
        // user dismissed the sheet, or it failed; fall through to copy
      }
    }
    copy()
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      setCopied(false)
    }
  }

  const encodedUrl = encodeURIComponent(url)
  const encodedText = encodeURIComponent(text)

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.6rem' }}>
      <button onClick={share} className="btn-primary btn--sm" aria-label="Share this gallery">
        {canNativeShare ? 'Share these videos' : copied ? 'Link copied ✓' : 'Copy share link'}
      </button>

      {/* Always-available direct channels (desktop + fallback) */}
      <a
        href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="gallery-share-chip"
        aria-label="Share on WhatsApp"
      >
        WhatsApp
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="gallery-share-chip"
        aria-label="Share on Facebook"
      >
        Facebook
      </a>
      <button onClick={copy} className="gallery-share-chip" aria-label="Copy link">
        {copied ? 'Copied ✓' : 'Copy link'}
      </button>
    </div>
  )
}
