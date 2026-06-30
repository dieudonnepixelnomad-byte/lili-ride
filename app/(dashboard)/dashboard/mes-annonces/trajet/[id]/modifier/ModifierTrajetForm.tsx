'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AddressAutocomplete from '@/components/shared/AddressAutocomplete'
import type { AddressSelection } from '@/components/shared/AddressAutocomplete'
import type { Trajet } from '@/types'

const TYPES_COLIS = ['documents', 'petit', 'volumineux', 'fragile']

interface Props {
  trajet: Trajet
}

interface AddressState {
  label: string
  lat?: number
  lng?: number
}

export default function ModifierTrajetForm({ trajet }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [depart, setDepart] = useState<AddressState>({ label: trajet.depart_label, lat: trajet.depart_lat, lng: trajet.depart_lng })
  const [arrivee, setArrivee] = useState<AddressState>({ label: trajet.arrivee_label, lat: trajet.arrivee_lat, lng: trajet.arrivee_lng })
  const [dateDepart, setDateDepart] = useState(trajet.date_depart)
  const [heureDepart, setHeureDepart] = useState(trajet.heure_depart.slice(0, 5))
  const [prix, setPrix] = useState(String(trajet.prix))
  const [placesDispo, setPlacesDispo] = useState(String(trajet.places_dispo ?? 3))
  const [typesColis, setTypesColis] = useState<string[]>(trajet.types_colis ?? [])
  const [lieuEmbarquement, setLieuEmbarquement] = useState(trajet.lieu_embarquement ?? '')
  const [lieuDebarquement, setLieuDebarquement] = useState(trajet.lieu_debarquement ?? '')
  const [description, setDescription] = useState(trajet.description ?? '')
  const [statut, setStatut] = useState(trajet.statut)

  function toggleColis(t: string) {
    setTypesColis(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const body: Record<string, unknown> = {
        depart_label: depart.label,
        depart_lat: depart.lat ?? null,
        depart_lng: depart.lng ?? null,
        arrivee_label: arrivee.label,
        arrivee_lat: arrivee.lat ?? null,
        arrivee_lng: arrivee.lng ?? null,
        date_depart: dateDepart,
        heure_depart: heureDepart,
        prix: parseFloat(prix),
        lieu_embarquement: lieuEmbarquement || null,
        lieu_debarquement: lieuDebarquement || null,
        description: description || null,
        statut,
      }
      if (trajet.type === 'covoiturage') {
        body.places_dispo = parseInt(placesDispo)
      }
      if (trajet.type === 'colis') {
        body.types_colis = typesColis
      }

      const res = await fetch(`/api/trajets/${trajet.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Erreur lors de la mise à jour.')
      } else {
        router.push('/dashboard/mes-annonces')
        router.refresh()
      }
    } catch {
      setError('Erreur réseau. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  const typeLabel = trajet.type === 'covoiturage' ? 'Covoiturage' : 'Transport de colis (par avion)'

  return (
    <>
      <div className="page-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="button" onClick={() => router.back()} className="btn btn-ghost btn-sm" style={{ padding: '0 12px' }}>← Retour</button>
          <div>
            <h1 className="page-title">Modifier — {typeLabel}</h1>
            <p className="page-sub">{trajet.depart_label} → {trajet.arrivee_label}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: 640 }}>
        <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="field">
              <label className="field-label">Ville de départ</label>
              <AddressAutocomplete
                value={depart.label}
                onChange={(val) => setDepart({ label: val })}
                onSelect={(sel: AddressSelection) => setDepart(sel)}
                placeholder="Ex: Douala, Akwa"
                inputClassName="input"
                required
              />
            </div>
            <div className="field">
              <label className="field-label">Ville d&rsquo;arrivée</label>
              <AddressAutocomplete
                value={arrivee.label}
                onChange={(val) => setArrivee({ label: val })}
                onSelect={(sel: AddressSelection) => setArrivee(sel)}
                placeholder="Ex: Yaoundé, Centre-ville"
                inputClassName="input"
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="field">
              <label className="field-label">Date de départ</label>
              <input className="input" type="date" value={dateDepart} onChange={e => setDateDepart(e.target.value)} required />
            </div>
            <div className="field">
              <label className="field-label">Heure de départ</label>
              <input className="input" type="time" value={heureDepart} onChange={e => setHeureDepart(e.target.value)} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="field">
              <label className="field-label">Prix (FCFA)</label>
              <input className="input" type="number" value={prix} onChange={e => setPrix(e.target.value)} required min="0" />
            </div>
            {trajet.type === 'covoiturage' && (
              <div className="field">
                <label className="field-label">Places disponibles</label>
                <select className="select" value={placesDispo} onChange={e => setPlacesDispo(e.target.value)}>
                  {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="field">
              <label className="field-label">Lieu d'embarquement <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optionnel)</span></label>
              <input className="input" type="text" value={lieuEmbarquement} onChange={e => setLieuEmbarquement(e.target.value)} placeholder="Ex: Carrefour Akwa, face BICEC" />
            </div>
            <div className="field">
              <label className="field-label">Lieu de débarquement <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optionnel)</span></label>
              <input className="input" type="text" value={lieuDebarquement} onChange={e => setLieuDebarquement(e.target.value)} placeholder="Ex: Gare routière de Messa" />
            </div>
          </div>

          {trajet.type === 'colis' && (
            <div className="field">
              <label className="field-label">Types de colis acceptés</label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
                {TYPES_COLIS.map(t => (
                  <label key={t} className="checkbox-row">
                    <input type="checkbox" checked={typesColis.includes(t)} onChange={() => toggleColis(t)} />
                    <span style={{ fontSize: 14, textTransform: 'capitalize' }}>{t}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="field">
            <label className="field-label">Statut</label>
            <select className="select" value={statut} onChange={e => setStatut(e.target.value as typeof statut)}>
              <option value="actif">Actif</option>
              <option value="complet">Complet</option>
              <option value="annulé">Annulé</option>
            </select>
          </div>

          <div className="field">
            <label className="field-label">Description <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optionnel)</span></label>
            <textarea className="textarea" value={description} onChange={e => setDescription(e.target.value)} placeholder="Informations utiles pour les passagers ou clients…" />
          </div>

          {error && <div className="notice warn">{error}</div>}

          <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? 'Enregistrement…' : 'Enregistrer les modifications'}
            </button>
            <button type="button" onClick={() => router.back()} className="btn btn-outline btn-lg">Annuler</button>
          </div>
        </div>
      </form>
    </>
  )
}
