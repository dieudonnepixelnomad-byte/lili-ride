import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import VehiculeCard from '@/components/shared/VehiculeCard'
import SearchPanel from '@/components/shared/SearchPanel'
import type { Vehicule } from '@/types'

interface Props {
  searchParams: Promise<{ depart?: string; date?: string }>
}

export default async function LocationPage({ searchParams }: Props) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('vehicules')
    .select('*, users(id, nom, telephone, ville, photo_url)')
    .eq('statut', 'actif')
    .eq('disponible', true)
    .order('created_at', { ascending: false })

  if (params.depart) query = query.ilike('lieu_label', `%${params.depart}%`)

  const { data: vehicules } = await query

  return (
    <>
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--line)', padding: '32px 0' }}>
        <div className="container">
          <span className="kicker">Location de véhicules</span>
          <h1 style={{ fontSize: 'clamp(28px, 3vw, 40px)', marginTop: 8 }}>Véhicules disponibles</h1>
          <div style={{ marginTop: 24 }}>
            <SearchPanel defaultTab="location" defaultDepart={params.depart} defaultDate={params.date} />
          </div>
        </div>
      </div>

      <div className="section-sm">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 32 }}>
            <aside>
              <div className="card card-pad" style={{ position: 'sticky', top: 90 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16, color: 'var(--ink)' }}>Filtres</div>
                <div className="field">
                  <label className="field-label">Type de véhicule</label>
                  <select className="select">
                    <option value="">Tous</option>
                    {['Berline', 'SUV', 'Minibus', 'Camionnette', 'Moto'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="field" style={{ marginTop: 16 }}>
                  <label className="field-label">Prix max / jour (FCFA)</label>
                  <input className="input" type="number" placeholder="Ex: 30 000" />
                </div>
                <div className="field" style={{ marginTop: 16 }}>
                  <label className="field-label">Boîte</label>
                  <select className="select">
                    <option value="">Peu importe</option>
                    <option value="manuelle">Manuelle</option>
                    <option value="automatique">Automatique</option>
                  </select>
                </div>
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
                  <Link href="/location" className="btn btn-ghost btn-sm btn-block">Réinitialiser</Link>
                </div>
              </div>
            </aside>

            <div>
              <div style={{ marginBottom: 24 }}>
                <span style={{ color: 'var(--ink-3)', fontSize: 14 }}>
                  {vehicules?.length ?? 0} véhicule{(vehicules?.length ?? 0) > 1 ? 's' : ''} trouvé{(vehicules?.length ?? 0) > 1 ? 's' : ''}
                </span>
              </div>

              {!vehicules || vehicules.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 0' }}>
                  <div style={{ fontSize: 32 }}>🚙</div>
                  <h3 style={{ marginTop: 16, fontSize: 22 }}>Aucun véhicule disponible</h3>
                  <p style={{ marginTop: 8, color: 'var(--ink-3)' }}>Contactez le support pour trouver un véhicule adapté.</p>
                  <Link href="/support" className="btn btn-primary" style={{ marginTop: 24 }}>Contacter le support</Link>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                  {(vehicules as Vehicule[]).map(v => (
                    <VehiculeCard key={v.id} vehicule={v} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
