import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import StatusBadge from '@/components/shared/StatusBadge'
import type { Trajet, Demande } from '@/types'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [{ data: trajets }, { data: vehicules }, { data: demandes }, { data: profile }] = await Promise.all([
    supabase.from('trajets').select('id, type, depart_label, arrivee_label, date_depart, statut').eq('user_id', user.id).order('date_depart', { ascending: false }).limit(5),
    supabase.from('vehicules').select('id, marque, modele, statut').eq('user_id', user.id).limit(5),
    supabase.from('demandes').select('id, type, statut, nom_client, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('users').select('nom, ville').eq('id', user.id).single(),
  ])

  const actifTrajets = trajets?.filter(t => t.statut === 'actif').length ?? 0
  const actifVehicules = vehicules?.filter(v => v.statut === 'actif').length ?? 0
  const demandesEnAttente = demandes?.filter(d => d.statut === 'en_attente').length ?? 0

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Bonjour, {profile?.nom?.split(' ')[0]} 👋</h1>
          <p className="page-sub">Voici un résumé de votre activité sur Lili-Ride.</p>
        </div>
        <Link href="/dashboard/publier" className="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10 7v6M7 10h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Publier une annonce
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 40 }}>
        <div className="stat">
          <div className="label">Trajets actifs</div>
          <div className="value">{actifTrajets}</div>
          <div className="delta">sur {trajets?.length ?? 0} total</div>
        </div>
        <div className="stat">
          <div className="label">Véhicules en location</div>
          <div className="value">{actifVehicules}</div>
          <div className="delta">sur {vehicules?.length ?? 0} total</div>
        </div>
        <div className={`stat ${demandesEnAttente > 0 ? 'alert' : ''}`}>
          <div className="label">Demandes en attente</div>
          <div className="value">{demandesEnAttente}</div>
          <div className="delta">sur {demandes?.length ?? 0} total</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
        {/* Annonces récentes */}
        <div className="card">
          <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>Mes annonces</div>
            <Link href="/dashboard/mes-annonces" className="btn btn-ghost btn-sm">Voir tout</Link>
          </div>
          {!trajets || trajets.length === 0 ? (
            <div style={{ padding: '40px 22px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 14 }}>
              Aucune annonce publiée
              <br />
              <Link href="/dashboard/publier" className="btn btn-primary btn-sm" style={{ marginTop: 16 }}>Publier</Link>
            </div>
          ) : (
            <table className="table">
              <tbody>
                {(trajets as Trajet[]).map(t => (
                  <tr key={t.id}>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--ink)' }}>{t.depart_label} → {t.arrivee_label}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{formatDate(t.date_depart)}</div>
                    </td>
                    <td><StatusBadge statut={t.statut} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Demandes récentes */}
        <div className="card">
          <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>Mes demandes</div>
            <Link href="/dashboard/mes-demandes" className="btn btn-ghost btn-sm">Voir tout</Link>
          </div>
          {!demandes || demandes.length === 0 ? (
            <div style={{ padding: '40px 22px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 14 }}>
              Aucune demande pour le moment
            </div>
          ) : (
            <table className="table">
              <tbody>
                {(demandes as Demande[]).map(d => (
                  <tr key={d.id}>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--ink)', textTransform: 'capitalize' }}>{d.type}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{formatDate(d.created_at)}</div>
                    </td>
                    <td><StatusBadge statut={d.statut} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}
