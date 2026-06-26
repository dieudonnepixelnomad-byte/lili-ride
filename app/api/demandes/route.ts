import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { sendAdminNotification } from '@/lib/resend'

const schema = z.object({
  type: z.enum(['covoiturage', 'colis', 'location']),
  trajet_id: z.string().uuid().optional().nullable(),
  vehicule_id: z.string().uuid().optional().nullable(),
  nom_client: z.string().min(2),
  telephone: z.string().min(8),
  whatsapp: z.string().optional().nullable(),
  nb_places: z.number().int().min(1).optional().nullable(),
  description_colis: z.string().optional().nullable(),
  poids_estime: z.string().optional().nullable(),
  date_debut: z.string().optional().nullable(),
  date_fin: z.string().optional().nullable(),
  message: z.string().optional().nullable(),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides', details: parsed.error.flatten() }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Toute demande nécessite un compte avec photo de profil
  if (!user) {
    return NextResponse.json({ error: 'Connectez-vous pour faire une demande.' }, { status: 401 })
  }
  const { data: userData } = await supabase.from('users').select('photo_url').eq('id', user.id).single()
  if (!userData?.photo_url) {
    return NextResponse.json({ error: 'Ajoutez une photo de profil avant de faire une demande.' }, { status: 403 })
  }

  const { data: demande, error } = await supabase
    .from('demandes')
    .insert({
      ...parsed.data,
      user_id: user?.id ?? null,
      origine: 'formulaire',
      statut: 'en_attente',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Fetch annonce details for email
  let annonceLabel = ''
  if (demande.trajet_id) {
    const { data: trajet } = await supabase
      .from('trajets')
      .select('depart_label, arrivee_label, date_depart')
      .eq('id', demande.trajet_id)
      .single()
    if (trajet) annonceLabel = `${trajet.depart_label} → ${trajet.arrivee_label} (${trajet.date_depart})`
  } else if (demande.vehicule_id) {
    const { data: vehicule } = await supabase
      .from('vehicules')
      .select('marque, modele, lieu_label')
      .eq('id', demande.vehicule_id)
      .single()
    if (vehicule) annonceLabel = `${vehicule.marque} ${vehicule.modele} — ${vehicule.lieu_label}`
  }

  // Send admin notification (fire and forget)
  sendAdminNotification({
    demandeId: demande.id,
    type: demande.type,
    nomClient: demande.nom_client,
    telephone: demande.telephone,
    whatsapp: demande.whatsapp ?? undefined,
    annonceLabel,
  }).catch(console.error)

  return NextResponse.json({ id: demande.id }, { status: 201 })
}
