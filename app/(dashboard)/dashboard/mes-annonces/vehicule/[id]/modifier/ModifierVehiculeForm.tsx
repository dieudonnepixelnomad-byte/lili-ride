'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AddressAutocomplete from '@/components/shared/AddressAutocomplete'
import type { AddressSelection } from '@/components/shared/AddressAutocomplete'
import type { Vehicule } from '@/types'

const EQUIPEMENTS_VEHICULE = [
  'Climatisation', 'GPS / Navigation', 'Bluetooth / Audio', 'Airbag', 'ABS',
  'Caméra de recul', 'Vitres électriques', 'Toit ouvrant', 'Galerie de toit',
  '4x4 / 4 roues motrices', 'Porte-bagages', 'Chargeur USB',
]

interface Props {
  vehicule: Vehicule
}

interface AddressState {
  label: string
  lat?: number
  lng?: number
}

export default function ModifierVehiculeForm({ vehicule }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [marque, setMarque] = useState(vehicule.marque)
  const [modele, setModele] = useState(vehicule.modele)
  const [annee, setAnnee] = useState(vehicule.annee ? String(vehicule.annee) : '')
  const [couleur, setCouleur] = useState(vehicule.couleur ?? '')
  const [nbPlaces, setNbPlaces] = useState(String(vehicule.nb_places))
  const [carburant, setCarburant] = useState(vehicule.carburant ?? '')
  const [boite, setBoite] = useState(vehicule.boite ?? '')
  const [lieu, setLieu] = useState<AddressState>({ label: vehicule.lieu_label, lat: vehicule.lieu_lat, lng: vehicule.lieu_lng })
  const [prixJour, setPrixJour] = useState(String(vehicule.prix_jour))
  const [existingPhotos, setExistingPhotos] = useState<string[]>(vehicule.photos_urls)
  const [newPhotos, setNewPhotos] = useState<File[]>([])
  const [equipements, setEquipements] = useState<string[]>((vehicule as Vehicule & { equipements?: string[] }).equipements ?? [])
  const [description, setDescription] = useState(vehicule.description ?? '')
  const [disponible, setDisponible] = useState(vehicule.disponible)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function toggleEquipement(eq: string) {
    setEquipements(prev => prev.includes(eq) ? prev.filter(x => x !== eq) : [...prev, eq])
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const total = existingPhotos.length + newPhotos.length
    const remaining = 5 - total
    setNewPhotos(prev => [...prev, ...files].slice(0, prev.length + remaining))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removeExistingPhoto(index: number) {
    setExistingPhotos(prev => prev.filter((_, i) => i !== index))
  }

  function removeNewPhoto(index: number) {
    setNewPhotos(prev => prev.filter((_, i) => i !== index))
  }

  async function uploadNewPhotos(): Promise<string[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Non authentifié')
    const urls: string[] = []
    for (const file of newPhotos) {
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadErr } = await supabase.storage.from('vehicules').upload(path, file)
      if (uploadErr) throw new Error(`Upload échoué : ${uploadErr.message}`)
      const { data: { publicUrl } } = supabase.storage.from('vehicules').getPublicUrl(path)
      urls.push(publicUrl)
    }
    return urls
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const totalPhotos = existingPhotos.length + newPhotos.length
    if (totalPhotos === 0) {
      setError('Au moins une photo est requise.')
      return
    }

    setLoading(true)
    try {
      const uploadedUrls = newPhotos.length > 0 ? await uploadNewPhotos() : []
      const allPhotos = [...existingPhotos, ...uploadedUrls]

      const body = {
        marque, modele,
        annee: annee ? parseInt(annee) : null,
        couleur: couleur || null,
        nb_places: parseInt(nbPlaces),
        carburant: carburant || null,
        boite: boite || null,
        lieu_label: lieu.label.trim(),
        lieu_lat: lieu.lat ?? null,
        lieu_lng: lieu.lng ?? null,
        prix_jour: parseFloat(prixJour),
        photos_urls: allPhotos,
        equipements,
        description: description || null,
        disponible,
      }

      const res = await fetch(`/api/vehicules/${vehicule.id}`, {
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur réseau. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  const totalPhotos = existingPhotos.length + newPhotos.length

  return (
    <>
      <div className="page-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="button" onClick={() => router.back()} className="btn btn-ghost btn-sm" style={{ padding: '0 12px' }}>← Retour</button>
          <div>
            <h1 className="page-title">Modifier — Location</h1>
            <p className="page-sub">{vehicule.marque} {vehicule.modele}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: 640 }}>
        <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="field">
              <label className="field-label">Marque</label>
              <input className="input" type="text" value={marque} onChange={e => setMarque(e.target.value)} required placeholder="Ex: Toyota" />
            </div>
            <div className="field">
              <label className="field-label">Modèle</label>
              <input className="input" type="text" value={modele} onChange={e => setModele(e.target.value)} required placeholder="Ex: Land Cruiser" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div className="field">
              <label className="field-label">Année</label>
              <input className="input" type="number" value={annee} onChange={e => setAnnee(e.target.value)} placeholder="Ex: 2019" />
            </div>
            <div className="field">
              <label className="field-label">Couleur</label>
              <input className="input" type="text" value={couleur} onChange={e => setCouleur(e.target.value)} placeholder="Ex: Blanc" />
            </div>
            <div className="field">
              <label className="field-label">Nb places</label>
              <input className="input" type="number" value={nbPlaces} onChange={e => setNbPlaces(e.target.value)} required min="1" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="field">
              <label className="field-label">Carburant</label>
              <select className="select" value={carburant} onChange={e => setCarburant(e.target.value)}>
                <option value="">—</option>
                <option value="essence">Essence</option>
                <option value="diesel">Diesel</option>
                <option value="hybride">Hybride</option>
              </select>
            </div>
            <div className="field">
              <label className="field-label">Boîte</label>
              <select className="select" value={boite} onChange={e => setBoite(e.target.value)}>
                <option value="">—</option>
                <option value="manuelle">Manuelle</option>
                <option value="automatique">Automatique</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label className="field-label">Lieu de disponibilité</label>
            <AddressAutocomplete
              value={lieu.label}
              onChange={(val) => setLieu({ label: val })}
              onSelect={(sel: AddressSelection) => setLieu(sel)}
              placeholder="Ex: Douala, Bonapriso"
              inputClassName="input"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="field">
              <label className="field-label">Prix par jour (FCFA)</label>
              <input className="input" type="number" value={prixJour} onChange={e => setPrixJour(e.target.value)} required min="0" />
            </div>
            <div className="field">
              <label className="field-label">Disponibilité</label>
              <select className="select" value={disponible ? 'oui' : 'non'} onChange={e => setDisponible(e.target.value === 'oui')}>
                <option value="oui">Disponible</option>
                <option value="non">Non disponible</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label className="field-label">Équipements <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optionnel)</span></label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px 16px', marginTop: 8 }}>
              {EQUIPEMENTS_VEHICULE.map(eq => (
                <label key={eq} className="checkbox-row">
                  <input type="checkbox" checked={equipements.includes(eq)} onChange={() => toggleEquipement(eq)} />
                  <span style={{ fontSize: 14 }}>{eq}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="field">
            <label className="field-label">
              Photos du véhicule <span style={{ color: 'var(--muted)', fontWeight: 400 }}>({totalPhotos}/5 — min 1)</span>
            </label>
            {(existingPhotos.length > 0 || newPhotos.length > 0) && (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                {existingPhotos.map((url, i) => (
                  <div key={url} style={{ position: 'relative', width: 90, height: 70 }}>
                    <img src={url} alt={`Photo ${i + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8, border: '1px solid var(--line)' }} />
                    <button type="button" onClick={() => removeExistingPhoto(i)}
                      style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: 'var(--danger)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      ×
                    </button>
                  </div>
                ))}
                {newPhotos.map((file, i) => (
                  <div key={i} style={{ position: 'relative', width: 90, height: 70 }}>
                    <img src={URL.createObjectURL(file)} alt={`Nouvelle photo ${i + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8, border: '2px dashed var(--primary)' }} />
                    <button type="button" onClick={() => removeNewPhoto(i)}
                      style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: 'var(--danger)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            {totalPhotos < 5 && (
              <>
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handlePhotoChange} style={{ display: 'none' }} />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="btn btn-outline btn-sm">
                  + Ajouter des photos
                </button>
              </>
            )}
          </div>

          <div className="field">
            <label className="field-label">Description <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optionnel)</span></label>
            <textarea className="textarea" value={description} onChange={e => setDescription(e.target.value)} placeholder="Informations utiles pour les locataires…" />
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
