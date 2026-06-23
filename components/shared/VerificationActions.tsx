'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  id: string
  type: 'cni' | 'permis' | 'vehicule' | 'vehicule-location'
}

export default function VerificationActions({ id, type }: Props) {
  const router = useRouter()
  const [motif, setMotif] = useState('')
  const [loading, setLoading] = useState<'approuver' | 'rejeter' | null>(null)
  const [error, setError] = useState('')

  function buildPatchUrl() {
    if (type === 'vehicule') return `/api/admin/verifications/vehicule/${id}`
    if (type === 'vehicule-location') return `/api/admin/verifications/vehicule-location/${id}`
    return `/api/admin/verifications/${id}`
  }

  function buildApprouverBody() {
    if (type === 'cni') return { champ: 'cni', statut: 'vérifié' }
    if (type === 'permis') return { champ: 'permis', statut: 'vérifié' }
    if (type === 'vehicule') return { statut_verification: 'vérifié' }
    return { statut_carte_grise: 'vérifié' }
  }

  function buildRejeterBody(motif: string) {
    if (type === 'cni') return { champ: 'cni', statut: 'rejeté', motif_rejet: motif }
    if (type === 'permis') return { champ: 'permis', statut: 'rejeté', motif_rejet: motif }
    if (type === 'vehicule') return { statut_verification: 'rejeté', motif_rejet: motif }
    return { statut_carte_grise: 'rejeté', motif_rejet_cg: motif }
  }

  const labelEntity = {
    cni: 'la CNI',
    permis: 'le permis',
    vehicule: 'le véhicule',
    'vehicule-location': 'la carte grise',
  }[type]

  async function approuver() {
    setLoading('approuver')
    setError('')
    const res = await fetch(buildPatchUrl(), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildApprouverBody()),
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
    const res = await fetch(buildPatchUrl(), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildRejeterBody(motif)),
    })
    if (res.ok) {
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error ?? 'Erreur lors du rejet.')
    }
    setLoading(null)
  }

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
