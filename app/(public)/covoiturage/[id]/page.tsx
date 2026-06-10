import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Avatar from '@/components/shared/Avatar'
import DemandeForm from '@/components/shared/DemandeForm'
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
    .select('*, users(id, nom, telephone, whatsapp, ville, photo_url)')
    .eq('id', id)
    .eq('type', 'covoiturage')
    .single()

  if (!trajet) notFound()

  const t = trajet as Trajet

  return (
    <div className="section-sm">
      <div className="container-tight">
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: 'var(--ink-3)', marginBottom: 32 }}>
          <Link href="/covoiturage" style={{ color: 'var(--ink-3)' }}>Covoiturage</Link>
          <span>›</span>
          <span>{t.depart_label} → {t.arrivee_label}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 40, alignItems: 'start' }}>
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
                <div style={{ fontSize: 15, marginTop: 4, color: 'var(--ink)' }}>{t.places_dispo} place{(t.places_dispo ?? 0) > 1 ? 's' : ''}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', fontWeight: 600 }}>Prix par place</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, marginTop: 4, color: 'var(--primary-deep)' }}>{t.prix.toLocaleString('fr-FR')} FCFA</div>
              </div>
            </div>

            {/* Map mock */}
            <div className="map-mock" style={{ marginTop: 32, height: 200 }}>
              <div className="map-grid" />
              <div style={{ position: 'absolute', left: '20%', top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, background: 'var(--primary)', border: '3px solid #fff', borderRadius: '50%', boxShadow: '0 2px 8px rgba(26,78,138,0.4)' }} />
              <div style={{ position: 'absolute', right: '20%', top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, background: 'var(--accent)', border: '3px solid #fff', borderRadius: '50%', boxShadow: '0 2px 8px rgba(15,138,107,0.4)' }} />
              <div style={{ position: 'absolute', left: '20%', right: '20%', top: '50%', height: 3, background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: 999, transform: 'translateY(-50%)' }} />
              <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', background: 'rgba(255,255,255,0.9)', border: '1px solid var(--line)', padding: '4px 12px', borderRadius: 'var(--r-pill)', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>
                {t.depart_label} → {t.arrivee_label}
              </div>
            </div>

            {/* Description */}
            {t.description && (
              <div style={{ marginTop: 32 }}>
                <h3 style={{ fontSize: 18, marginBottom: 12 }}>Description</h3>
                <p style={{ lineHeight: 1.65 }}>{t.description}</p>
              </div>
            )}

            {/* Conducteur */}
            {t.users && (
              <div className="card card-pad" style={{ marginTop: 32 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16, color: 'var(--ink)' }}>Conducteur</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <Avatar nom={t.users.nom} size="lg" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--ink)' }}>{t.users.nom}</div>
                    <div style={{ fontSize: 13.5, color: 'var(--ink-3)', marginTop: 2 }}>{t.users.ville}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right — Demande form */}
          <div style={{ position: 'sticky', top: 90 }}>
            <DemandeForm trajetId={t.id} type="covoiturage" prix={t.prix} />
          </div>
        </div>
      </div>
    </div>
  )
}
