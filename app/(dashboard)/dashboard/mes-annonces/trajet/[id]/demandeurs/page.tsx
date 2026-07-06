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
  nb_places: number | null
  description_colis: string | null
  poids_estime: string | null
  poids_kg: number | null
  date_debut: string | null
  date_fin: string | null
  message: string | null
  statut: string
  created_at: string
}

function detailDemande(d: DemandeChauffeur) {
  if (d.type === 'covoiturage') return `${d.nb_places ?? '?'} place(s)`
  if (d.type === 'colis') return d.description_colis ?? (d.poids_kg ? `${d.poids_kg} kg` : d.poids_estime ?? '—')
  return '—'
}

export default async function DemandeursTrajetPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: trajet } = await supabase
    .from('trajets')
    .select('id, depart_label, arrivee_label')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!trajet) notFound()

  const { data: demandes } = await supabase.rpc('get_demandes_annonces_chauffeur') as unknown as { data: DemandeChauffeur[] | null }
  const demandeurs = (demandes ?? []).filter(d => d.trajet_id === id)

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Demandeurs</h1>
          <p className="page-sub">{trajet.depart_label} → {trajet.arrivee_label}</p>
        </div>
        <Link href="/dashboard/mes-annonces" className="btn btn-outline">Retour</Link>
      </div>

      {demandeurs.length === 0 ? (
        <div className="card" style={{ padding: '80px 24px', textAlign: 'center' }}>
          <p style={{ color: 'var(--ink-3)' }}>Aucune demande traitée pour ce trajet.</p>
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
              <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{detailDemande(d)}</div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
