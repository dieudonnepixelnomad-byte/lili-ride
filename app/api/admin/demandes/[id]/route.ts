import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'

const schema = z.object({
  statut: z.enum(['en_attente', 'traitée', 'annulée']).optional(),
  notes_support: z.string().optional().nullable(),
})

interface Params {
  params: Promise<{ id: string }>
}

type DemandeSnapshot = {
  statut: string
  type: string
  trajet_id: string | null
  nb_places: number | null
  poids_kg: number | null
}

async function adjustTrajetCapacity(
  supabase: SupabaseClient,
  demande: DemandeSnapshot,
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

    await supabase
      .from('trajets')
      .update({ places_dispo: newPlaces, statut: newStatut })
      .eq('id', demande.trajet_id)
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

    await supabase
      .from('trajets')
      .update({ poids_dispo_kg: newPoids, statut: newStatut })
      .eq('id', demande.trajet_id)
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { data: u } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!u || u.role !== 'admin') {
    return NextResponse.json({ error: 'Accès interdit' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
  }

  // Fetch current demande state before update
  const { data: current } = await supabase
    .from('demandes')
    .select('statut, type, trajet_id, nb_places, poids_kg')
    .eq('id', id)
    .single()

  if (!current) {
    return NextResponse.json({ error: 'Demande introuvable' }, { status: 404 })
  }

  const { error } = await supabase
    .from('demandes')
    .update(parsed.data)
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Adjust trajet capacity on status transitions
  const oldStatut = current.statut
  const newStatut = parsed.data.statut
  if (newStatut && newStatut !== oldStatut) {
    if (newStatut === 'traitée') {
      await adjustTrajetCapacity(supabase, current as DemandeSnapshot, 'decrement')
    } else if (oldStatut === 'traitée') {
      await adjustTrajetCapacity(supabase, current as DemandeSnapshot, 'restore')
    }
  }

  return NextResponse.json({ ok: true })
}
