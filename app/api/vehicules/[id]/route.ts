import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const patchSchema = z.object({
  marque: z.string().min(1).optional(),
  modele: z.string().min(1).optional(),
  annee: z.number().int().min(1990).optional().nullable(),
  couleur: z.string().optional().nullable(),
  nb_places: z.number().int().min(1).optional(),
  carburant: z.enum(['essence', 'diesel', 'hybride']).optional().nullable(),
  boite: z.enum(['manuelle', 'automatique']).optional().nullable(),
  lieu_label: z.string().trim().min(2).optional(),
  lieu_lat: z.number().optional().nullable(),
  lieu_lng: z.number().optional().nullable(),
  prix_jour: z.number().positive().optional(),
  photos_urls: z.array(z.string()).min(1).optional(),
  equipements: z.array(z.string()).optional().nullable(),
  description: z.string().optional().nullable(),
  disponible: z.boolean().optional(),
})

async function getOwned(supabase: Awaited<ReturnType<typeof createClient>>, id: string, userId: string) {
  const { data } = await supabase.from('vehicules').select('id, user_id').eq('id', id).single()
  if (!data || data.user_id !== userId) return null
  return data
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const owned = await getOwned(supabase, id, user.id)
  if (!owned) return NextResponse.json({ error: 'Introuvable ou accès refusé' }, { status: 404 })

  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Données invalides', details: parsed.error.flatten() }, { status: 400 })

  const { error } = await supabase.from('vehicules').update(parsed.data).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const owned = await getOwned(supabase, id, user.id)
  if (!owned) return NextResponse.json({ error: 'Introuvable ou accès refusé' }, { status: 404 })

  const { error } = await supabase.from('vehicules').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
