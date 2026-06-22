import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const { nom, telephone, email, whatsapp, ville } = await request.json()

  if (!nom || !telephone || !ville) {
    return NextResponse.json({ error: 'Champs obligatoires manquants.' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  }

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('telephone', telephone)
    .neq('id', user.id)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'Ce numéro de téléphone est déjà utilisé.' }, { status: 409 })
  }

  const { error } = await supabase.from('users').upsert({
    id: user.id,
    nom,
    telephone,
    whatsapp: whatsapp || null,
    ville,
    email: email || user.email || null,
  })

  if (error) {
    console.error('[profil] upsert error:', JSON.stringify(error))
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
