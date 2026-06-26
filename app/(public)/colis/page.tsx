import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import TrajetCard from '@/components/shared/TrajetCard'
import SearchPanel from '@/components/shared/SearchPanel'
import type { Trajet } from '@/types'

interface Props {
  searchParams: Promise<{ depart?: string; arrivee?: string; date?: string }>
}

export default async function ColisPage({ searchParams }: Props) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('trajets')
    .select('*, users(id, nom, telephone, ville, photo_url)')
    .eq('type', 'colis')
    .eq('statut', 'actif')
    .order('date_depart', { ascending: true })

  if (params.date) query = query.eq('date_depart', params.date)
  if (params.depart) query = query.ilike('depart_label', `%${params.depart}%`)
  if (params.arrivee) query = query.ilike('arrivee_label', `%${params.arrivee}%`)

  const { data: trajets } = await query

  return (
    <>
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--line)', padding: '32px 0' }}>
        <div className="container">
          <span className="kicker">Transport de colis</span>
          <h1 style={{ fontSize: 'clamp(28px, 3vw, 40px)', marginTop: 8 }}>Transporteurs disponibles</h1>
          <div style={{ marginTop: 24 }}>
            <SearchPanel
              defaultTab="colis"
              defaultDepart={params.depart}
              defaultArrivee={params.arrivee}
              defaultDate={params.date}
            />
          </div>
        </div>
      </div>

      <div className="section-sm">
        <div className="container">
          <div className="list-layout">
            <aside>
              <div className="card card-pad list-sidebar">
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16, color: 'var(--ink)' }}>Filtres</div>
                <div className="field">
                  <label className="field-label">Type de colis accepté</label>
                  {['documents', 'petit', 'volumineux', 'fragile'].map(t => (
                    <label key={t} className="checkbox-row" style={{ display: 'flex', marginTop: 8 }}>
                      <input type="checkbox" />
                      <span style={{ fontSize: 14, color: 'var(--ink-2)', textTransform: 'capitalize' }}>{t}</span>
                    </label>
                  ))}
                </div>
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
                  <Link href="/colis" className="btn btn-ghost btn-sm btn-block">Réinitialiser</Link>
                </div>
              </div>
            </aside>

            <div>
              <div style={{ marginBottom: 24 }}>
                <span style={{ color: 'var(--ink-3)', fontSize: 14 }}>
                  {trajets?.length ?? 0} trajet{(trajets?.length ?? 0) > 1 ? 's' : ''} trouvé{(trajets?.length ?? 0) > 1 ? 's' : ''}
                </span>
              </div>

              {!trajets || trajets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 0' }}>
                  <div style={{ fontSize: 32 }}>📦</div>
                  <h3 style={{ marginTop: 16, fontSize: 22 }}>Aucun transporteur disponible</h3>
                  <p style={{ marginTop: 8, color: 'var(--ink-3)' }}>Contactez le support pour un envoi sur-mesure.</p>
                  <Link href="/support" className="btn btn-primary" style={{ marginTop: 24 }}>Contacter le support</Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {(trajets as Trajet[]).map(trajet => (
                    <TrajetCard key={trajet.id} trajet={trajet} />
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
