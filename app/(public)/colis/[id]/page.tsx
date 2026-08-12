import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
// Temporairement masqués : ancien parcours avec profil et demande en ligne.
// import UserProfileTrigger from '@/components/shared/UserProfileTrigger'
// import DemandeForm from '@/components/shared/DemandeForm'
import DirectContactCard from '@/components/shared/DirectContactCard'
import TrajetMapWrapper from '@/components/shared/TrajetMapWrapper'
import type { Trajet } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function ColisDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: trajet } = await supabase
    .from('trajets')
    .select('*, poids_max_kg, poids_dispo_kg, prix_par_kg, users(id, nom, telephone, whatsapp, ville, photo_url)')
    .eq('id', id)
    .eq('type', 'colis')
    .single()

  if (!trajet) notFound()
  const t = trajet as Trajet
  // Temporairement masqué : utile lors de la réactivation des demandes avec compte.
  // const { data: { user } } = await supabase.auth.getUser()
  // const estProprietaire = user?.id === t.user_id

  return (
    <div className="section-sm">
      <div className="container-tight">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: 'var(--ink-3)', marginBottom: 32 }}>
          <Link href="/colis" style={{ color: 'var(--ink-3)' }}>Transport de colis par avion</Link>
          <span>›</span>
          <span>{t.depart_label} → {t.arrivee_label}</span>
        </div>

        <div className="detail-layout">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span className="badge badge-accent badge-dot">Actif</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)', letterSpacing: '0.08em' }}>TRANSPORT DE COLIS PAR AVION</span>
            </div>

            <h1 style={{ fontSize: 'clamp(28px, 3.5vw, 42px)' }}>
              {t.depart_label} → {t.arrivee_label}
            </h1>

            <div style={{ display: 'flex', gap: 24, marginTop: 20, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', fontWeight: 600 }}>Date</div>
                <div style={{ fontSize: 15, marginTop: 4, color: 'var(--ink)' }}>{formatDate(t.date_depart)}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', fontWeight: 600 }}>Heure</div>
                <div style={{ fontSize: 15, marginTop: 4, color: 'var(--ink)' }}>{t.heure_depart.slice(0, 5)}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', fontWeight: 600 }}>Prix</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, marginTop: 4, color: 'var(--primary-deep)' }}>
                  {t.prix_par_kg ? `${t.prix_par_kg.toLocaleString('fr-FR')} FCFA/kg` : `${t.prix.toLocaleString('fr-FR')} FCFA`}
                </div>
              </div>
              {t.poids_max_kg && (
                <div>
                  <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', fontWeight: 600 }}>Capacité</div>
                  <div style={{ fontSize: 15, marginTop: 4, color: 'var(--ink)' }}>
                    {t.poids_dispo_kg ?? t.poids_max_kg} kg disponible{t.poids_max_kg !== t.poids_dispo_kg ? ` / ${t.poids_max_kg} kg` : ''}
                  </div>
                </div>
              )}
            </div>

            {t.types_colis && t.types_colis.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', marginBottom: 10 }}>Types de colis acceptés</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {t.types_colis.map(tc => (
                    <span key={tc} className="badge badge-accent" style={{ textTransform: 'capitalize' }}>{tc}</span>
                  ))}
                </div>
              </div>
            )}

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

            {t.description && (
              <div style={{ marginTop: 32 }}>
                <h3 style={{ fontSize: 18, marginBottom: 12 }}>Description</h3>
                <p style={{ lineHeight: 1.65 }}>{t.description}</p>
              </div>
            )}

            {/* Temporairement masqué : fiche du transporteur à réactiver ultérieurement.
            {t.users && (
              <div className="card card-pad" style={{ marginTop: 32 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16, color: 'var(--ink)' }}>Transporteur</div>
                <UserProfileTrigger user={t.users} size="lg" showName />
              </div>
            )}
            */}
          </div>

          <div className="detail-form">
            {/* Temporairement masqué : ancien formulaire de demande avec compte.
            {estProprietaire ? (
              <div className="card card-pad" style={{ textAlign: 'center', padding: 32 }}>
                <p style={{ color: 'var(--ink-3)', fontSize: 14 }}>C&rsquo;est votre annonce — vous ne pouvez pas y faire de demande.</p>
              </div>
            ) : (
              <DemandeForm
                trajetId={t.id}
                type="colis"
                prix={t.prix_par_kg ?? t.prix}
                prixLabel={t.prix_par_kg ? 'par kg' : 'pour ce trajet'}
                poidsDispoKg={t.poids_dispo_kg ?? null}
                trajetStatut={t.statut}
              />
            )}
            */}
            <DirectContactCard
              title="Organisez l’envoi de votre colis"
              prix={t.prix_par_kg ?? t.prix}
              prixLabel={t.prix_par_kg ? 'par kg' : 'pour ce trajet'}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
