'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { TypeDemande } from '@/types'

interface Props {
  trajetId?: string
  vehiculeId?: string
  type: TypeDemande
  prix?: number
  prixLabel?: string
  placesDisponibles?: number | null
  poidsDispoKg?: number | null
  trajetStatut?: string
}

type AuthCheck = 'loading' | 'no_auth' | 'no_photo' | 'ok'

export default function DemandeForm({ trajetId, vehiculeId, type, prix, prixLabel, placesDisponibles, poidsDispoKg, trajetStatut }: Props) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [authCheck, setAuthCheck] = useState<AuthCheck>('loading')

  useEffect(() => {
    async function check() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setAuthCheck('no_auth'); return }
        const { data } = await supabase.from('users').select('photo_url').eq('id', user.id).single()
        setAuthCheck(data?.photo_url ? 'ok' : 'no_photo')
      } catch {
        // En cas d'erreur réseau on laisse accéder — l'API bloquera côté serveur
        setAuthCheck('ok')
      }
    }
    check()
  }, [supabase])

  const [form, setForm] = useState({
    nom: '',
    telephone: '',
    whatsapp: '',
    nb_places: '1',
    description_colis: '',
    poids_estime: '',
    poids_kg: '',
    date_debut: '',
    date_fin: '',
    message: '',
  })
  const [success, setSuccess] = useState(false)
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
      const body: Record<string, unknown> = {
        type,
        nom_client: form.nom,
        telephone: form.telephone,
        whatsapp: form.whatsapp || undefined,
        message: form.message || undefined,
      }
      if (trajetId) body.trajet_id = trajetId
      if (vehiculeId) body.vehicule_id = vehiculeId
      if (type === 'covoiturage') body.nb_places = parseInt(form.nb_places)
      if (type === 'colis') {
        body.description_colis = form.description_colis
        body.poids_estime = form.poids_estime || undefined
        if (form.poids_kg) body.poids_kg = parseFloat(form.poids_kg)
      }
      if (type === 'location') {
        body.date_debut = form.date_debut
        body.date_fin = form.date_fin
      }

      const res = await fetch('/api/demandes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Erreur lors de l\'envoi.')
      } else {
        setSuccess(true)
      }
    } catch {
      setError('Erreur réseau. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  if (authCheck === 'loading') {
    return (
      <div className="card card-pad" style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ color: 'var(--ink-3)', fontSize: 14 }}>Vérification…</div>
      </div>
    )
  }

  if (authCheck === 'no_auth') {
    return (
      <div className="card card-pad" style={{ textAlign: 'center', padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {prix && (
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: 'var(--primary-deep)' }}>
            {prix.toLocaleString('fr-FR')} FCFA
          </div>
        )}
        <div style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.6 }}>
          Connectez-vous pour réserver.
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button type="button" className="btn btn-primary btn-lg" onClick={() => router.push('/connexion')}>Se connecter</button>
          <button type="button" className="btn btn-outline btn-lg" onClick={() => router.push('/inscription')}>Créer un compte</button>
        </div>
      </div>
    )
  }

  if (authCheck === 'no_photo') {
    return (
      <div className="card card-pad" style={{ textAlign: 'center', padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {prix && (
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: 'var(--primary-deep)' }}>
            {prix.toLocaleString('fr-FR')} FCFA
          </div>
        )}
        <div style={{ fontSize: 24 }}>📷</div>
        <div style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.6 }}>
          Ajoutez une photo de profil pour réserver.
        </div>
        <button type="button" className="btn btn-primary btn-lg" onClick={() => router.push('/dashboard/profil')}>
          Compléter mon profil
        </button>
      </div>
    )
  }

  const isComplet =
    trajetStatut === 'complet' ||
    (type === 'covoiturage' && placesDisponibles != null && placesDisponibles <= 0) ||
    (type === 'colis' && poidsDispoKg != null && poidsDispoKg <= 0)

  if (isComplet) {
    return (
      <div className="card card-pad" style={{ textAlign: 'center', padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {prix && (
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: 'var(--primary-deep)' }}>
            {prix.toLocaleString('fr-FR')} FCFA
          </div>
        )}
        <div style={{ fontSize: 32 }}>🔒</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>
          {type === 'covoiturage' ? 'Trajet complet' : 'Capacité épuisée'}
        </div>
        <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6 }}>
          {type === 'covoiturage'
            ? 'Toutes les places ont été réservées.'
            : 'La capacité de transport est épuisée pour ce trajet.'}
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="card card-pad" style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 40 }}>✅</div>
        <h3 style={{ marginTop: 16, fontSize: 22 }}>Demande envoyée !</h3>
        <p style={{ marginTop: 8, color: 'var(--ink-3)', lineHeight: 1.6 }}>
          Notre équipe vous contactera sous peu au <strong>{form.telephone}</strong> pour confirmer les détails.
        </p>
      </div>
    )
  }

  const typeLabels: Record<TypeDemande, string> = {
    covoiturage: 'Réserver une place',
    colis: 'Envoyer un colis',
    location: 'Louer ce véhicule',
  }

  return (
    <div className="card card-pad">
      {prix && (
        <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--line)' }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: 'var(--primary-deep)' }}>
            {prix.toLocaleString('fr-FR')} FCFA
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 2 }}>
            {prixLabel ?? (type === 'covoiturage' ? 'par place' : type === 'location' ? 'par jour' : '')}
          </div>
        </div>
      )}

      <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 20, color: 'var(--ink)' }}>
        {typeLabels[type]}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="field">
          <label className="field-label">Nom complet</label>
          <input className="input" type="text" placeholder="Votre nom" value={form.nom} onChange={e => update('nom', e.target.value)} required />
        </div>
        <div className="field">
          <label className="field-label">Téléphone</label>
          <input className="input" type="tel" placeholder="+237 6 XX XX XX XX" value={form.telephone} onChange={e => update('telephone', e.target.value)} required />
        </div>
        <div className="field">
          <label className="field-label">WhatsApp <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optionnel)</span></label>
          <input className="input" type="tel" placeholder="+237 6 XX XX XX XX" value={form.whatsapp} onChange={e => update('whatsapp', e.target.value)} />
        </div>

        {type === 'covoiturage' && (
          <div className="field">
            <label className="field-label">Nombre de places</label>
            <select className="select" value={form.nb_places} onChange={e => update('nb_places', e.target.value)}>
              {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} place{n > 1 ? 's' : ''}</option>)}
            </select>
          </div>
        )}

        {type === 'colis' && (
          <>
            <div className="field">
              <label className="field-label">Description du colis</label>
              <textarea className="textarea" placeholder="Nature, dimensions approximatives…" value={form.description_colis} onChange={e => update('description_colis', e.target.value)} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field">
                <label className="field-label">Poids (kg)</label>
                <input className="input" type="number" placeholder="Ex: 5" min="0.1" step="0.1"
                  value={form.poids_kg} onChange={e => update('poids_kg', e.target.value)} />
                {poidsDispoKg != null && (
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>
                    Capacité restante : {poidsDispoKg} kg
                  </div>
                )}
              </div>
              <div className="field">
                <label className="field-label">Description du poids <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optionnel)</span></label>
                <input className="input" type="text" placeholder="Ex: carton, fragile…" value={form.poids_estime} onChange={e => update('poids_estime', e.target.value)} />
              </div>
            </div>
          </>
        )}

        {type === 'location' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field">
              <label className="field-label">Date de début</label>
              <input className="input" type="date" value={form.date_debut} onChange={e => update('date_debut', e.target.value)} required />
            </div>
            <div className="field">
              <label className="field-label">Date de fin</label>
              <input className="input" type="date" value={form.date_fin} onChange={e => update('date_fin', e.target.value)} required />
            </div>
          </div>
        )}

        <div className="field">
          <label className="field-label">Message <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optionnel)</span></label>
          <textarea className="textarea" placeholder="Informations complémentaires…" value={form.message} onChange={e => update('message', e.target.value)} style={{ minHeight: 72 }} />
        </div>

        {error && <div className="notice warn" style={{ padding: '10px 14px' }}>{error}</div>}

        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ marginTop: 4 }}>
          {loading ? 'Envoi…' : typeLabels[type]}
        </button>

        <p style={{ fontSize: 12.5, color: 'var(--muted)', textAlign: 'center' }}>
          Notre équipe vous contactera pour confirmer.
        </p>
      </form>
    </div>
  )
}
