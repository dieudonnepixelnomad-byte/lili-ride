import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import StatusBadge from '@/components/shared/StatusBadge'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const [
    { count: totalUsers },
    { count: totalTrajets },
    { count: totalVehicules },
    { count: demandesAttente },
    { count: verifAttente },
    { data: recentDemandes },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('trajets').select('*', { count: 'exact', head: true }).eq('statut', 'actif'),
    supabase.from('vehicules').select('*', { count: 'exact', head: true }).eq('statut', 'actif'),
    supabase.from('demandes').select('*', { count: 'exact', head: true }).eq('statut', 'en_attente'),
    supabase
      .from('profils_transporteur')
      .select('*', { count: 'exact', head: true })
      .or('statut_cni.eq.en_attente,statut_permis.eq.en_attente'),
    supabase.from('demandes').select('id, type, statut, nom_client, created_at, origine').order('created_at', { ascending: false }).limit(8),
  ])

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Tableau de bord</h1>
          <p className="page-sub">Vue d&rsquo;ensemble de la plateforme Lili-Ride.</p>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 }}>
        <div className="stat">
          <div className="label">Utilisateurs</div>
          <div className="value">{totalUsers ?? 0}</div>
        </div>
        <div className="stat">
          <div className="label">Trajets actifs</div>
          <div className="value">{totalTrajets ?? 0}</div>
        </div>
        <div className="stat">
          <div className="label">Véhicules actifs</div>
          <div className="value">{totalVehicules ?? 0}</div>
        </div>
        <div className={`stat ${(demandesAttente ?? 0) > 0 ? 'alert' : ''}`}>
          <div className="label">Demandes en attente</div>
          <div className="value">{demandesAttente ?? 0}</div>
        </div>
      </div>

      {/* Alerts */}
      {(verifAttente ?? 0) > 0 && (
        <div className="notice warn" style={{ marginBottom: 32 }}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="icon">
            <path d="M10 3L2 17h16L10 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M10 9v4M10 15v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <div>
            <strong>{verifAttente} profil{(verifAttente ?? 0) > 1 ? 's' : ''} transporteur</strong> en attente de vérification.
            {' '}<Link href="/admin/verifications" style={{ color: 'var(--warn)', textDecoration: 'underline' }}>Vérifier maintenant →</Link>
          </div>
        </div>
      )}

      {/* Recent demandes */}
      <div className="card">
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>Dernières demandes</div>
          <Link href="/admin/demandes" className="btn btn-ghost btn-sm">Voir tout</Link>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Service</th>
              <th>Origine</th>
              <th>Date</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {recentDemandes?.map(d => (
              <tr key={d.id}>
                <td style={{ fontWeight: 500, color: 'var(--ink)' }}>{d.nom_client}</td>
                <td><span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>{d.type}</span></td>
                <td><span className="badge" style={{ textTransform: 'capitalize' }}>{d.origine}</span></td>
                <td style={{ fontSize: 13.5, color: 'var(--ink-3)' }}>{formatDate(d.created_at)}</td>
                <td><StatusBadge statut={d.statut} /></td>
                <td><Link href={`/admin/demandes/${d.id}`} className="btn btn-ghost btn-sm">Voir</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
