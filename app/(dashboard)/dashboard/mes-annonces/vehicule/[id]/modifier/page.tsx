import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ModifierVehiculeForm from './ModifierVehiculeForm'
import type { Vehicule } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ModifierVehiculePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: vehicule } = await supabase
    .from('vehicules')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!vehicule) notFound()

  return <ModifierVehiculeForm vehicule={vehicule as Vehicule} />
}
