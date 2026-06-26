import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ModifierTrajetForm from './ModifierTrajetForm'
import type { Trajet } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ModifierTrajetPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: trajet } = await supabase
    .from('trajets')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!trajet) notFound()

  return <ModifierTrajetForm trajet={trajet as Trajet} />
}
