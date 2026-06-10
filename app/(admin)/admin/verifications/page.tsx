import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import StatusBadge from '@/components/shared/StatusBadge'
import Avatar from '@/components/shared/Avatar'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function AdminVerificationsPage() {
  const supabase = await createClient()

  const { data: profils } = await supabase
    .from('profils_transporteur')
    .select('*, users(nom, telephone, ville, photo_url)')
    .order('created_at', { ascending: false })

  const enAttente = profils?.filter(p => p.statut_verification === 'en_attente') ?? []
  const autres = profils?.filter(p => p.statut_verification !== 'en_attente') ?? []

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Vérifications transporteurs</h1>
          <p className="page-sub">{enAttente.length} profil{enAttente.length > 1 ? 's' : ''} en attente</p>
        </div>
      </div>

      {enAttente.length > 0 && (
        <>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)', marginBottom: 12 }}>En attente de vérification</div>
          <div className="card" style={{ marginBottom: 32 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Transporteur</th>
                  <th>Véhicule</th>
                  <th>Ville</th>
                  <th>Soumis le</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {enAttente.map(p => {
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
                      <td style={{ fontSize: 13.5 }}>{p.type_vehicule ? `${p.marque ?? ''} ${p.modele ?? ''} (${p.type_vehicule})` : '—'}</td>
                      <td style={{ fontSize: 13.5 }}>{u?.ville ?? '—'}</td>
                      <td style={{ fontSize: 13.5, color: 'var(--ink-3)' }}>{formatDate(p.created_at)}</td>
                      <td><StatusBadge statut={p.statut_verification} /></td>
                      <td><Link href={`/admin/verifications/${p.id}`} className="btn btn-primary btn-sm">Vérifier</Link></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {autres.length > 0 && (
        <>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)', marginBottom: 12 }}>Historique</div>
          <div className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>Transporteur</th>
                  <th>Véhicule</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {autres.map(p => {
                  const u = (p as Record<string, unknown>).users as { nom: string; telephone: string; ville: string; photo_url?: string } | null
                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {u && <Avatar nom={u.nom} size="sm" />}
                          <div style={{ fontWeight: 500, color: 'var(--ink)' }}>{u?.nom ?? '—'}</div>
                        </div>
                      </td>
                      <td style={{ fontSize: 13.5 }}>{p.marque ? `${p.marque} ${p.modele ?? ''}` : '—'}</td>
                      <td><StatusBadge statut={p.statut_verification} /></td>
                      <td><Link href={`/admin/verifications/${p.id}`} className="btn btn-ghost btn-sm">Voir</Link></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {(profils?.length ?? 0) === 0 && (
        <div className="card" style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--ink-3)' }}>
          Aucun profil transporteur soumis pour l&rsquo;instant.
        </div>
      )}
    </>
  )
}
