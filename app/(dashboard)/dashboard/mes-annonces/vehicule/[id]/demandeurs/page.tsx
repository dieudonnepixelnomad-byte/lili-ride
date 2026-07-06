import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Avatar from '@/components/shared/Avatar'

interface Props {
  params: Promise<{ id: string }>
}

type DemandeChauffeur = {
  id: string
  type: string
  trajet_id: string | null
  vehicule_id: string | null
  demandeur_user_id: string | null
  nom_client: string
  ville: string | null
  photo_url: string | null
  date_debut: string | null
  date_fin: string | null
  message: string | null
  statut: string
  created_at: string
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function DemandeursVehiculePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: vehicule } = await supabase
    .from('vehicules')
    .select('id, marque, modele')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!vehicule) notFound()

  const { data: demandes } = await supabase.rpc('get_demandes_annonces_chauffeur') as unknown as { data: DemandeChauffeur[] | null }
  const demandeurs = (demandes ?? []).filter(d => d.vehicule_id === id)

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Demandeurs</h1>
          <p className="page-sub">{vehicule.marque} {vehicule.modele}</p>
        </div>
        <Link href="/dashboard/mes-annonces" className="btn btn-outline">Retour</Link>
      </div>

      {demandeurs.length === 0 ? (
        <div className="card" style={{ padding: '80px 24px', textAlign: 'center' }}>
          <p style={{ color: 'var(--ink-3)' }}>Aucune demande traitée pour ce véhicule.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {demandeurs.map(d => (
            <div key={d.id} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center' }}>
              <Avatar nom={d.nom_client} photo_url={d.photo_url} size="lg" />
              <div>
                <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{d.nom_client}</div>
                {d.ville && <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>{d.ville}</div>}
              </div>
              {d.date_debut && d.date_fin && (
                <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{formatDate(d.date_debut)} → {formatDate(d.date_fin)}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
