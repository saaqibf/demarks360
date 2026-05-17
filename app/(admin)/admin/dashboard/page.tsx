export default function DashboardPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--color-ink)', padding: '3rem' }}>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--color-crimson)', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <span style={{ display: 'inline-block', width: '24px', height: '1.5px', background: 'var(--color-crimson)' }} />
        Admin
      </p>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 900, letterSpacing: '0.01em', lineHeight: 0.9, textTransform: 'uppercase', color: 'var(--color-text)' }}>
        Dashboard
      </h1>
    </main>
  )
}
