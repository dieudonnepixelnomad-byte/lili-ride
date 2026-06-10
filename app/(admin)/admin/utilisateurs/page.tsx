import { createClient } from '@/lib/supabase/server'
import StatusBadge from '@/components/shared/StatusBadge'
import Avatar from '@/components/shared/Avatar'
import type { User } from '@/types'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function AdminUtilisateursPage() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from('users')
    .select('*, profils_transporteur(statut_verification)')
    .order('created_at', { ascending: false })

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Utilisateurs</h1>
          <p className="page-sub">{users?.length ?? 0} utilisateur{(users?.length ?? 0) > 1 ? 's' : ''} inscrits</p>
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Téléphone</th>
              <th>Ville</th>
              <th>Transporteur</th>
              <th>Rôle</th>
              <th>Inscrit le</th>
            </tr>
          </thead>
          <tbody>
            {users?.map(u => {
              const raw = u as Record<string, unknown>
              const profil = raw.profils_transporteur as { statut_verification?: string }[] | null
              const statutVerif = profil?.[0]?.statut_verification
              return (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar nom={u.nom} size="sm" />
                      <div style={{ fontWeight: 500, color: 'var(--ink)' }}>{u.nom}</div>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{u.telephone}</td>
                  <td style={{ fontSize: 13.5 }}>{u.ville}</td>
                  <td>
                    {statutVerif ? <StatusBadge statut={statutVerif} /> : <span style={{ color: 'var(--muted)', fontSize: 13 }}>—</span>}
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
      </div>
    </>
  )
}
