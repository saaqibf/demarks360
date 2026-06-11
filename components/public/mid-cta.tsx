export function MidCta() {
  return (
    <section style={{
      background: 'var(--color-charcoal-2)',
      borderTop: '1px solid var(--color-border-dark)',
      borderBottom: '1px solid var(--color-border-dark)',
    }}>
      <div className="mid-cta-inner" style={{
        maxWidth: '1240px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1.1fr 0.9fr',
        gap: '3rem',
        padding: '5rem 3rem',
        alignItems: 'center',
      }}>
        <div>
          <p className="t-label" style={{ color: 'var(--color-amber)', marginBottom: '1.25rem' }}>
            Ready?
          </p>
          <h2 className="t-heading" style={{ color: 'var(--color-sand)', maxWidth: '11ch' }}>
            Seen enough? <em>Pick your date.</em>
          </h2>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '1.25rem',
        }}>
          <a href="/book" className="btn-primary">
            Book now
          </a>
          <span className="t-body-dark" style={{ color: 'var(--color-muted-light)' }}>
            From $225 · Same-day gallery included
          </span>
        </div>
      </div>

      <style>{`
        @media (max-width: 760px) {
          .mid-cta-inner {
            grid-template-columns: 1fr !important;
            padding: 4rem 1.5rem !important;
          }
        }
      `}</style>
    </section>
  )
}
