import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import StatusBadge from '@/components/shared/StatusBadge'
import type { Trajet, Vehicule } from '@/types'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function MesAnnoncesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [{ data: trajets }, { data: vehicules }] = await Promise.all([
    supabase.from('trajets').select('*').eq('user_id', user.id).order('date_depart', { ascending: false }),
    supabase.from('vehicules').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
  ])

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
                </tr>
              </thead>
              <tbody>
                {(trajets as Trajet[]).map(t => (
                  <tr key={t.id}>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--ink)' }}>{t.depart_label} → {t.arrivee_label}</div>
                    </td>
                    <td><span className="badge" style={{ textTransform: 'capitalize' }}>{t.type}</span></td>
                    <td style={{ fontSize: 13.5 }}>{formatDate(t.date_depart)}</td>
                    <td style={{ fontFamily: 'var(--font-serif)', fontSize: 15, color: 'var(--primary-deep)' }}>{t.prix.toLocaleString('fr-FR')} FCFA</td>
                    <td><StatusBadge statut={t.statut} /></td>
                  </tr>
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
                </tr>
              </thead>
              <tbody>
                {(vehicules as Vehicule[]).map(v => (
                  <tr key={v.id}>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
