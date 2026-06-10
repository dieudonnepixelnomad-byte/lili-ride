import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Avatar from '@/components/shared/Avatar'
import DemandeForm from '@/components/shared/DemandeForm'
import type { Vehicule } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function LocationDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: vehicule } = await supabase
    .from('vehicules')
    .select('*, users(id, nom, telephone, whatsapp, ville, photo_url)')
    .eq('id', id)
    .single()

  if (!vehicule) notFound()
  const v = vehicule as Vehicule

  return (
    <div className="section-sm">
      <div className="container-tight">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: 'var(--ink-3)', marginBottom: 32 }}>
          <Link href="/location" style={{ color: 'var(--ink-3)' }}>Location</Link>
          <span>›</span>
          <span>{v.marque} {v.modele}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 40, alignItems: 'start' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(28px, 3.5vw, 40px)' }}>
              {v.marque} {v.modele}
              {v.annee && <span style={{ color: 'var(--ink-3)', fontWeight: 400 }}> · {v.annee}</span>}
            </h1>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
              <span className="badge">{v.nb_places} places</span>
              {v.carburant && <span className="badge">{v.carburant}</span>}
              {v.boite && <span className="badge">{v.boite}</span>}
              {v.couleur && <span className="badge">{v.couleur}</span>}
            </div>

            {/* Photo gallery */}
            <div className="gallery" style={{ marginTop: 28 }}>
              {v.photos_urls.slice(0, 5).map((url, i) => (
                <div key={i} style={{ position: 'relative', height: i === 0 ? '100%' : 220, ...(i === 0 ? { gridRow: '1/3' } : {}) }}>
                  <img src={url} alt={`${v.marque} ${v.modele}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
              {v.photos_urls.length === 0 && (
                <div className="img-placeholder" style={{ gridColumn: '1/-1', height: 300, borderRadius: 'var(--r-lg)' }}>
                  <span style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid var(--line)', padding: '4px 10px', borderRadius: 'var(--r-pill)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.05em' }}>
                    {v.marque} {v.modele}
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 24, marginTop: 28 }}>
              <div>
                <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', fontWeight: 600 }}>Localisation</div>
                <div style={{ fontSize: 15, marginTop: 4, color: 'var(--ink)' }}>{v.lieu_label}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', fontWeight: 600 }}>Prix / jour</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, marginTop: 4, color: 'var(--primary-deep)' }}>{v.prix_jour.toLocaleString('fr-FR')} FCFA</div>
              </div>
            </div>

            {v.description && (
              <div style={{ marginTop: 32 }}>
                <h3 style={{ fontSize: 18, marginBottom: 12 }}>Description</h3>
                <p style={{ lineHeight: 1.65 }}>{v.description}</p>
              </div>
            )}

            {v.users && (
              <div className="card card-pad" style={{ marginTop: 32 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16, color: 'var(--ink)' }}>Propriétaire</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <Avatar nom={v.users.nom} size="lg" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--ink)' }}>{v.users.nom}</div>
                    <div style={{ fontSize: 13.5, color: 'var(--ink-3)', marginTop: 2 }}>{v.users.ville}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ position: 'sticky', top: 90 }}>
            <DemandeForm vehiculeId={v.id} type="location" prix={v.prix_jour} prixLabel="par jour" />
          </div>
        </div>
      </div>
    </div>
  )
}
