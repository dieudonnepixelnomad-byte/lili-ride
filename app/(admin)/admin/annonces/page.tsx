import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import StatusBadge from '@/components/shared/StatusBadge'

interface Props {
  searchParams: Promise<{ type?: string }>
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function AdminAnnoncesPage({ searchParams }: Props) {
  const params = await searchParams
  const supabase = await createClient()

  const [{ data: trajets }, { data: vehicules }] = await Promise.all([
    supabase.from('trajets').select('*, users(nom)').order('created_at', { ascending: false }),
    supabase.from('vehicules').select('*, users(nom)').order('created_at', { ascending: false }),
  ])

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Toutes les annonces</h1>
          <p className="page-sub">{(trajets?.length ?? 0) + (vehicules?.length ?? 0)} annonces au total</p>
        </div>
      </div>

      {/* Trajets */}
      <div style={{ marginBottom: 40 }}>
        <h3 style={{ fontSize: 18, marginBottom: 16 }}>Trajets ({trajets?.length ?? 0})</h3>
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Trajet</th>
                <th>Type</th>
                <th>Conducteur</th>
                <th>Date départ</th>
                <th>Prix</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {trajets?.map(t => {
                const u = (t as Record<string, unknown>).users as { nom: string } | null
                return (
                  <tr key={t.id}>
                    <td><div style={{ fontWeight: 500, color: 'var(--ink)' }}>{t.depart_label} → {t.arrivee_label}</div></td>
                    <td><span className="badge" style={{ textTransform: 'capitalize' }}>{t.type}</span></td>
                    <td style={{ fontSize: 13.5 }}>{u?.nom ?? '—'}</td>
                    <td style={{ fontSize: 13.5, color: 'var(--ink-3)' }}>{formatDate(t.date_depart)}</td>
                    <td style={{ fontFamily: 'var(--font-serif)', fontSize: 14 }}>{t.prix.toLocaleString('fr-FR')} FCFA</td>
                    <td><StatusBadge statut={t.statut} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Véhicules */}
      <div>
        <h3 style={{ fontSize: 18, marginBottom: 16 }}>Véhicules ({vehicules?.length ?? 0})</h3>
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Véhicule</th>
                <th>Propriétaire</th>
                <th>Lieu</th>
                <th>Prix / jour</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {vehicules?.map(v => {
                const u = (v as Record<string, unknown>).users as { nom: string } | null
                return (
                  <tr key={v.id}>
                    <td><div style={{ fontWeight: 500, color: 'var(--ink)' }}>{v.marque} {v.modele}</div></td>
                    <td style={{ fontSize: 13.5 }}>{u?.nom ?? '—'}</td>
                    <td style={{ fontSize: 13.5 }}>{v.lieu_label}</td>
                    <td style={{ fontFamily: 'var(--font-serif)', fontSize: 14 }}>{v.prix_jour.toLocaleString('fr-FR')} FCFA</td>
                    <td><StatusBadge statut={v.statut} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
