import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import StatusBadge from '@/components/shared/StatusBadge'
import Avatar from '@/components/shared/Avatar'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function AdminVerificationsPage() {
  const supabase = await createClient()

  const [{ data: profils, error: profilsError }, { data: vehicules, error: vehiculesError }] = await Promise.all([
    supabase
      .from('profils_transporteur')
      .select('*, users!profils_transporteur_user_id_fkey(nom, telephone, ville, photo_url)')
      .order('created_at', { ascending: false }),
    supabase
      .from('vehicules_transporteur')
      .select('*, users!vehicules_transporteur_user_id_fkey(nom, telephone, ville, photo_url)')
      .order('created_at', { ascending: false }),
  ])

  if (profilsError) console.error('[admin/verifications] profils query error:', profilsError)
  if (vehiculesError) console.error('[admin/verifications] vehicules query error:', vehiculesError)

  const permisEnAttente = profils?.filter(p => p.statut_conducteur === 'en_attente') ?? []
  const permisAutres = profils?.filter(p => p.statut_conducteur !== 'en_attente') ?? []
  const vehiculesEnAttente = vehicules?.filter(v => v.statut_verification === 'en_attente') ?? []
  const vehiculesAutres = vehicules?.filter(v => v.statut_verification !== 'en_attente') ?? []

  const totalEnAttente = permisEnAttente.length + vehiculesEnAttente.length

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Vérifications transporteurs</h1>
          <p className="page-sub">{totalEnAttente} dossier{totalEnAttente > 1 ? 's' : ''} en attente</p>
        </div>
      </div>

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
                {permisEnAttente.map(p => {
                  const u = (p as Record<string, unknown>).users as { nom: string; telephone: string; ville: string; photo_url?: string } | null
                  return (
                    <tr key={p.id}>
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
                      <td style={{ fontSize: 13.5, color: 'var(--ink-3)' }}>{formatDate(p.created_at)}</td>
                      <td><StatusBadge statut={p.statut_conducteur} /></td>
                      <td><Link href={`/admin/verifications/${p.id}`} className="btn btn-primary btn-sm">Vérifier</Link></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Véhicules en attente */}
      {vehiculesEnAttente.length > 0 && (
        <>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)', marginBottom: 12 }}>
            Véhicules en attente ({vehiculesEnAttente.length})
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
                {vehiculesEnAttente.map(v => {
                  const u = (v as Record<string, unknown>).users as { nom: string; telephone: string; ville: string; photo_url?: string } | null
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

      {totalEnAttente === 0 && (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--ink-3)', marginBottom: 32 }}>
          Aucun dossier en attente de vérification.
        </div>
      )}

      {/* Historique */}
      {(permisAutres.length > 0 || vehiculesAutres.length > 0) && (
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
                {permisAutres.map(p => {
                  const u = (p as Record<string, unknown>).users as { nom: string; photo_url?: string } | null
                  return (
                    <tr key={`p-${p.id}`}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {u && <Avatar nom={u.nom} size="sm" />}
                          <div style={{ fontWeight: 500, color: 'var(--ink)' }}>{u?.nom ?? '—'}</div>
                        </div>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--ink-3)' }}>Permis</td>
                      <td style={{ fontSize: 13.5 }}>—</td>
                      <td><StatusBadge statut={p.statut_conducteur} /></td>
                      <td><Link href={`/admin/verifications/${p.id}`} className="btn btn-ghost btn-sm">Voir</Link></td>
                    </tr>
                  )
                })}
                {vehiculesAutres.map(v => {
                  const u = (v as Record<string, unknown>).users as { nom: string; photo_url?: string } | null
                  return (
                    <tr key={`v-${v.id}`}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {u && <Avatar nom={u.nom} size="sm" />}
                          <div style={{ fontWeight: 500, color: 'var(--ink)' }}>{u?.nom ?? '—'}</div>
                        </div>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--ink-3)' }}>Véhicule</td>
                      <td style={{ fontSize: 13.5 }}>{v.marque ? `${v.marque} ${v.modele ?? ''}` : '—'}</td>
                      <td><StatusBadge statut={v.statut_verification} /></td>
                      <td><Link href={`/admin/verifications/vehicule/${v.id}`} className="btn btn-ghost btn-sm">Voir</Link></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  )
}
