'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AddressAutocomplete from '@/components/shared/AddressAutocomplete'
import type { AddressSelection } from '@/components/shared/AddressAutocomplete'
import type { VehiculeTransporteur } from '@/types'

interface AddressState {
  label: string
  lat?: number
  lng?: number
}

type ServiceType = 'covoiturage' | 'colis' | 'location'
type VerifStatus =
  | 'idle'
  | 'checking'
  | 'ok'
  | 'cni_non_soumis'
  | 'cni_en_attente'
  | 'cni_rejeté'
  | 'permis_non_soumis'
  | 'permis_en_attente'
  | 'permis_rejeté'
  | 'vehicule_manquant'

const TYPES_COLIS = ['documents', 'petit', 'volumineux', 'fragile']
const EQUIPEMENTS_VEHICULE = [
  'Climatisation',
  'GPS / Navigation',
  'Bluetooth / Audio',
  'Airbag',
  'ABS',
  'Caméra de recul',
  'Vitres électriques',
  'Toit ouvrant',
  'Galerie de toit',
  '4x4 / 4 roues motrices',
  'Porte-bagages',
  'Chargeur USB',
]

export default function PublierPage() {
  const router = useRouter()
  const supabase = createClient()
  const [serviceType, setServiceType] = useState<ServiceType | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [verifStatus, setVerifStatus] = useState<VerifStatus>('idle')
  const [motifRejetCni, setMotifRejetCni] = useState('')
  const [motifRejetPermis, setMotifRejetPermis] = useState('')
  const [verifiedVehicules, setVerifiedVehicules] = useState<VehiculeTransporteur[]>([])
  const [selectedVehiculeId, setSelectedVehiculeId] = useState('')

  // Shared fields
  const [depart, setDepart] = useState<AddressState>({ label: '' })
  const [arrivee, setArrivee] = useState<AddressState>({ label: '' })
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
  const [lieu, setLieu] = useState<AddressState>({ label: '' })
  const [photos, setPhotos] = useState<File[]>([])
  const [equipements, setEquipements] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleSelectService(type: ServiceType) {
    setServiceType(type)
    setVerifStatus('checking')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setVerifStatus('cni_non_soumis'); return }

    const { data: profil } = await supabase
      .from('profils_transporteur')
      .select('statut_cni, motif_rejet_cni, statut_permis, motif_rejet_permis')
      .eq('user_id', user.id)
      .maybeSingle()

    // CNI required for all services
    if (!profil || profil.statut_cni === 'non_soumis') {
      setVerifStatus('cni_non_soumis'); return
    }
    if (profil.statut_cni === 'en_attente') {
      setVerifStatus('cni_en_attente'); return
    }
    if (profil.statut_cni === 'rejeté') {
      setMotifRejetCni(profil.motif_rejet_cni ?? '')
      setVerifStatus('cni_rejeté'); return
    }

    if (type === 'location') {
      // Location: CNI only
      setVerifStatus('ok')
      return
    }

    // Covoiturage / colis: CNI + permis + at least one verified vehicle
    if (!profil.statut_permis || profil.statut_permis === 'non_soumis') {
      setVerifStatus('permis_non_soumis'); return
    }
    if (profil.statut_permis === 'en_attente') {
      setVerifStatus('permis_en_attente'); return
    }
    if (profil.statut_permis === 'rejeté') {
      setMotifRejetPermis(profil.motif_rejet_permis ?? '')
      setVerifStatus('permis_rejeté'); return
    }

    const { data: vehicules } = await supabase
      .from('vehicules_transporteur')
      .select('*')
      .eq('user_id', user.id)
      .eq('statut_verification', 'vérifié')

    if (!vehicules || vehicules.length === 0) {
      setVerifStatus('vehicule_manquant'); return
    }

    setVerifiedVehicules(vehicules as VehiculeTransporteur[])
    setSelectedVehiculeId(vehicules[0].id)
    setVerifStatus('ok')
  }

  function toggleColis(t: string) {
    setTypesColis(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  function toggleEquipement(t: string) {
    setEquipements(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    setPhotos(prev => [...prev, ...files].slice(0, 5))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removePhoto(index: number) {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  async function uploadPhotos(): Promise<string[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Non authentifié')

    const urls: string[] = []
    for (const file of photos) {
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

    if (serviceType === 'location' && photos.length === 0) {
      setError('Ajoutez au moins une photo du véhicule.')
      return
    }

    if ((serviceType === 'covoiturage' || serviceType === 'colis') && !selectedVehiculeId) {
      setError('Sélectionnez un véhicule.')
      return
    }

    if ((serviceType === 'covoiturage' || serviceType === 'colis') && (!depart.lat || !arrivee.lat)) {
      setError('Sélectionnez le départ et l\'arrivée depuis les suggestions de la liste.')
      return
    }

    if (serviceType === 'location' && !lieu.lat) {
      setError('Sélectionnez le lieu depuis les suggestions de la liste.')
      return
    }

    setLoading(true)
    try {
      let body: Record<string, unknown>

      if (serviceType === 'location') {
        const photosUrls = await uploadPhotos()
        body = {
          marque, modele,
          annee: annee ? parseInt(annee) : undefined,
          couleur, nb_places: parseInt(nbPlaces), carburant, boite,
          lieu_label: lieu.label,
          lieu_lat: lieu.lat,
          lieu_lng: lieu.lng,
          prix_jour: parseFloat(prix),
          photos_urls: photosUrls, equipements, description,
        }
      } else {
        body = {
          vehicule_transporteur_id: selectedVehiculeId,
          type: serviceType,
          depart_label: depart.label,
          depart_lat: depart.lat,
          depart_lng: depart.lng,
          arrivee_label: arrivee.label,
          arrivee_lat: arrivee.lat,
          arrivee_lng: arrivee.lng,
          date_depart: dateDepart, heure_depart: heureDepart,
          prix: parseFloat(prix),
          places_dispo: serviceType === 'covoiturage' ? parseInt(placesDispo) : undefined,
          types_colis: serviceType === 'colis' ? typesColis : undefined,
          description,
        }
      }

      const endpoint = serviceType === 'location' ? '/api/vehicules' : '/api/trajets'
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur réseau. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  // ── Choix du service ──
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
            <button key={id} type="button" onClick={() => handleSelectService(id)} style={{
              padding: 28, background: 'var(--surface)', border: '1px solid var(--line)',
              borderRadius: 18, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
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

  // ── Gate de vérification ──
  if (verifStatus === 'checking') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320, gap: 16 }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--line)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--ink-2)', fontSize: 15 }}>Vérification de votre profil…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (verifStatus !== 'ok' && verifStatus !== 'idle') {
    const configs: Record<Exclude<VerifStatus, 'idle' | 'checking' | 'ok'>, {
      icon: string; title: string; text: string; motif?: string; cta: { label: string; href: string } | null
    }> = {
      cni_non_soumis: {
        icon: '📋',
        title: 'Carte Nationale d\'Identité manquante',
        text: 'Votre CNI (recto + verso) n\'a pas encore été soumise. Ajoutez-la dans votre profil transporteur et soumettez-la pour vérification.',
        cta: { label: 'Compléter mon profil', href: '/dashboard/profil' },
      },
      cni_en_attente: {
        icon: '⏳',
        title: 'CNI en cours de vérification',
        text: 'Votre Carte Nationale d\'Identité est en cours d\'examen par notre équipe. Vous serez débloqué dès validation — généralement sous 24h.',
        cta: null,
      },
      cni_rejeté: {
        icon: '⚠️',
        title: 'CNI rejetée',
        text: 'Votre Carte Nationale d\'Identité a été rejetée. Corrigez le document et soumettez-le à nouveau.',
        motif: motifRejetCni,
        cta: { label: 'Corriger ma CNI', href: '/dashboard/profil' },
      },
      permis_non_soumis: {
        icon: '📋',
        title: 'Permis de conduire manquant',
        text: 'Votre CNI est vérifiée. Il vous reste à fournir votre permis de conduire et le soumettre pour validation avant de pouvoir publier.',
        cta: { label: 'Compléter mon profil', href: '/dashboard/profil' },
      },
      permis_en_attente: {
        icon: '⏳',
        title: 'Permis en cours de vérification',
        text: 'Votre CNI est validée. Notre équipe vérifie maintenant votre permis de conduire. Vous pourrez publier dès validation — généralement sous 24h.',
        cta: null,
      },
      permis_rejeté: {
        icon: '⚠️',
        title: 'Permis rejeté',
        text: 'Votre permis de conduire a été rejeté. Corrigez le document et soumettez-le à nouveau.',
        motif: motifRejetPermis,
        cta: { label: 'Corriger mon permis', href: '/dashboard/profil' },
      },
      vehicule_manquant: {
        icon: '🚗',
        title: 'Aucun véhicule vérifié',
        text: 'Votre CNI et votre permis sont validés. Il vous reste à ajouter un véhicule avec sa carte grise et le soumettre pour vérification.',
        cta: { label: 'Gérer mes véhicules', href: '/dashboard/profil' },
      },
    }

    const cfg = configs[verifStatus as keyof typeof configs]
    const typeLabel = { covoiturage: 'Covoiturage', colis: 'Transport de colis', location: 'Location de véhicule' }[serviceType]

    return (
      <>
        <div className="page-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button type="button" onClick={() => { setServiceType(null); setVerifStatus('idle') }} className="btn btn-ghost btn-sm" style={{ padding: '0 12px' }}>← Retour</button>
            <h1 className="page-title">{typeLabel}</h1>
          </div>
        </div>

        <div style={{ maxWidth: 520 }}>
          <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 20, padding: '48px 40px' }}>
            <div style={{ fontSize: 56, lineHeight: 1 }}>{cfg.icon}</div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--ink)', marginBottom: 12 }}>{cfg.title}</h2>
              <p style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.7, maxWidth: 400 }}>{cfg.text}</p>
            </div>
            {cfg.motif && (
              <div className="notice warn" style={{ textAlign: 'left', width: '100%' }}>
                <strong>Motif :</strong> {cfg.motif}
              </div>
            )}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              {cfg.cta && (
                <button type="button" className="btn btn-primary btn-lg" onClick={() => router.push(cfg.cta!.href)}>
                  {cfg.cta.label}
                </button>
              )}
              <button type="button" className="btn btn-outline btn-lg" onClick={() => { setServiceType(null); setVerifStatus('idle') }}>
                Retour au choix
              </button>
            </div>
          </div>
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
              {/* Sélecteur de véhicule */}
              {verifiedVehicules.length > 0 && (
                <div className="field">
                  <label className="field-label">Véhicule utilisé pour ce trajet</label>
                  <select className="select" value={selectedVehiculeId} onChange={e => setSelectedVehiculeId(e.target.value)} required>
                    {verifiedVehicules.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.marque && v.modele ? `${v.marque} ${v.modele}` : 'Véhicule'}{v.type_vehicule ? ` (${v.type_vehicule})` : ''}{v.plaque ? ` — ${v.plaque}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
                <AddressAutocomplete
                  value={lieu.label}
                  onChange={(val) => setLieu({ label: val })}
                  onSelect={(sel: AddressSelection) => setLieu(sel)}
                  placeholder="Ex: Douala, Bonapriso"
                  inputClassName="input"
                  required
                />
              </div>
              <div className="field">
                <label className="field-label">Prix par jour (FCFA)</label>
                <input className="input" type="number" value={prix} onChange={e => setPrix(e.target.value)} required placeholder="Ex: 25000" min="0" />
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
                  Photos du véhicule <span style={{ color: 'var(--muted)', fontWeight: 400 }}>({photos.length}/5 — min 1)</span>
                </label>
                {photos.length > 0 && (
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                    {photos.map((file, i) => (
                      <div key={i} style={{ position: 'relative', width: 90, height: 70 }}>
                        <img src={URL.createObjectURL(file)} alt={`Photo ${i + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8, border: '1px solid var(--line)' }} />
                        <button type="button" onClick={() => removePhoto(i)}
                          style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: 'var(--danger)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {photos.length < 5 && (
                  <>
                    <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handlePhotoChange} style={{ display: 'none' }} />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="btn btn-outline btn-sm">
                      + Ajouter des photos
                    </button>
                  </>
                )}
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
