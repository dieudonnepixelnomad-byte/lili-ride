import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface Params {
  params: Promise<{ id: string }>
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.redirect(new URL('/connexion', req.url))
  }

  const { data: u } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!u || u.role !== 'admin') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  const formData = await req.formData()
  const statut = formData.get('statut') as string

  if (!['en_attente', 'traitée', 'annulée'].includes(statut)) {
    return NextResponse.redirect(new URL(`/admin/demandes/${id}`, req.url))
  }

  const { data: current } = await supabase
    .from('demandes')
    .select('statut, type, trajet_id, nb_places, poids_kg')
    .eq('id', id)
    .single()

  if (!current) {
    return NextResponse.redirect(new URL('/admin/demandes', req.url))
  }

  await supabase.from('demandes').update({ statut }).eq('id', id)

  if (statut !== current.statut) {
    if (statut === 'traitée') {
      await adjustTrajetCapacity(supabase, current, 'decrement')
    } else if (current.statut === 'traitée') {
      await adjustTrajetCapacity(supabase, current, 'restore')
    }
  }

  return NextResponse.redirect(new URL(`/admin/demandes/${id}`, req.url))
}

async function adjustTrajetCapacity(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  demande: { type: string; trajet_id: string | null; nb_places: number | null; poids_kg: number | null },
  direction: 'decrement' | 'restore'
) {
  if (!demande.trajet_id) return

  if (demande.type === 'covoiturage' && demande.nb_places) {
    const { data: trajet } = await supabase
      .from('trajets')
      .select('places_dispo, statut')
      .eq('id', demande.trajet_id)
      .single()
    if (!trajet) return

    const delta = direction === 'decrement' ? -demande.nb_places : demande.nb_places
    const newPlaces = Math.max(0, (trajet.places_dispo ?? 0) + delta)
    const newStatut =
      direction === 'decrement' && newPlaces === 0
        ? 'complet'
        : direction === 'restore' && trajet.statut === 'complet'
          ? 'actif'
          : trajet.statut

    await supabase.from('trajets').update({ places_dispo: newPlaces, statut: newStatut }).eq('id', demande.trajet_id)
  }

  if (demande.type === 'colis' && demande.poids_kg) {
    const { data: trajet } = await supabase
      .from('trajets')
      .select('poids_dispo_kg, statut')
      .eq('id', demande.trajet_id)
      .single()
    if (!trajet || trajet.poids_dispo_kg == null) return

    const delta = direction === 'decrement' ? -demande.poids_kg : demande.poids_kg
    const newPoids = Math.max(0, (trajet.poids_dispo_kg ?? 0) + delta)
    const newStatut =
      direction === 'decrement' && newPoids === 0
        ? 'complet'
        : direction === 'restore' && trajet.statut === 'complet'
          ? 'actif'
          : trajet.statut

    await supabase.from('trajets').update({ poids_dispo_kg: newPoids, statut: newStatut }).eq('id', demande.trajet_id)
  }
}
