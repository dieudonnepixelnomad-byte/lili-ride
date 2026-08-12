import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const schema = z.object({
  marque: z.string().min(1),
  modele: z.string().min(1),
  annee: z.number().int().min(1990).optional().nullable(),
  couleur: z.string().optional().nullable(),
  nb_places: z.number().int().min(1),
  carburant: z.enum(['essence', 'diesel', 'hybride']).optional().nullable(),
  boite: z.enum(['manuelle', 'automatique']).optional().nullable(),
  lieu_label: z.string().trim().min(2),
  lieu_lat: z.number().optional().nullable(),
  lieu_lng: z.number().optional().nullable(),
  prix_jour: z.number().positive(),
  photos_urls: z.array(z.string()).min(1),
  equipements: z.array(z.string()).optional().nullable(),
  description: z.string().optional().nullable(),
  carte_grise_url: z.string().optional().nullable(),
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { data: userData } = await supabase.from('users').select('photo_url').eq('id', user.id).single()
  if (!userData?.photo_url) {
    return NextResponse.json({ error: 'Ajoutez une photo de profil avant de publier.' }, { status: 403 })
  }

  // Location requires CNI verified (no permis needed)
  const { data: profil } = await supabase
    .from('profils_transporteur')
    .select('statut_cni')
    .eq('user_id', user.id)
    .single()

  if (!profil || profil.statut_cni !== 'vérifié') {
    return NextResponse.json({ error: 'CNI non vérifiée' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides', details: parsed.error.flatten() }, { status: 400 })
  }

  const { data: vehicule, error } = await supabase
    .from('vehicules')
    .insert({
      ...parsed.data,
      user_id: user.id,
      disponible: true,
      statut: 'actif',
      statut_carte_grise: parsed.data.carte_grise_url ? 'en_attente' : 'non_soumis',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ id: vehicule.id }, { status: 201 })
}
