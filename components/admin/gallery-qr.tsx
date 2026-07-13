import QRCode from 'qrcode'

interface Props {
  url: string
}

// Server component: renders a scannable QR the operator can display on a screen
// or print for the event table. Self-contained SVG, no external requests.
export async function GalleryQr({ url }: Props) {
  let svg: string
  try {
    svg = await QRCode.toString(url, {
      type: 'svg',
      margin: 1,
      color: { dark: '#22190D', light: '#FFFFFF' },
    })
  } catch {
    return null
  }

  const download = `data:image/svg+xml,${encodeURIComponent(svg)}`

  return (
    <div style={{ display: 'flex', gap: '1.1rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <div
        style={{
          width: 132, height: 132, flexShrink: 0,
          background: '#FFFFFF', borderRadius: 12, padding: 10,
          border: '1px solid var(--adm-border-2)', boxShadow: 'var(--adm-shadow)',
        }}
        // eslint-disable-next-line react/no-danger -- trusted, server-generated QR SVG
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <div style={{ minWidth: 0 }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--adm-text)', margin: '0 0 0.3rem', fontWeight: 500 }}>
          Show this at the event
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--adm-text-2)', margin: '0 0 0.7rem', lineHeight: 1.5, maxWidth: '32ch' }}>
          Guests scan it to watch and share their 360 videos. Every scan is a new person on the site.
        </p>
        <a href={download} download="demarks360-gallery-qr.svg" className="adm-link">
          Download QR ↓
        </a>
      </div>
    </div>
  )
}
