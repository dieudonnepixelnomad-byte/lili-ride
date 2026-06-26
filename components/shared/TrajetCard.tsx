import Link from 'next/link'
import type { Trajet } from '@/types'
import Avatar from './Avatar'

interface Props {
  trajet: Trajet
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' })
}

export default function TrajetCard({ trajet }: Props) {
  const href = `/${trajet.type}/${trajet.id}`

  return (
    <Link href={href} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: 0, textDecoration: 'none', color: 'inherit' }}>
      <div className="card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Route */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--ink)' }}>
              {trajet.depart_label} → {trajet.arrivee_label}
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>
              {formatDate(trajet.date_depart)} · {trajet.heure_depart.slice(0, 5)}
              {trajet.type === 'covoiturage' && trajet.places_dispo !== undefined &&
                ` · ${trajet.places_dispo} place${trajet.places_dispo > 1 ? 's' : ''} disponible${trajet.places_dispo > 1 ? 's' : ''}`
              }
            </div>
            {(trajet.lieu_ramassage || trajet.lieu_depot) && (
              <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                {trajet.lieu_ramassage && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 5 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-3)', whiteSpace: 'nowrap', paddingTop: 1 }}>Ramassage :</span>
                    <span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>{trajet.lieu_ramassage}</span>
                  </div>
                )}
                {trajet.lieu_depot && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 5 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-3)', whiteSpace: 'nowrap', paddingTop: 1 }}>Dépose :</span>
                    <span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>{trajet.lieu_depot}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--primary-deep)' }}>
              {trajet.prix.toLocaleString('fr-FR')}
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              FCFA{trajet.type === 'covoiturage' ? ' / place' : ''}
            </div>
          </div>
        </div>

        {/* Types colis tags */}
        {trajet.type === 'colis' && trajet.types_colis && trajet.types_colis.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {trajet.types_colis.map(t => (
              <span key={t} className="badge badge-accent">{t}</span>
            ))}
          </div>
        )}

        {/* Conducteur */}
        {trajet.users && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderTop: '1px solid var(--line)', paddingTop: 14 }}>
            <Avatar nom={trajet.users.nom} photo_url={trajet.users.photo_url} size="sm" />
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--ink)' }}>{trajet.users.nom}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{trajet.users.ville}</div>
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}
