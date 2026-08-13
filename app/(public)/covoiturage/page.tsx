import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import TrajetCard from '@/components/shared/TrajetCard'
import SearchPanel from '@/components/shared/SearchPanel'
import Pagination, { getPage } from '@/components/shared/Pagination'
import type { Trajet } from '@/types'

interface Props {
  searchParams: Promise<{ depart?: string; arrivee?: string; date?: string; page?: string }>
}

export default async function CovoituragePage({ searchParams }: Props) {
  const params = await searchParams
  const currentPage = getPage(params.page)
  const pageSize = 12
  const supabase = await createClient()

  let query = supabase
    .from('trajets')
    .select('*, users!trajets_user_id_fkey(id, nom, telephone, ville, photo_url), vehicules_transporteur(id, nb_places, photo_vehicule_url, marque, modele, type_vehicule)', { count: 'exact' })
    .eq('type', 'covoiturage')
    .eq('statut', 'actif')
    .order('date_depart', { ascending: true })

  if (params.date) query = query.eq('date_depart', params.date)
  if (params.depart) query = query.ilike('depart_label', `%${params.depart}%`)
  if (params.arrivee) query = query.ilike('arrivee_label', `%${params.arrivee}%`)

  const { data: trajets, error, count } = await query.range((currentPage - 1) * pageSize, currentPage * pageSize - 1)
  if (error) console.error('[covoiturage] query error:', error)

  return (
    <>
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--line)', padding: '32px 0' }}>
        <div className="container">
          <span className="kicker">Covoiturage</span>
          <h1 style={{ fontSize: 'clamp(28px, 3vw, 40px)', marginTop: 8 }}>Trajets disponibles</h1>
          <div style={{ marginTop: 24 }}>
            <SearchPanel
              defaultTab="covoiturage"
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
            {/* Filters sidebar */}
            <aside>
              <div className="card card-pad list-sidebar">
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16, color: 'var(--ink)' }}>Filtres</div>
                <div className="field">
                  <label className="field-label">Nombre de places</label>
                  <select className="select">
                    <option value="">Peu importe</option>
                    {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}+</option>)}
                  </select>
                </div>
                <div className="field" style={{ marginTop: 16 }}>
                  <label className="field-label">Prix max (FCFA)</label>
                  <input className="input" type="number" placeholder="Ex: 10 000" />
                </div>
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
                  <Link href="/covoiturage" className="btn btn-ghost btn-sm btn-block">Réinitialiser</Link>
                </div>
              </div>
            </aside>

            {/* Results */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <span style={{ color: 'var(--ink-3)', fontSize: 14 }}>
                  {count ?? 0} trajet{(count ?? 0) > 1 ? 's' : ''} trouvé{(count ?? 0) > 1 ? 's' : ''}
                </span>
              </div>

              {!trajets || trajets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 0' }}>
                  <div style={{ fontSize: 32 }}>🚗</div>
                  <h3 style={{ marginTop: 16, fontSize: 22 }}>Aucun trajet disponible</h3>
                  <p style={{ marginTop: 8, color: 'var(--ink-3)' }}>Essayez d&rsquo;autres dates ou destinations, ou publiez votre propre trajet.</p>
                  <Link href="/connexion" className="btn btn-primary" style={{ marginTop: 24 }}>Publier un trajet</Link>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {(trajets as Trajet[]).map(trajet => (
                      <TrajetCard key={trajet.id} trajet={trajet} />
                    ))}
                  </div>
                  <Pagination currentPage={currentPage} totalCount={count ?? 0} pageSize={pageSize} label="trajets" buildHref={page => {
                    const search = new URLSearchParams()
                    if (params.depart) search.set('depart', params.depart)
                    if (params.arrivee) search.set('arrivee', params.arrivee)
                    if (params.date) search.set('date', params.date)
                    search.set('page', String(page))
                    return `/covoiturage?${search.toString()}`
                  }} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
