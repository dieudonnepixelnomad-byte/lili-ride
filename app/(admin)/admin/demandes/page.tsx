import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import StatusBadge from '@/components/shared/StatusBadge'
import Pagination, { getPage } from '@/components/shared/Pagination'

interface Props {
  searchParams: Promise<{ statut?: string; type?: string; page?: string }>
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function AdminDemandesPage({ searchParams }: Props) {
  const params = await searchParams
  const currentPage = getPage(params.page)
  const pageSize = 20
  const supabase = await createClient()

  let query = supabase
    .from('demandes')
    .select('*, trajets(depart_label, arrivee_label), vehicules(marque, modele)', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (params.statut) query = query.eq('statut', params.statut)
  if (params.type) query = query.eq('type', params.type)

  const { data: demandes, count } = await query.range((currentPage - 1) * pageSize, currentPage * pageSize - 1)

  const filters = [
    { label: 'Toutes', href: '/admin/demandes' },
    { label: 'En attente', href: '/admin/demandes?statut=en_attente' },
    { label: 'Traitées', href: '/admin/demandes?statut=traitée' },
    { label: 'Annulées', href: '/admin/demandes?statut=annulée' },
  ]

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Demandes</h1>
          <p className="page-sub">{count ?? 0} demande{(count ?? 0) > 1 ? 's' : ''}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {filters.map(({ label, href }) => (
          <Link key={href} href={href} className={`chip ${(!params.statut && !href.includes('statut')) || params.statut === href.split('=')[1] ? 'active' : ''}`}>{label}</Link>
        ))}
        <div style={{ width: 1, height: 32, background: 'var(--line)', alignSelf: 'center', margin: '0 4px' }} />
        {['covoiturage', 'colis', 'location'].map(t => (
          <Link key={t} href={`/admin/demandes?type=${t}`} className={`chip ${params.type === t ? 'active' : ''}`} style={{ textTransform: 'capitalize' }}>{t}</Link>
        ))}
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Service</th>
              <th>Annonce</th>
              <th>Origine</th>
              <th>Date</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {demandes?.map(d => {
              const raw = d as Record<string, unknown>
              const trajet = raw.trajets as { depart_label?: string; arrivee_label?: string } | null
              const vehicule = raw.vehicules as { marque?: string; modele?: string } | null
              const annonce = trajet ? `${trajet.depart_label} → ${trajet.arrivee_label}` : vehicule ? `${vehicule.marque} ${vehicule.modele}` : '—'
              return (
                <tr key={d.id}>
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--ink)' }}>{d.nom_client}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 1 }}>{d.telephone}</div>
                  </td>
                  <td><span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>{d.type}</span></td>
                  <td style={{ fontSize: 13.5, maxWidth: 200 }}>{annonce}</td>
                  <td><span className="badge" style={{ textTransform: 'capitalize' }}>{d.origine}</span></td>
                  <td style={{ fontSize: 13.5, color: 'var(--ink-3)' }}>{formatDate(d.created_at)}</td>
                  <td><StatusBadge statut={d.statut} /></td>
                  <td><Link href={`/admin/demandes/${d.id}`} className="btn btn-ghost btn-sm">Voir</Link></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={currentPage} totalCount={count ?? 0} pageSize={pageSize} label="demandes" buildHref={page => {
        const search = new URLSearchParams()
        if (params.statut) search.set('statut', params.statut)
        if (params.type) search.set('type', params.type)
        search.set('page', String(page))
        return `/admin/demandes?${search.toString()}`
      }} />
    </>
  )
}
