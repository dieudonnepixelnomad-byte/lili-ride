'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  id: string
  type: 'trajet' | 'vehicule'
  statut: string
}

type Action = 'actif' | 'rejeté' | 'suspendu'

export default function AnnonceModerationActions({ id, type, statut }: Props) {
  const router = useRouter()
  const [motif, setMotif] = useState('')
  const [loading, setLoading] = useState<Action | null>(null)
  const [error, setError] = useState('')

  async function updateStatut(nextStatut: Action) {
    const requiresMotif = nextStatut === 'rejeté' || nextStatut === 'suspendu'
    if (requiresMotif && !motif.trim()) {
      setError(`Le motif de ${nextStatut === 'rejeté' ? 'rejet' : 'suspension'} est obligatoire.`)
      return
    }

    setLoading(nextStatut)
    setError('')
    try {
      const response = await fetch(`/api/admin/annonces/${type}/${id}/statut`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: nextStatut, motif: requiresMotif ? motif.trim() : null }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error ?? 'La décision n’a pas pu être enregistrée.')
        return
      }
      setMotif('')
      router.refresh()
    } catch {
      setError('Erreur réseau. Réessayez.')
    } finally {
      setLoading(null)
    }
  }

  const canApprove = statut !== 'actif' && statut !== 'complet' && statut !== 'annulé'
  const canReject = statut === 'en_attente'
  const canSuspend = statut === 'actif'

  if (!canApprove && !canReject && !canSuspend) return null

  return (
    <section className="card card-pad" style={{ marginTop: 24 }} aria-labelledby="moderation-title">
      <div style={{ marginBottom: 18 }}>
        <h2 id="moderation-title" style={{ fontSize: 20 }}>Décision de modération</h2>
        <p style={{ color: 'var(--ink-3)', fontSize: 13.5, marginTop: 5 }}>
          Un motif est obligatoire pour rejeter ou suspendre l’annonce.
        </p>
      </div>

      {error ? <div className="notice warn" role="alert" style={{ marginBottom: 16 }}>{error}</div> : null}

      {(canReject || canSuspend) ? (
        <div className="field" style={{ maxWidth: 620, marginBottom: 16 }}>
          <label className="field-label" htmlFor="motif-moderation">Motif de la décision</label>
          <textarea
            id="motif-moderation"
            className="textarea"
            value={motif}
            onChange={event => setMotif(event.target.value)}
            placeholder="Décrivez précisément le contenu à corriger ou la raison de la suspension."
            maxLength={500}
            rows={3}
          />
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {canApprove ? (
          <button type="button" className="btn btn-primary" onClick={() => updateStatut('actif')} disabled={loading !== null}>
            {loading === 'actif' ? 'Validation…' : statut === 'suspendu' || statut === 'rejeté' ? 'Réactiver l’annonce' : 'Valider l’annonce'}
          </button>
        ) : null}
        {canReject ? (
          <button type="button" className="btn btn-outline" onClick={() => updateStatut('rejeté')} disabled={loading !== null} style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
            {loading === 'rejeté' ? 'Rejet…' : 'Rejeter'}
          </button>
        ) : null}
        {canSuspend ? (
          <button type="button" className="btn btn-outline" onClick={() => updateStatut('suspendu')} disabled={loading !== null} style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
            {loading === 'suspendu' ? 'Suspension…' : 'Suspendre'}
          </button>
        ) : null}
      </div>
    </section>
  )
}
