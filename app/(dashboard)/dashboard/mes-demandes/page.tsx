import { createClient } from '@/lib/supabase/server'
import StatusBadge from '@/components/shared/StatusBadge'
import type { Demande } from '@/types'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

const typeLabels: Record<string, string> = {
  covoiturage: 'Covoiturage',
  colis: 'Transport de colis',
  location: 'Location',
}

export default async function MesDemandesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: demandes } = await supabase
    .from('demandes')
    .select('*, trajets(depart_label, arrivee_label, date_depart), vehicules(marque, modele)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Mes demandes</h1>
          <p className="page-sub">Historique de toutes vos demandes.</p>
        </div>
      </div>

      {!demandes || demandes.length === 0 ? (
        <div className="card" style={{ padding: '80px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 32 }}>📋</div>
          <h3 style={{ marginTop: 16, fontSize: 22 }}>Aucune demande</h3>
          <p style={{ marginTop: 8, color: 'var(--ink-3)' }}>Vos demandes apparaîtront ici après soumission d&rsquo;un formulaire.</p>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Annonce</th>
                <th>Date</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {(demandes as Demande[]).map(d => {
                const annonce = (d as unknown as { trajets?: { depart_label: string; arrivee_label: string }; vehicules?: { marque: string; modele: string } }).trajets
                  ? `${(d as unknown as { trajets?: { depart_label: string; arrivee_label: string } }).trajets?.depart_label} → ${(d as unknown as { trajets?: { arrivee_label: string } }).trajets?.arrivee_label}`
                  : (d as unknown as { vehicules?: { marque: string; modele: string } }).vehicules
                  ? `${(d as unknown as { vehicules?: { marque: string; modele: string } }).vehicules?.marque} ${(d as unknown as { vehicules?: { modele: string } }).vehicules?.modele}`
                  : '—'
                return (
                  <tr key={d.id}>
                    <td><span className="badge badge-primary">{typeLabels[d.type] ?? d.type}</span></td>
                    <td style={{ fontSize: 14, color: 'var(--ink)' }}>{annonce}</td>
                    <td style={{ fontSize: 13.5, color: 'var(--ink-3)' }}>{formatDate(d.created_at)}</td>
                    <td><StatusBadge statut={d.statut} /></td>
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
