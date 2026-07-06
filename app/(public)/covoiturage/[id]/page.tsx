import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import UserProfileTrigger from '@/components/shared/UserProfileTrigger'
import DemandeForm from '@/components/shared/DemandeForm'
import TrajetMapWrapper from '@/components/shared/TrajetMapWrapper'
import type { Trajet } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function CovoiturageDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: trajet } = await supabase
    .from('trajets')
    .select('*, users(id, nom, telephone, whatsapp, ville, photo_url), vehicules_transporteur(id, nb_places, photo_vehicule_url, marque, modele, type_vehicule, plaque)')
    .eq('id', id)
    .eq('type', 'covoiturage')
    .single()

  if (!trajet) notFound()

  const t = trajet as Trajet
  const { data: { user } } = await supabase.auth.getUser()
  const estProprietaire = user?.id === t.user_id

  const photoVehiculeUrl = t.vehicules_transporteur?.photo_vehicule_url
    ? supabase.storage.from('photos').getPublicUrl(t.vehicules_transporteur.photo_vehicule_url).data.publicUrl
    : null

  return (
    <div className="section-sm">
      <div className="container-tight">
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: 'var(--ink-3)', marginBottom: 32 }}>
          <Link href="/covoiturage" style={{ color: 'var(--ink-3)' }}>Covoiturage</Link>
          <span>›</span>
          <span>{t.depart_label} → {t.arrivee_label}</span>
        </div>

        <div className="detail-layout">
          {/* Left */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span className="badge badge-accent badge-dot">Actif</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)', letterSpacing: '0.08em' }}>COVOITURAGE</span>
            </div>

            <h1 style={{ fontSize: 'clamp(28px, 3.5vw, 42px)' }}>
              {t.depart_label} → {t.arrivee_label}
            </h1>

            <div style={{ display: 'flex', gap: 24, marginTop: 20, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', fontWeight: 600 }}>Date de départ</div>
                <div style={{ fontSize: 15, marginTop: 4, color: 'var(--ink)' }}>{formatDate(t.date_depart)}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', fontWeight: 600 }}>Heure</div>
                <div style={{ fontSize: 15, marginTop: 4, color: 'var(--ink)' }}>{t.heure_depart.slice(0, 5)}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', fontWeight: 600 }}>Places disponibles</div>
                <div style={{ fontSize: 15, marginTop: 4, color: 'var(--ink)' }}>
                  {t.places_dispo ?? 0}
                  {t.vehicules_transporteur?.nb_places != null && ` / ${t.vehicules_transporteur.nb_places}`}
                  {' '}place{(t.places_dispo ?? 0) > 1 ? 's' : ''}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', fontWeight: 600 }}>Prix par place</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, marginTop: 4, color: 'var(--primary-deep)' }}>{t.prix.toLocaleString('fr-FR')} FCFA</div>
              </div>
              {t.vehicules_transporteur?.plaque && (
                <div>
                  <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', fontWeight: 600 }}>Immatriculation</div>
                  <div style={{ fontSize: 15, marginTop: 4, color: 'var(--ink)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>{t.vehicules_transporteur.plaque}</div>
                </div>
              )}
            </div>

            {/* Points précis */}
            {(t.lieu_embarquement || t.lieu_debarquement) && (
              <div className="pickup-grid">
                {t.lieu_embarquement && (
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 10, padding: '12px 16px' }}>
                    <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', fontWeight: 600, marginBottom: 6 }}>Lieu d'embarquement</div>
                    <div style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.4 }}>{t.lieu_embarquement}</div>
                  </div>
                )}
                {t.lieu_debarquement && (
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 10, padding: '12px 16px' }}>
                    <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', fontWeight: 600, marginBottom: 6 }}>Lieu de débarquement</div>
                    <div style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.4 }}>{t.lieu_debarquement}</div>
                  </div>
                )}
              </div>
            )}

            {/* Carte du trajet */}
            <div style={{ marginTop: 32 }}>
              <TrajetMapWrapper
                departLabel={t.depart_label}
                departLat={t.depart_lat ?? null}
                departLng={t.depart_lng ?? null}
                arriveeLabel={t.arrivee_label}
                arriveeLat={t.arrivee_lat ?? null}
                arriveeLng={t.arrivee_lng ?? null}
                height={260}
              />
            </div>

            {/* Description */}
            {t.description && (
              <div style={{ marginTop: 32 }}>
                <h3 style={{ fontSize: 18, marginBottom: 12 }}>Description</h3>
                <p style={{ lineHeight: 1.65 }}>{t.description}</p>
              </div>
            )}

            {/* Véhicule */}
            {t.vehicules_transporteur && (
              <div className="card card-pad" style={{ marginTop: 32 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16, color: 'var(--ink)' }}>Véhicule</div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  {photoVehiculeUrl && (
                    <img src={photoVehiculeUrl} alt="Photo du véhicule" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8, flexShrink: 0, border: '1px solid var(--line)' }} />
                  )}
                  <div>
                    {(t.vehicules_transporteur.marque || t.vehicules_transporteur.modele) && (
                      <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--ink)' }}>
                        {[t.vehicules_transporteur.marque, t.vehicules_transporteur.modele].filter(Boolean).join(' ')}
                      </div>
                    )}
                    {t.vehicules_transporteur.type_vehicule && (
                      <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>{t.vehicules_transporteur.type_vehicule}</div>
                    )}
                    {t.vehicules_transporteur.nb_places != null && (
                      <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>{t.vehicules_transporteur.nb_places} places au total</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Conducteur */}
            {t.users && (
              <div className="card card-pad" style={{ marginTop: 32 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16, color: 'var(--ink)' }}>Conducteur</div>
                <UserProfileTrigger user={t.users} size="lg" showName />
              </div>
            )}
          </div>

          {/* Right — Demande form */}
          <div className="detail-form">
            {estProprietaire ? (
              <div className="card card-pad" style={{ textAlign: 'center', padding: 32 }}>
                <p style={{ color: 'var(--ink-3)', fontSize: 14 }}>C&rsquo;est votre annonce — vous ne pouvez pas y faire de demande.</p>
              </div>
            ) : (
              <DemandeForm
                trajetId={t.id}
                type="covoiturage"
                prix={t.prix}
                placesDisponibles={t.places_dispo ?? null}
                trajetStatut={t.statut}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
