interface Props {
  title: string
  telephone?: string | null
  whatsapp?: string | null
  prix?: number | null
  prixLabel?: string
}

function telephoneHref(numero: string) {
  return `tel:${numero.replace(/[^\d+]/g, '')}`
}

function whatsappHref(numero: string) {
  return `https://wa.me/${numero.replace(/\D/g, '')}`
}

export default function DirectContactCard({ title, telephone, whatsapp, prix, prixLabel }: Props) {
  const whatsappNumero = whatsapp || telephone

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
        Aucun compte à créer, aucun formulaire à remplir. Appelez directement l&rsquo;annonceur ou contactez-le sur WhatsApp pour confirmer la disponibilité et convenir des détails.
      </p>

      {(telephone || whatsappNumero) ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 22 }}>
          {telephone && (
            <a href={telephoneHref(telephone)} className="btn btn-primary btn-lg btn-block" aria-label={`Appeler le ${telephone}`}>
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.8a2 2 0 0 1-.45 2.11L8.08 9.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.33 1.84.56 2.8.69A2 2 0 0 1 22 16.92z" />
              </svg>
              Appeler le {telephone}
            </a>
          )}
          {whatsappNumero && (
            <a
              href={whatsappHref(whatsappNumero)}
              className="btn btn-accent btn-lg btn-block"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Contacter le ${whatsappNumero} sur WhatsApp`}
            >
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z" />
              </svg>
              WhatsApp · {whatsappNumero}
            </a>
          )}
        </div>
      ) : (
        <div className="notice warn" style={{ marginTop: 22 }}>
          Les coordonnées de contact ne sont pas encore disponibles pour cette annonce.
        </div>
      )}

      <div className="notice success" style={{ marginTop: 18 }}>
        <span className="icon" aria-hidden="true">✓</span>
        <span>Ces numéros sont joignables par appel téléphonique classique, ainsi que par message ou appel WhatsApp.</span>
      </div>
    </div>
  )
}
