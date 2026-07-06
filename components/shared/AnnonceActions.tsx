'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Props {
  type: 'trajet' | 'vehicule'
  id: string
  label: string
}

export default function AnnonceActions({ type, id, label }: Props) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const editHref = type === 'trajet'
    ? `/dashboard/mes-annonces/trajet/${id}/modifier`
    : `/dashboard/mes-annonces/vehicule/${id}/modifier`

  const demandeursHref = type === 'trajet'
    ? `/dashboard/mes-annonces/trajet/${id}/demandeurs`
    : `/dashboard/mes-annonces/vehicule/${id}/demandeurs`

  const apiPath = type === 'trajet' ? `/api/trajets/${id}` : `/api/vehicules/${id}`

  async function handleDelete() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(apiPath, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Erreur lors de la suppression.')
        setLoading(false)
        setConfirming(false)
        return
      }
      router.refresh()
    } catch {
      setError('Erreur réseau.')
      setLoading(false)
      setConfirming(false)
    }
  }

  if (confirming) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
        <div style={{ fontSize: 12.5, color: 'var(--ink-2)', whiteSpace: 'nowrap' }}>Supprimer &laquo;{label}&raquo; ?</div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={handleDelete}
            disabled={loading}
            style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, background: 'var(--danger)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            {loading ? '…' : 'Confirmer'}
          </button>
          <button
            onClick={() => setConfirming(false)}
            style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, background: 'var(--surface)', color: 'var(--ink-2)', border: '1px solid var(--line)', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Annuler
          </button>
        </div>
        {error && <div style={{ fontSize: 12, color: 'var(--danger)' }}>{error}</div>}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <Link
        href={demandeursHref}
        style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, background: 'var(--surface)', color: 'var(--ink)', border: '1px solid var(--line)', textDecoration: 'none', whiteSpace: 'nowrap' }}
      >
        Voir demandeurs
      </Link>
      <Link
        href={editHref}
        style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, background: 'var(--surface)', color: 'var(--ink)', border: '1px solid var(--line)', textDecoration: 'none', whiteSpace: 'nowrap' }}
      >
        Modifier
      </Link>
      <button
        onClick={() => setConfirming(true)}
        style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, background: 'transparent', color: 'var(--danger)', border: '1px solid var(--danger)', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
      >
        Supprimer
      </button>
    </div>
  )
}
