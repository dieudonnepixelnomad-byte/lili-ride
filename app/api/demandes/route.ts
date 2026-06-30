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
  poids_kg: z.number().positive().optional().nullable(),
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

  // Check trajet availability before inserting
  let trajetSnapshot: { statut: string; places_dispo: number | null; poids_dispo_kg: number | null; type: string } | null = null
  if (parsed.data.trajet_id) {
    const { data: trajet } = await supabase
      .from('trajets')
      .select('statut, places_dispo, poids_dispo_kg, type')
      .eq('id', parsed.data.trajet_id)
      .single()

    if (!trajet) {
      return NextResponse.json({ error: 'Annonce introuvable.' }, { status: 404 })
    }
    if (trajet.statut === 'annulé') {
      return NextResponse.json({ error: 'Ce trajet a été annulé.' }, { status: 409 })
    }
    if (trajet.statut === 'complet') {
      return NextResponse.json({ error: 'Ce trajet est complet.' }, { status: 409 })
    }
    if (trajet.type === 'covoiturage') {
      const nb = parsed.data.nb_places ?? 1
      if ((trajet.places_dispo ?? 0) < nb) {
        return NextResponse.json(
          { error: `Seulement ${trajet.places_dispo ?? 0} place(s) disponible(s) sur ce trajet.` },
          { status: 409 }
        )
      }
    }
    if (trajet.type === 'colis' && parsed.data.poids_kg && trajet.poids_dispo_kg != null) {
      if (trajet.poids_dispo_kg < parsed.data.poids_kg) {
        return NextResponse.json(
          { error: `Capacité insuffisante. Il reste ${trajet.poids_dispo_kg} kg disponibles.` },
          { status: 409 }
        )
      }
    }
    trajetSnapshot = trajet
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

  // Décrémente places_dispo pour covoiturage
  if (parsed.data.trajet_id && parsed.data.type === 'covoiturage' && parsed.data.nb_places && trajetSnapshot) {
    const newDispo = Math.max(0, (trajetSnapshot.places_dispo ?? 0) - parsed.data.nb_places)
    await supabase
      .from('trajets')
      .update({
        places_dispo: newDispo,
        ...(newDispo === 0 ? { statut: 'complet' } : {}),
      })
      .eq('id', parsed.data.trajet_id)
  }

  // Décrémente poids_dispo_kg quand un colis est réservé avec un poids précis
  if (parsed.data.trajet_id && parsed.data.type === 'colis' && parsed.data.poids_kg) {
    await supabase.rpc('decrement_poids_dispo', {
      trajet_id: parsed.data.trajet_id,
      poids: parsed.data.poids_kg,
    })
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
