import { Fragment } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import StatusBadge from '@/components/shared/StatusBadge'
import AnnonceActions from '@/components/shared/AnnonceActions'
import type { Trajet, Vehicule } from '@/types'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function detailDemande(d: DemandeChauffeur) {
  if (d.type === 'covoiturage') return `${d.nb_places ?? '?'} place(s)`
  if (d.type === 'colis') return d.description_colis ?? (d.poids_kg ? `${d.poids_kg} kg` : d.poids_estime ?? '—')
  if (d.type === 'location') return d.date_debut && d.date_fin ? `${formatDate(d.date_debut)} → ${formatDate(d.date_fin)}` : '—'
  return '—'
}

function DemandesRecuesRow({ demandes, colSpan }: { demandes: DemandeChauffeur[]; colSpan: number }) {
  if (demandes.length === 0) return null
  return (
    <tr>
      <td colSpan={colSpan} style={{ background: 'var(--surface-2, #faf9f7)', padding: '12px 16px' }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-3)', marginBottom: 8 }}>
          Demandes reçues ({demandes.length})
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {demandes.map(d => (
            <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
              <span>{d.nom_client} — {detailDemande(d)}</span>
              <span style={{ color: 'var(--ink-3)' }}>{formatDate(d.created_at)}</span>
            </div>
          ))}
        </div>
      </td>
    </tr>
  )
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

export default async function MesAnnoncesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [{ data: trajets }, { data: vehicules }, { data: demandesRecues }] = await Promise.all([
    supabase.from('trajets').select('*').eq('user_id', user.id).order('date_depart', { ascending: false }),
    supabase.from('vehicules').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.rpc('get_demandes_annonces_chauffeur') as unknown as Promise<{ data: DemandeChauffeur[] | null }>,
  ])

  const demandesParAnnonce = new Map<string, DemandeChauffeur[]>()
  for (const d of demandesRecues ?? []) {
    const key = d.trajet_id ?? d.vehicule_id
    if (!key) continue
    const liste = demandesParAnnonce.get(key) ?? []
    liste.push(d)
    demandesParAnnonce.set(key, liste)
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Mes annonces</h1>
          <p className="page-sub">Vos trajets et véhicules publiés.</p>
        </div>
        <Link href="/dashboard/publier" className="btn btn-primary">Nouvelle annonce</Link>
      </div>

      {/* Trajets */}
      <div style={{ marginBottom: 40 }}>
        <h3 style={{ fontSize: 18, marginBottom: 16 }}>Trajets ({trajets?.length ?? 0})</h3>
        {!trajets || trajets.length === 0 ? (
          <div className="card" style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--ink-3)' }}>
            Aucun trajet publié
          </div>
        ) : (
          <div className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>Trajet</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Prix</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {(trajets as Trajet[]).map(t => (
                  <Fragment key={t.id}>
                    <tr>
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--ink)' }}>{t.depart_label} → {t.arrivee_label}</div>
                      </td>
                      <td><span className="badge" style={{ textTransform: 'capitalize' }}>{t.type}</span></td>
                      <td style={{ fontSize: 13.5 }}>{formatDate(t.date_depart)}</td>
                      <td style={{ fontFamily: 'var(--font-serif)', fontSize: 15, color: 'var(--primary-deep)' }}>{t.prix.toLocaleString('fr-FR')} FCFA</td>
                      <td><StatusBadge statut={t.statut} /></td>
                      <td><AnnonceActions type="trajet" id={t.id} label={`${t.depart_label} → ${t.arrivee_label}`} /></td>
                    </tr>
                    <DemandesRecuesRow demandes={demandesParAnnonce.get(t.id) ?? []} colSpan={6} />
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Véhicules */}
      <div>
        <h3 style={{ fontSize: 18, marginBottom: 16 }}>Véhicules ({vehicules?.length ?? 0})</h3>
        {!vehicules || vehicules.length === 0 ? (
          <div className="card" style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--ink-3)' }}>
            Aucun véhicule publié
          </div>
        ) : (
          <div className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>Véhicule</th>
                  <th>Lieu</th>
                  <th>Prix / jour</th>
                  <th>Disponible</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {(vehicules as Vehicule[]).map(v => (
                  <Fragment key={v.id}>
                    <tr>
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--ink)' }}>{v.marque} {v.modele}</div>
                        <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{v.nb_places} places · {v.carburant}</div>
                      </td>
                      <td style={{ fontSize: 13.5 }}>{v.lieu_label}</td>
                      <td style={{ fontFamily: 'var(--font-serif)', fontSize: 15, color: 'var(--primary-deep)' }}>{v.prix_jour.toLocaleString('fr-FR')} FCFA</td>
                      <td>
                        <span className={`badge ${v.disponible ? 'badge-success' : 'badge-warn'}`}>
                          {v.disponible ? 'Oui' : 'Non'}
                        </span>
                      </td>
                      <td><StatusBadge statut={v.statut} /></td>
                      <td><AnnonceActions type="vehicule" id={v.id} label={`${v.marque} ${v.modele}`} /></td>
                    </tr>
                    <DemandesRecuesRow demandes={demandesParAnnonce.get(v.id) ?? []} colSpan={6} />
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
