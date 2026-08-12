import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const schema = z.object({
  statut: z.enum(['actif', 'rejeté', 'suspendu']),
  motif: z.string().trim().max(500).optional().nullable(),
}).superRefine((data, ctx) => {
  if ((data.statut === 'rejeté' || data.statut === 'suspendu') && !data.motif) {
    ctx.addIssue({ code: 'custom', path: ['motif'], message: 'Le motif est obligatoire.' })
  }
})

interface Params {
  params: Promise<{ type: string; id: string }>
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { type, id } = await params
  if (type !== 'trajet' && type !== 'vehicule') {
    return NextResponse.json({ error: 'Type d’annonce invalide.' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Accès interdit' }, { status: 403 })
  }

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({
      error: parsed.error.issues[0]?.message ?? 'Données invalides',
      details: parsed.error.flatten(),
    }, { status: 400 })
  }

  const table = type === 'trajet' ? 'trajets' : 'vehicules'
  const findResult = type === 'vehicule'
    ? await supabase.from('vehicules').select('id, statut_carte_grise').eq('id', id).maybeSingle()
    : await supabase.from('trajets').select('id').eq('id', id).maybeSingle()
  const { data: annonce, error: findError } = findResult

  if (findError) return NextResponse.json({ error: findError.message }, { status: 500 })
  if (!annonce) return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 })
  if (type === 'vehicule' && parsed.data.statut === 'actif' && 'statut_carte_grise' in annonce && annonce.statut_carte_grise !== 'vérifié') {
    return NextResponse.json({ error: 'La carte grise doit être vérifiée avant de valider cette annonce.' }, { status: 409 })
  }

  const { error } = await supabase.from(table).update({
    statut: parsed.data.statut,
    motif_moderation: parsed.data.statut === 'actif' ? null : parsed.data.motif,
    modere_par: user.id,
    modere_le: new Date().toISOString(),
  }).eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/admin')
  revalidatePath('/admin/annonces')
  revalidatePath('/dashboard/mes-annonces')
  revalidatePath(type === 'trajet' ? '/covoiturage' : '/location')
  if (type === 'trajet') revalidatePath('/colis')

  return NextResponse.json({ ok: true })
}
