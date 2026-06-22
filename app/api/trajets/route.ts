import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const schema = z.object({
  vehicule_transporteur_id: z.string().uuid(),
  type: z.enum(['covoiturage', 'colis']),
  depart_label: z.string().min(2),
  depart_lat: z.number().optional().nullable(),
  depart_lng: z.number().optional().nullable(),
  arrivee_label: z.string().min(2),
  arrivee_lat: z.number().optional().nullable(),
  arrivee_lng: z.number().optional().nullable(),
  date_depart: z.string().min(10),
  heure_depart: z.string().min(4),
  prix: z.number().positive(),
  places_dispo: z.number().int().min(1).optional().nullable(),
  types_colis: z.array(z.string()).optional().nullable(),
  description: z.string().optional().nullable(),
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  // Permis conducteur vérifié
  const { data: profil } = await supabase
    .from('profils_transporteur')
    .select('statut_conducteur')
    .eq('user_id', user.id)
    .single()

  if (!profil || profil.statut_conducteur !== 'vérifié') {
    return NextResponse.json({ error: 'Permis conducteur non vérifié' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides', details: parsed.error.flatten() }, { status: 400 })
  }

  // Véhicule appartient à l'utilisateur ET est vérifié
  const { data: vehicule } = await supabase
    .from('vehicules_transporteur')
    .select('statut_verification')
    .eq('id', parsed.data.vehicule_transporteur_id)
    .eq('user_id', user.id)
    .single()

  if (!vehicule || vehicule.statut_verification !== 'vérifié') {
    return NextResponse.json({ error: 'Véhicule non vérifié ou introuvable' }, { status: 403 })
  }

  const { data: trajet, error } = await supabase
    .from('trajets')
    .insert({ ...parsed.data, user_id: user.id, statut: 'actif' })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ id: trajet.id }, { status: 201 })
}
