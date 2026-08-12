interface Props {
  title: string
  prix?: number | null
  prixLabel?: string
}

const CONTACT_NUMBERS = ['+237697208124', '+237671567115'] as const

function telephoneHref(numero: string) {
  return `tel:${numero.replace(/[^\d+]/g, '')}`
}

function whatsappHref(numero: string) {
  return `https://wa.me/${numero.replace(/\D/g, '')}`
}

export default function DirectContactCard({ title, prix, prixLabel }: Props) {
  return (
    <div className="card card-pad" style={{ padding: 28 }}>
      {prix != null && (
        <div style={{ marginBottom: 22, paddingBottom: 20, borderBottom: '1px solid var(--line)' }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: 'var(--primary-deep)' }}>
            {prix.toLocaleString('fr-FR')} FCFA
          </div>
          {prixLabel && (
            <div style={{ fontSize: 12, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 3 }}>
              {prixLabel}
            </div>
          )}
        </div>
      )}

      <span className="badge badge-accent" style={{ marginBottom: 14 }}>Contact direct</span>
      <h2 style={{ fontSize: 22, lineHeight: 1.25 }}>{title}</h2>
      <p style={{ marginTop: 10, color: 'var(--ink-2)', fontSize: 14.5, lineHeight: 1.65 }}>
        Aucun compte à créer, aucun formulaire à remplir. Appelez directement notre équipe ou contactez-nous sur WhatsApp pour confirmer la disponibilité et convenir des détails.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 22 }}>
        {CONTACT_NUMBERS.map(numero => (
          <div key={numero} style={{ padding: 14, background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-md)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 10 }}>
              {numero}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <a href={telephoneHref(numero)} className="btn btn-primary btn-block" aria-label={`Appeler le ${numero}`}>
                <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.8a2 2 0 0 1-.45 2.11L8.08 9.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.33 1.84.56 2.8.69A2 2 0 0 1 22 16.92z" />
                </svg>
                Appeler
              </a>
              <a
                href={whatsappHref(numero)}
                className="btn btn-accent btn-block"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Contacter le ${numero} sur WhatsApp`}
              >
                <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z" />
                </svg>
                WhatsApp
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="notice success" style={{ marginTop: 18 }}>
        <span className="icon" aria-hidden="true">✓</span>
        <span>Ces deux numéros sont joignables par appel téléphonique classique, ainsi que par message ou appel WhatsApp.</span>
      </div>
    </div>
  )
}
