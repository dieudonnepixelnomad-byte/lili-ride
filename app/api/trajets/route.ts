import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const schema = z.object({
  vehicule_transporteur_id: z.string().uuid(),
  type: z.enum(['covoiturage', 'colis']),
  depart_label: z.string().trim().min(2),
  depart_lat: z.number().optional().nullable(),
  depart_lng: z.number().optional().nullable(),
  arrivee_label: z.string().trim().min(2),
  arrivee_lat: z.number().optional().nullable(),
  arrivee_lng: z.number().optional().nullable(),
  date_depart: z.string().min(10),
  heure_depart: z.string().min(4),
  prix: z.number().positive(),
  places_dispo: z.number().int().min(1).optional().nullable(),
  types_colis: z.array(z.string()).optional().nullable(),
  poids_max_kg: z.number().positive().optional().nullable(),
  prix_par_kg: z.number().positive().optional().nullable(),
  description: z.string().optional().nullable(),
  lieu_embarquement: z.string().optional().nullable(),
  lieu_debarquement: z.string().optional().nullable(),
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { data: profil } = await supabase
    .from('profils_transporteur')
    .select('statut_cni, statut_permis')
    .eq('user_id', user.id)
    .single()

  const { data: userData } = await supabase.from('users').select('photo_url').eq('id', user.id).single()
  if (!userData?.photo_url) {
    return NextResponse.json({ error: 'Ajoutez une photo de profil avant de publier.' }, { status: 403 })
  }

  if (!profil || profil.statut_cni !== 'vérifié') {
    return NextResponse.json({ error: 'CNI non vérifiée' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides', details: parsed.error.flatten() }, { status: 400 })
  }

  // Toutes les annonces sont associées à un véhicule existant du propriétaire.
  const { data: vehicule } = await supabase
    .from('vehicules_transporteur')
    .select('statut_verification, nb_places')
    .eq('id', parsed.data.vehicule_transporteur_id)
    .eq('user_id', user.id)
    .single()

  if (!vehicule) {
    return NextResponse.json({ error: 'Véhicule introuvable ou accès refusé' }, { status: 403 })
  }

  // Covoiturage : permis + véhicule vérifié requis. Colis : véhicule existant requis.
  const extraFields: Record<string, unknown> = {}
  if (parsed.data.type === 'colis' && parsed.data.poids_max_kg) {
    // poids_dispo_kg initialisé à la capacité max déclarée
    extraFields.poids_dispo_kg = parsed.data.poids_max_kg
  }
  if (parsed.data.type === 'covoiturage') {
    if (profil.statut_permis !== 'vérifié') {
      return NextResponse.json({ error: 'Permis de conduire non vérifié' }, { status: 403 })
    }
    if (vehicule.statut_verification !== 'vérifié') {
      return NextResponse.json({ error: 'Véhicule non vérifié ou introuvable' }, { status: 403 })
    }
    if (parsed.data.places_dispo && vehicule.nb_places && parsed.data.places_dispo > vehicule.nb_places) {
      return NextResponse.json({ error: 'Le nombre de places disponibles dépasse la capacité du véhicule.' }, { status: 400 })
    }
  }

  const { data: trajet, error } = await supabase
    .from('trajets')
    .insert({ ...parsed.data, ...extraFields, user_id: user.id, statut: 'en_attente' })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ id: trajet.id }, { status: 201 })
}
