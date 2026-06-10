'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const VILLES = ['Douala', 'Yaoundé', 'Bafoussam', 'Autre']

export default function ProfilCompletPage() {
  const router = useRouter()
  const [form, setForm] = useState({ nom: '', telephone: '', whatsapp: '', ville: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/profil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Erreur lors de la création du profil.')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      setError('Erreur réseau. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-form-card">
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 28 }}>Compléter votre profil</h2>
        <p style={{ marginTop: 8, color: 'var(--ink-3)', fontSize: 15 }}>
          Ces informations sont nécessaires pour utiliser la plateforme.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div className="field">
          <label className="field-label">Nom complet</label>
          <input
            className="input"
            type="text"
            placeholder="Votre nom"
            value={form.nom}
            onChange={e => update('nom', e.target.value)}
            required
            autoFocus
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="field">
            <label className="field-label">Téléphone</label>
            <input
              className="input"
              type="tel"
              placeholder="+237 6 XX XX XX XX"
              value={form.telephone}
              onChange={e => update('telephone', e.target.value)}
              required
              autoComplete="tel"
            />
          </div>
          <div className="field">
            <label className="field-label">
              WhatsApp <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optionnel)</span>
            </label>
            <input
              className="input"
              type="tel"
              placeholder="+237 6 XX XX XX XX"
              value={form.whatsapp}
              onChange={e => update('whatsapp', e.target.value)}
            />
          </div>
        </div>

        <div className="field">
          <label className="field-label">Ville</label>
          <select
            className="select"
            value={form.ville}
            onChange={e => update('ville', e.target.value)}
            required
          >
            <option value="">Sélectionner</option>
            {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        {error && <div className="notice warn" style={{ padding: '10px 14px' }}>{error}</div>}

        <button
          type="submit"
          className="btn btn-primary btn-block btn-lg"
          disabled={loading}
          style={{ marginTop: 4 }}
        >
          {loading ? 'Enregistrement…' : 'Enregistrer et continuer'}
        </button>
      </form>
    </div>
  )
}
