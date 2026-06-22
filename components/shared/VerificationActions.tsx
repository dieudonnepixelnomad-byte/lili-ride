'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  id: string
  type: 'conducteur' | 'vehicule'
}

export default function VerificationActions({ id, type }: Props) {
  const router = useRouter()
  const [motif, setMotif] = useState('')
  const [loading, setLoading] = useState<'approuver' | 'rejeter' | null>(null)
  const [error, setError] = useState('')

  const patchUrl = type === 'conducteur'
    ? `/api/admin/verifications/${id}`
    : `/api/admin/verifications/vehicule/${id}`

  const approuverBody = type === 'conducteur'
    ? { statut_conducteur: 'vérifié' }
    : { statut_verification: 'vérifié' }

  const rejeterBody = (motif: string) => type === 'conducteur'
    ? { statut_conducteur: 'rejeté', motif_rejet: motif }
    : { statut_verification: 'rejeté', motif_rejet: motif }

  async function approuver() {
    setLoading('approuver')
    setError('')
    const res = await fetch(patchUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(approuverBody),
    })
    if (res.ok) {
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error ?? 'Erreur lors de l\'approbation.')
    }
    setLoading(null)
  }

  async function rejeter() {
    if (!motif.trim()) {
      setError('Le motif de rejet est obligatoire.')
      return
    }
    setLoading('rejeter')
    setError('')
    const res = await fetch(patchUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rejeterBody(motif)),
    })
    if (res.ok) {
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error ?? 'Erreur lors du rejet.')
    }
    setLoading(null)
  }

  const labelEntity = type === 'conducteur' ? 'le permis' : 'le véhicule'

  return (
    <div style={{ marginTop: 24 }}>
      {error && <div className="notice warn" style={{ marginBottom: 16 }}>{error}</div>}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={approuver}
          disabled={loading !== null}
        >
          {loading === 'approuver' ? 'Approbation…' : `Approuver ${labelEntity}`}
        </button>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="input"
            value={motif}
            onChange={e => setMotif(e.target.value)}
            placeholder="Motif du rejet (obligatoire)"
            style={{ width: 280 }}
          />
          <button
            type="button"
            className="btn btn-outline"
            onClick={rejeter}
            disabled={loading !== null}
            style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
          >
            {loading === 'rejeter' ? 'Rejet…' : 'Rejeter'}
          </button>
        </div>
      </div>
    </div>
  )
}
