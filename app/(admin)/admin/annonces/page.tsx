import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import StatusBadge from '@/components/shared/StatusBadge'

interface Props {
  searchParams: Promise<{ type?: string; statut?: string }>
}

const statusFilters = [
  { value: '', label: 'Toutes' },
  { value: 'en_attente', label: 'À modérer' },
  { value: 'actif', label: 'Actives' },
  { value: 'rejeté', label: 'Rejetées' },
  { value: 'suspendu', label: 'Suspendues' },
]

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function filterHref(type: string, statut: string) {
  const params = new URLSearchParams()
  if (type) params.set('type', type)
  if (statut) params.set('statut', statut)
  const query = params.toString()
  return `/admin/annonces${query ? `?${query}` : ''}`
}

export default async function AdminAnnoncesPage({ searchParams }: Props) {
  const params = await searchParams
  const selectedType = ['trajet', 'vehicule'].includes(params.type ?? '') ? params.type! : ''
  const selectedStatus = statusFilters.some(item => item.value === params.statut) ? params.statut ?? '' : ''
  const supabase = await createClient()

  let trajetsQuery = supabase.from('trajets').select('*, users(nom)').order('created_at', { ascending: false })
  let vehiculesQuery = supabase.from('vehicules').select('*, users!vehicules_user_id_fkey(nom)').order('created_at', { ascending: false })
  if (selectedStatus) {
    trajetsQuery = trajetsQuery.eq('statut', selectedStatus)
    vehiculesQuery = vehiculesQuery.eq('statut', selectedStatus)
  }

  const [trajetsResult, vehiculesResult, pendingTrajetsResult, pendingVehiculesResult] = await Promise.all([
    selectedType === 'vehicule' ? Promise.resolve({ data: [] }) : trajetsQuery,
    selectedType === 'trajet' ? Promise.resolve({ data: [] }) : vehiculesQuery,
    supabase.from('trajets').select('*', { count: 'exact', head: true }).eq('statut', 'en_attente'),
    supabase.from('vehicules').select('*', { count: 'exact', head: true }).eq('statut', 'en_attente'),
  ])

  const trajets = trajetsResult.data ?? []
  const vehicules = vehiculesResult.data ?? []
  const total = trajets.length + vehicules.length
  const pendingCount = (pendingTrajetsResult.count ?? 0) + (pendingVehiculesResult.count ?? 0)

  return (
    <>
      <div className="page-head">
        <div>
          <span className="kicker">Modération</span>
          <h1 className="page-title">Toutes les annonces</h1>
          <p className="page-sub">{pendingCount} annonce{pendingCount > 1 ? 's' : ''} en attente de décision.</p>
        </div>
        {pendingCount > 0 ? <span className="badge badge-warn">{pendingCount} à traiter</span> : <span className="badge badge-success">File à jour</span>}
      </div>

      <div className="card card-pad" style={{ marginBottom: 24, display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }} aria-label="Filtrer par type">
          {[
            { value: '', label: 'Tous les types' },
            { value: 'trajet', label: 'Covoiturage et colis' },
            { value: 'vehicule', label: 'Locations' },
          ].map(item => (
            <Link key={item.value} href={filterHref(item.value, selectedStatus)} className={`chip${selectedType === item.value ? ' active' : ''}`}>
              {item.label}
            </Link>
          ))}
        </div>
        <div style={{ width: 1, height: 30, background: 'var(--line)' }} />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }} aria-label="Filtrer par statut">
          {statusFilters.map(item => (
            <Link key={item.value} href={filterHref(selectedType, item.value)} className={`chip${selectedStatus === item.value ? ' active' : ''}`}>
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <p style={{ fontSize: 13.5, color: 'var(--ink-3)', marginBottom: 14 }}>{total} résultat{total > 1 ? 's' : ''}</p>

      {total === 0 ? (
        <div className="card" style={{ padding: '56px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 30, marginBottom: 12 }}>✓</div>
          <h2 style={{ fontSize: 20 }}>Aucune annonce dans cette vue</h2>
          <p style={{ color: 'var(--ink-3)', marginTop: 6 }}>Modifiez les filtres pour afficher d’autres annonces.</p>
        </div>
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Annonce</th>
                <th>Catégorie</th>
                <th>Propriétaire</th>
                <th>Publication</th>
                <th>Statut</th>
                <th><span className="sr-only">Action</span></th>
              </tr>
            </thead>
            <tbody>
              {trajets.map(trajet => {
                const owner = (trajet as Record<string, unknown>).users as { nom: string } | null
                return (
                  <tr key={`trajet-${trajet.id}`}>
                    <td><div style={{ fontWeight: 600, color: 'var(--ink)' }}>{trajet.depart_label} → {trajet.arrivee_label}</div><div style={{ fontSize: 12, marginTop: 3 }}>{trajet.prix.toLocaleString('fr-FR')} FCFA</div></td>
                    <td><span className="badge">{trajet.type === 'colis' ? 'Colis' : 'Covoiturage'}</span></td>
                    <td>{owner?.nom ?? '—'}</td>
                    <td style={{ color: 'var(--ink-3)' }}>{formatDate(trajet.created_at)}</td>
                    <td><StatusBadge statut={trajet.statut} /></td>
                    <td><Link href={`/admin/annonces/trajet/${trajet.id}`} className={`btn ${trajet.statut === 'en_attente' ? 'btn-primary' : 'btn-ghost'} btn-sm`}>{trajet.statut === 'en_attente' ? 'Examiner' : 'Voir'}</Link></td>
                  </tr>
                )
              })}
              {vehicules.map(vehicule => {
                const owner = (vehicule as Record<string, unknown>).users as { nom: string } | null
                return (
                  <tr key={`vehicule-${vehicule.id}`}>
                    <td><div style={{ fontWeight: 600, color: 'var(--ink)' }}>{vehicule.marque} {vehicule.modele}</div><div style={{ fontSize: 12, marginTop: 3 }}>{vehicule.prix_jour.toLocaleString('fr-FR')} FCFA / jour</div></td>
                    <td><span className="badge">Location</span></td>
                    <td>{owner?.nom ?? '—'}</td>
                    <td style={{ color: 'var(--ink-3)' }}>{formatDate(vehicule.created_at)}</td>
                    <td><StatusBadge statut={vehicule.statut} /></td>
                    <td><Link href={`/admin/annonces/vehicule/${vehicule.id}`} className={`btn ${vehicule.statut === 'en_attente' ? 'btn-primary' : 'btn-ghost'} btn-sm`}>{vehicule.statut === 'en_attente' ? 'Examiner' : 'Voir'}</Link></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
