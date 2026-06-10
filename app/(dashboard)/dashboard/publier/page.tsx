'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type ServiceType = 'covoiturage' | 'colis' | 'location'

const TYPES_COLIS = ['documents', 'petit', 'volumineux', 'fragile']
const VILLES = ['Douala', 'Yaoundé', 'Bafoussam', 'Autre']

export default function PublierPage() {
  const router = useRouter()
  const [serviceType, setServiceType] = useState<ServiceType | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Shared fields
  const [depart, setDepart] = useState('')
  const [arrivee, setArrivee] = useState('')
  const [dateDepart, setDateDepart] = useState('')
  const [heureDepart, setHeureDepart] = useState('')
  const [prix, setPrix] = useState('')
  const [description, setDescription] = useState('')

  // Covoiturage
  const [placesDispo, setPlacesDispo] = useState('3')

  // Colis
  const [typesColis, setTypesColis] = useState<string[]>([])

  // Location
  const [marque, setMarque] = useState('')
  const [modele, setModele] = useState('')
  const [annee, setAnnee] = useState('')
  const [couleur, setCouleur] = useState('')
  const [nbPlaces, setNbPlaces] = useState('5')
  const [carburant, setCarburant] = useState('')
  const [boite, setBoite] = useState('')
  const [lieuLabel, setLieuLabel] = useState('')

  function toggleColis(t: string) {
    setTypesColis(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const endpoint = serviceType === 'location' ? '/api/vehicules' : '/api/trajets'
      const body = serviceType === 'location'
        ? { marque, modele, annee: annee ? parseInt(annee) : undefined, couleur, nb_places: parseInt(nbPlaces), carburant, boite, lieu_label: lieuLabel, prix_jour: parseFloat(prix), description }
        : { type: serviceType, depart_label: depart, arrivee_label: arrivee, date_depart: dateDepart, heure_depart: heureDepart, prix: parseFloat(prix), places_dispo: serviceType === 'covoiturage' ? parseInt(placesDispo) : undefined, types_colis: serviceType === 'colis' ? typesColis : undefined, description }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Erreur lors de la publication.')
      } else {
        router.push('/dashboard/mes-annonces')
      }
    } catch {
      setError('Erreur réseau. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  if (!serviceType) {
    return (
      <>
        <div className="page-head">
          <div>
            <h1 className="page-title">Publier une annonce</h1>
            <p className="page-sub">Choisissez le type d&rsquo;annonce à publier.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, maxWidth: 800 }}>
          {([
            { id: 'covoiturage' as ServiceType, title: 'Covoiturage', desc: 'Proposez des places dans votre véhicule sur un trajet que vous effectuez déjà.' },
            { id: 'colis' as ServiceType, title: 'Transport de colis', desc: 'Acceptez de transporter des colis sur vos trajets réguliers.' },
            { id: 'location' as ServiceType, title: 'Location de véhicule', desc: 'Mettez votre véhicule à disposition pour des locations à la journée.' },
          ]).map(({ id, title, desc }) => (
            <button key={id} type="button" onClick={() => setServiceType(id)} style={{
              padding: 28,
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 18,
              textAlign: 'left',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'border-color .15s, box-shadow .15s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--primary)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'var(--shadow-md)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--line)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '' }}
            >
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--ink)', marginBottom: 10 }}>{title}</div>
              <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.5 }}>{desc}</p>
            </button>
          ))}
        </div>
      </>
    )
  }

  const typeLabel = { covoiturage: 'Covoiturage', colis: 'Transport de colis', location: 'Location de véhicule' }[serviceType]

  return (
    <>
      <div className="page-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="button" onClick={() => setServiceType(null)} className="btn btn-ghost btn-sm" style={{ padding: '0 12px' }}>← Retour</button>
          <div>
            <h1 className="page-title">Publier — {typeLabel}</h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: 640 }}>
        <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {serviceType !== 'location' ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="field">
                  <label className="field-label">Ville de départ</label>
                  <input className="input" type="text" value={depart} onChange={e => setDepart(e.target.value)} required placeholder="Ex: Douala, Akwa" />
                </div>
                <div className="field">
                  <label className="field-label">Ville d&rsquo;arrivée</label>
                  <input className="input" type="text" value={arrivee} onChange={e => setArrivee(e.target.value)} required placeholder="Ex: Yaoundé, Centre-ville" />
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
                  <input className="input" type="number" value={prix} onChange={e => setPrix(e.target.value)} required placeholder="Ex: 5000" min="0" />
                </div>
                {serviceType === 'covoiturage' && (
                  <div className="field">
                    <label className="field-label">Places disponibles</label>
                    <select className="select" value={placesDispo} onChange={e => setPlacesDispo(e.target.value)}>
                      {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                )}
              </div>
              {serviceType === 'colis' && (
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
            </>
          ) : (
            <>
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
                <input className="input" type="text" value={lieuLabel} onChange={e => setLieuLabel(e.target.value)} required placeholder="Ex: Douala, Bonapriso" />
              </div>
              <div className="field">
                <label className="field-label">Prix par jour (FCFA)</label>
                <input className="input" type="number" value={prix} onChange={e => setPrix(e.target.value)} required placeholder="Ex: 25000" min="0" />
              </div>
            </>
          )}

          <div className="field">
            <label className="field-label">Description <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optionnel)</span></label>
            <textarea className="textarea" value={description} onChange={e => setDescription(e.target.value)} placeholder="Informations utiles pour les passagers ou clients…" />
          </div>

          {error && <div className="notice warn">{error}</div>}

          <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? 'Publication…' : 'Publier l\'annonce'}
            </button>
            <button type="button" onClick={() => setServiceType(null)} className="btn btn-outline btn-lg">Annuler</button>
          </div>
        </div>
      </form>
    </>
  )
}
