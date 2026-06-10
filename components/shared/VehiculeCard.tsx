import Link from 'next/link'
import type { Vehicule } from '@/types'

interface Props {
  vehicule: Vehicule
}

export default function VehiculeCard({ vehicule }: Props) {
  return (
    <Link href={`/location/${vehicule.id}`} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none', color: 'inherit' }}>
      {/* Photo */}
      <div style={{ height: 200, background: 'var(--surface-2)' }}>
        {vehicule.photos_urls[0] ? (
          <img
            src={vehicule.photos_urls[0]}
            alt={`${vehicule.marque} ${vehicule.modele}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div className="img-placeholder" style={{ height: '100%', borderRadius: 0 }}>
            <span style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid var(--line)', padding: '4px 10px', borderRadius: 'var(--r-pill)', fontSize: 11, letterSpacing: '0.05em', fontFamily: 'var(--font-mono)' }}>
              {vehicule.marque} {vehicule.modele}
            </span>
          </div>
        )}
      </div>

      <div className="card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--ink)' }}>
              {vehicule.marque} {vehicule.modele}
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>
              {vehicule.lieu_label}
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--primary-deep)' }}>
              {vehicule.prix_jour.toLocaleString('fr-FR')}
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>FCFA / jour</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span className="badge">{vehicule.nb_places} places</span>
          {vehicule.carburant && <span className="badge">{vehicule.carburant}</span>}
          {vehicule.boite && <span className="badge">{vehicule.boite}</span>}
          {vehicule.annee && <span className="badge">{vehicule.annee}</span>}
        </div>
      </div>
    </Link>
  )
}
