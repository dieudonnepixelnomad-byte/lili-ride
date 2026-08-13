import { createClient } from '@/lib/supabase/server'
import StatusBadge from '@/components/shared/StatusBadge'
import Avatar from '@/components/shared/Avatar'
import Pagination, { getPage } from '@/components/shared/Pagination'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function AdminUtilisateursPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams
  const currentPage = getPage(params.page)
  const pageSize = 20
  const supabase = await createClient()

  const { data: users, error, count } = await supabase
    .from('users')
    .select('id, nom, telephone, ville, role, created_at, profils_transporteur!profils_transporteur_user_id_fkey(statut_cni, statut_permis)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((currentPage - 1) * pageSize, currentPage * pageSize - 1)

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Utilisateurs</h1>
          <p className="page-sub">{count ?? 0} utilisateur{(count ?? 0) > 1 ? 's' : ''} inscrits</p>
        </div>
      </div>
      <div className="card">
        {error ? (
          <div className="notice warn" style={{ margin: 22 }}>
            Impossible de charger les utilisateurs : {error.message}
          </div>
        ) : !users?.length ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--ink-3)' }}>
            Aucun utilisateur inscrit pour le moment.
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Téléphone</th>
                <th>Ville</th>
                <th>Vérification</th>
                <th>Rôle</th>
                <th>Inscrit le</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const profil = u.profils_transporteur as { statut_cni?: string; statut_permis?: string } | { statut_cni?: string; statut_permis?: string }[] | null
                const profilTransporteur = Array.isArray(profil) ? profil[0] : profil
                const statutVerif = profilTransporteur?.statut_cni ?? profilTransporteur?.statut_permis
                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar nom={u.nom} size="sm" />
                        <div style={{ fontWeight: 500, color: 'var(--ink)' }}>{u.nom}</div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{u.telephone ?? '—'}</td>
                    <td style={{ fontSize: 13.5 }}>{u.ville}</td>
                    <td>
                      {statutVerif ? <StatusBadge statut={statutVerif} /> : <span style={{ color: 'var(--muted)', fontSize: 13 }}>Non concerné</span>}
                    </td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-danger' : ''}`} style={{ textTransform: 'capitalize' }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ fontSize: 13.5, color: 'var(--ink-3)' }}>{formatDate(u.created_at)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
      <Pagination currentPage={currentPage} totalCount={count ?? 0} pageSize={pageSize} label="utilisateurs" buildHref={page => `/admin/utilisateurs?page=${page}`} />
    </>
  )
}
