import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const patchSchema = z.object({
  depart_label: z.string().trim().min(2).optional(),
  depart_lat: z.number().optional().nullable(),
  depart_lng: z.number().optional().nullable(),
  arrivee_label: z.string().trim().min(2).optional(),
  arrivee_lat: z.number().optional().nullable(),
  arrivee_lng: z.number().optional().nullable(),
  date_depart: z.string().min(10).optional(),
  heure_depart: z.string().min(4).optional(),
  prix: z.number().positive().optional(),
  places_dispo: z.number().int().min(1).optional().nullable(),
  types_colis: z.array(z.string()).optional().nullable(),
  lieu_embarquement: z.string().optional().nullable(),
  lieu_debarquement: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  statut: z.enum(['actif', 'complet', 'annulé']).optional(),
})

async function getOwned(supabase: Awaited<ReturnType<typeof createClient>>, id: string, userId: string) {
  const { data } = await supabase.from('trajets').select('id, user_id').eq('id', id).single()
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

  const { error } = await supabase.from('trajets').update(parsed.data).eq('id', id)
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

  const { error } = await supabase.from('trajets').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
