import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import StatusBadge from '@/components/shared/StatusBadge'
import Avatar from '@/components/shared/Avatar'
import Pagination, { getPage } from '@/components/shared/Pagination'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function AdminVerificationsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams
  const currentPage = getPage(params.page)
  const pageSize = 10
  const supabase = await createClient()

  const [
    { data: profils, error: profilsError },
    { data: vehiculesTransporteur, error: vtError },
    { data: vehiculesLocation, error: vlError },
  ] = await Promise.all([
    supabase
      .from('profils_transporteur')
      .select('*, users!profils_transporteur_user_id_fkey(nom, telephone, ville, photo_url)')
      .order('created_at', { ascending: false }),
    supabase
      .from('vehicules_transporteur')
      .select('*, users!vehicules_transporteur_user_id_fkey(nom, telephone, ville, photo_url)')
      .order('created_at', { ascending: false }),
    supabase
      .from('vehicules')
      .select('*, users!vehicules_user_id_fkey(nom, telephone, ville, photo_url)')
      .order('created_at', { ascending: false }),
  ])

  if (profilsError) console.error('[admin/verifications] profils error:', profilsError)
  if (vtError) console.error('[admin/verifications] vehicules_transporteur error:', vtError)
  if (vlError) console.error('[admin/verifications] vehicules error:', vlError)

  const cniEnAttenteItems = profils?.filter(p => p.statut_cni === 'en_attente') ?? []
  const permisEnAttenteItems = profils?.filter(p => p.statut_permis === 'en_attente') ?? []
  const vtEnAttenteItems = vehiculesTransporteur?.filter(v => v.statut_verification === 'en_attente') ?? []
  const vlEnAttenteItems = vehiculesLocation?.filter(v => v.statut_carte_grise === 'en_attente') ?? []

  const cniAutresItems = profils?.filter(p => p.statut_cni !== 'non_soumis' && p.statut_cni !== 'en_attente') ?? []
  const permisAutresItems = profils?.filter(p => p.statut_permis !== 'non_soumis' && p.statut_permis !== 'en_attente') ?? []
  const vtAutresItems = vehiculesTransporteur?.filter(v => v.statut_verification !== 'non_soumis' && v.statut_verification !== 'en_attente') ?? []
  const vlAutresItems = vehiculesLocation?.filter(v => v.statut_carte_grise !== 'non_soumis' && v.statut_carte_grise !== 'en_attente') ?? []

  const pageStart = (currentPage - 1) * pageSize
  const pageEnd = pageStart + pageSize
  const cniEnAttente = cniEnAttenteItems.slice(pageStart, pageEnd)
  const permisEnAttente = permisEnAttenteItems.slice(pageStart, pageEnd)
  const vtEnAttente = vtEnAttenteItems.slice(pageStart, pageEnd)
  const vlEnAttente = vlEnAttenteItems.slice(pageStart, pageEnd)
  const cniAutres = cniAutresItems.slice(pageStart, pageEnd)
  const permisAutres = permisAutresItems.slice(pageStart, pageEnd)
  const vtAutres = vtAutresItems.slice(pageStart, pageEnd)
  const vlAutres = vlAutresItems.slice(pageStart, pageEnd)

  const totalEnAttente = cniEnAttenteItems.length + permisEnAttenteItems.length + vtEnAttenteItems.length + vlEnAttenteItems.length
  const totalHistorique = cniAutresItems.length + permisAutresItems.length + vtAutresItems.length + vlAutresItems.length
  const pendingPages = Math.max(...[cniEnAttenteItems, permisEnAttenteItems, vtEnAttenteItems, vlEnAttenteItems].map(items => Math.ceil(items.length / pageSize)))
  const historyPages = Math.max(...[cniAutresItems, permisAutresItems, vtAutresItems, vlAutresItems].map(items => Math.ceil(items.length / pageSize)))

  type UserInfo = { nom: string; telephone: string; ville: string; photo_url?: string } | null

  function conducteurRow(item: Record<string, unknown>, href: string, label: string) {
    const u = item.users as UserInfo
    return (
      <tr key={item.id as string}>
        <td>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {u && <Avatar nom={u.nom} size="sm" />}
            <div>
              <div style={{ fontWeight: 500, color: 'var(--ink)' }}>{u?.nom ?? '—'}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{u?.telephone}</div>
            </div>
          </div>
        </td>
        <td style={{ fontSize: 13.5 }}>{u?.ville ?? '—'}</td>
        <td style={{ fontSize: 13.5, color: 'var(--ink-3)' }}>{formatDate(item.created_at as string)}</td>
        <td><StatusBadge statut={label} /></td>
        <td><Link href={href} className="btn btn-primary btn-sm">Vérifier</Link></td>
      </tr>
    )
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Vérifications transporteurs</h1>
          <p className="page-sub">{totalEnAttente} dossier{totalEnAttente > 1 ? 's' : ''} en attente</p>
        </div>
      </div>

      {/* CNI en attente */}
      {cniEnAttente.length > 0 && (
        <>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)', marginBottom: 12 }}>
            CNI en attente ({cniEnAttente.length})
          </div>
          <div className="card" style={{ marginBottom: 32 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Conducteur</th>
                  <th>Ville</th>
                  <th>Soumis le</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cniEnAttente.map(p => conducteurRow(p as Record<string, unknown>, `/admin/verifications/${p.id}`, p.statut_cni))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Permis en attente */}
      {permisEnAttente.length > 0 && (
        <>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)', marginBottom: 12 }}>
            Permis en attente ({permisEnAttente.length})
          </div>
          <div className="card" style={{ marginBottom: 32 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Conducteur</th>
                  <th>Ville</th>
                  <th>Soumis le</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {permisEnAttente.map(p => conducteurRow(p as Record<string, unknown>, `/admin/verifications/${p.id}`, p.statut_permis))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Véhicules covoiturage/colis en attente */}
      {vtEnAttente.length > 0 && (
        <>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)', marginBottom: 12 }}>
            Véhicules covoiturage/colis en attente ({vtEnAttente.length})
          </div>
          <div className="card" style={{ marginBottom: 32 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Conducteur</th>
                  <th>Véhicule</th>
                  <th>Soumis le</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {vtEnAttente.map(v => {
                  const u = (v as Record<string, unknown>).users as UserInfo
                  return (
                    <tr key={v.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {u && <Avatar nom={u.nom} size="sm" />}
                          <div>
                            <div style={{ fontWeight: 500, color: 'var(--ink)' }}>{u?.nom ?? '—'}</div>
                            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{u?.telephone}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: 13.5 }}>
                        {v.marque ? `${v.marque} ${v.modele ?? ''} (${v.type_vehicule ?? '—'})` : '—'}
                      </td>
                      <td style={{ fontSize: 13.5, color: 'var(--ink-3)' }}>{formatDate(v.created_at)}</td>
                      <td><StatusBadge statut={v.statut_verification} /></td>
                      <td><Link href={`/admin/verifications/vehicule/${v.id}`} className="btn btn-primary btn-sm">Vérifier</Link></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Véhicules location en attente */}
      {vlEnAttente.length > 0 && (
        <>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)', marginBottom: 12 }}>
            Véhicules location — carte grise en attente ({vlEnAttente.length})
          </div>
          <div className="card" style={{ marginBottom: 32 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Propriétaire</th>
                  <th>Véhicule</th>
                  <th>Soumis le</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {vlEnAttente.map(v => {
                  const u = (v as Record<string, unknown>).users as UserInfo
                  return (
                    <tr key={v.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {u && <Avatar nom={u.nom} size="sm" />}
                          <div>
                            <div style={{ fontWeight: 500, color: 'var(--ink)' }}>{u?.nom ?? '—'}</div>
                            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{u?.telephone}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: 13.5 }}>{v.marque} {v.modele}</td>
                      <td style={{ fontSize: 13.5, color: 'var(--ink-3)' }}>{formatDate(v.created_at)}</td>
                      <td><StatusBadge statut={v.statut_carte_grise} /></td>
                      <td><Link href={`/admin/verifications/vehicule-location/${v.id}`} className="btn btn-primary btn-sm">Vérifier</Link></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Pagination currentPage={currentPage} totalCount={totalEnAttente} totalPages={pendingPages} pageSize={pageSize} hideRange label="dossiers en attente" buildHref={page => `/admin/verifications?page=${page}`} />

      {totalEnAttente === 0 && (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--ink-3)', marginBottom: 32 }}>
          Aucun dossier en attente de vérification.
        </div>
      )}

      {/* Historique */}
      {(cniAutresItems.length > 0 || permisAutresItems.length > 0 || vtAutresItems.length > 0 || vlAutresItems.length > 0) && (
        <>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)', marginBottom: 12 }}>Historique</div>
          <div className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>Conducteur</th>
                  <th>Type</th>
                  <th>Détail</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cniAutres.map(p => {
                  const u = (p as Record<string, unknown>).users as { nom: string; photo_url?: string } | null
                  return (
                    <tr key={`cni-${p.id}`}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {u && <Avatar nom={u.nom} size="sm" />}
                          <div style={{ fontWeight: 500, color: 'var(--ink)' }}>{u?.nom ?? '—'}</div>
                        </div>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--ink-3)' }}>CNI</td>
                      <td style={{ fontSize: 13.5 }}>—</td>
                      <td><StatusBadge statut={p.statut_cni} /></td>
                      <td><Link href={`/admin/verifications/${p.id}`} className="btn btn-ghost btn-sm">Voir</Link></td>
                    </tr>
                  )
                })}
                {permisAutres.map(p => {
                  const u = (p as Record<string, unknown>).users as { nom: string; photo_url?: string } | null
                  return (
                    <tr key={`permis-${p.id}`}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {u && <Avatar nom={u.nom} size="sm" />}
                          <div style={{ fontWeight: 500, color: 'var(--ink)' }}>{u?.nom ?? '—'}</div>
                        </div>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--ink-3)' }}>Permis</td>
                      <td style={{ fontSize: 13.5 }}>—</td>
                      <td><StatusBadge statut={p.statut_permis} /></td>
                      <td><Link href={`/admin/verifications/${p.id}`} className="btn btn-ghost btn-sm">Voir</Link></td>
                    </tr>
                  )
                })}
                {vtAutres.map(v => {
                  const u = (v as Record<string, unknown>).users as { nom: string; photo_url?: string } | null
                  return (
                    <tr key={`vt-${v.id}`}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {u && <Avatar nom={u.nom} size="sm" />}
                          <div style={{ fontWeight: 500, color: 'var(--ink)' }}>{u?.nom ?? '—'}</div>
                        </div>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--ink-3)' }}>Véhicule cov./colis</td>
                      <td style={{ fontSize: 13.5 }}>{v.marque ? `${v.marque} ${v.modele ?? ''}` : '—'}</td>
                      <td><StatusBadge statut={v.statut_verification} /></td>
                      <td><Link href={`/admin/verifications/vehicule/${v.id}`} className="btn btn-ghost btn-sm">Voir</Link></td>
                    </tr>
                  )
                })}
                {vlAutres.map(v => {
                  const u = (v as Record<string, unknown>).users as { nom: string; photo_url?: string } | null
                  return (
                    <tr key={`vl-${v.id}`}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {u && <Avatar nom={u.nom} size="sm" />}
                          <div style={{ fontWeight: 500, color: 'var(--ink)' }}>{u?.nom ?? '—'}</div>
                        </div>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--ink-3)' }}>Véhicule location</td>
                      <td style={{ fontSize: 13.5 }}>{v.marque} {v.modele}</td>
                      <td><StatusBadge statut={v.statut_carte_grise} /></td>
                      <td><Link href={`/admin/verifications/vehicule-location/${v.id}`} className="btn btn-ghost btn-sm">Voir</Link></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={currentPage} totalCount={totalHistorique} totalPages={historyPages} pageSize={pageSize} hideRange label="éléments d’historique" buildHref={page => `/admin/verifications?page=${page}`} />
        </>
      )}
    </>
  )
}
