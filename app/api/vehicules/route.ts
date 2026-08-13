import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const schema = z.object({
  vehicule_transporteur_id: z.string().uuid(),
  lieu_label: z.string().trim().min(2),
  lieu_lat: z.number().optional().nullable(),
  lieu_lng: z.number().optional().nullable(),
  prix_jour: z.number().positive(),
  description: z.string().optional().nullable(),
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

  const { data: vehiculeProfil } = await supabase
    .from('vehicules_transporteur')
    .select('marque, modele, annee, couleur, carburant, boite, nb_places, equipements, carte_grise_url, photo_vehicule_url')
    .eq('id', parsed.data.vehicule_transporteur_id)
    .eq('user_id', user.id)
    .single()

  if (!vehiculeProfil) {
    return NextResponse.json({ error: 'Véhicule introuvable ou accès refusé' }, { status: 403 })
  }
  if (!vehiculeProfil.marque || !vehiculeProfil.modele || !vehiculeProfil.nb_places) {
    return NextResponse.json({ error: 'Complétez la marque, le modèle et le nombre de places dans Mes véhicules avant de publier.' }, { status: 400 })
  }

  const photoUrl = vehiculeProfil.photo_vehicule_url
    ? supabase.storage.from('photos').getPublicUrl(vehiculeProfil.photo_vehicule_url).data.publicUrl
    : null

  const { data: vehicule, error } = await supabase
    .from('vehicules')
    .insert({
      ...parsed.data,
      marque: vehiculeProfil.marque,
      modele: vehiculeProfil.modele,
      annee: vehiculeProfil.annee,
      couleur: vehiculeProfil.couleur,
      carburant: vehiculeProfil.carburant,
      boite: vehiculeProfil.boite,
      nb_places: vehiculeProfil.nb_places,
      equipements: vehiculeProfil.equipements,
      photos_urls: photoUrl ? [photoUrl] : [],
      carte_grise_url: vehiculeProfil.carte_grise_url,
      user_id: user.id,
      disponible: true,
      statut: 'en_attente',
      statut_carte_grise: vehiculeProfil.carte_grise_url ? 'en_attente' : 'non_soumis',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ id: vehicule.id }, { status: 201 })
}
