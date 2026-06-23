'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import StatusBadge from '@/components/shared/StatusBadge'
import Avatar from '@/components/shared/Avatar'
import type { User, ProfilTransporteur, VehiculeTransporteur, TypeVehicule, TypeColis } from '@/types'

const VILLES = ['Douala', 'Yaoundé', 'Bafoussam', 'Autre']
const TYPES_VEHICULE: TypeVehicule[] = ['Berline', 'SUV', 'Minibus', 'Camionnette', 'Moto']
const TYPES_COLIS: TypeColis[] = ['documents', 'petit', 'volumineux', 'fragile']
const EQUIPEMENTS = [
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

interface VehiculeFormState {
  type_vehicule: TypeVehicule | ''
  marque: string
  modele: string
  plaque: string
  nb_places: string
  capacite_kg: string
  volume_m3: string
  types_colis_acceptes: TypeColis[]
  equipements: string[]
  carteGriseFile: File | null
  carteGriseStored: string | null
  photoVehiculeFile: File | null
  photoVehiculeStored: string | null
}

function emptyVehiculeForm(): VehiculeFormState {
  return {
    type_vehicule: '',
    marque: '',
    modele: '',
    plaque: '',
    nb_places: '',
    capacite_kg: '',
    volume_m3: '',
    types_colis_acceptes: [],
    equipements: [],
    carteGriseFile: null,
    carteGriseStored: null,
    photoVehiculeFile: null,
    photoVehiculeStored: null,
  }
}

export default function ProfilPage() {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState<'profil' | 'transporteur'>('profil')

  // User profile
  const [user, setUser] = useState<User | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Profil transporteur
  const [profil, setProfil] = useState<ProfilTransporteur | null>(null)

  // CNI
  const [cniRectoFile, setCniRectoFile] = useState<File | null>(null)
  const [cniVersoFile, setCniVersoFile] = useState<File | null>(null)
  const [cniSaving, setCniSaving] = useState(false)
  const [cniError, setCniError] = useState('')
  const cniRectoRef = useRef<HTMLInputElement>(null)
  const cniVersoRef = useRef<HTMLInputElement>(null)

  // Permis
  const [permisFile, setPermisFile] = useState<File | null>(null)
  const [permisSaving, setPermisSaving] = useState(false)
  const [permisError, setPermisError] = useState('')
  const permisRef = useRef<HTMLInputElement>(null)

  // Véhicules list
  const [vehicules, setVehicules] = useState<VehiculeTransporteur[]>([])

  // Add/edit vehicle form
  const [vehiculeForm, setVehiculeForm] = useState<VehiculeFormState | null>(null)
  const [editingVehiculeId, setEditingVehiculeId] = useState<string | null>(null)
  const [vehiculeSaving, setVehiculeSaving] = useState(false)
  const [vehiculeError, setVehiculeError] = useState('')
  const carteGriseRef = useRef<HTMLInputElement>(null)
  const photoVehiculeRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return
      const [{ data: u }, { data: p }, { data: v }] = await Promise.all([
        supabase.from('users').select('*').eq('id', authUser.id).single(),
        supabase.from('profils_transporteur').select('*').eq('user_id', authUser.id).maybeSingle(),
        supabase.from('vehicules_transporteur').select('*').eq('user_id', authUser.id).order('created_at'),
      ])
      setUser(u as User)
      setProfil(p as ProfilTransporteur | null)
      setVehicules((v ?? []) as VehiculeTransporteur[])
    }
    load()
  }, [])

  // ── User profile save ──────────────────────────────────────────────────────
  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return
    await supabase.from('users').update({
      nom: user.nom,
      telephone: user.telephone,
      email: user.email || null,
      whatsapp: user.whatsapp,
      ville: user.ville,
    }).eq('id', authUser.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // ── CNI ────────────────────────────────────────────────────────────────────
  async function uploadDoc(authId: string, file: File, prefix: string): Promise<string> {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${authId}/${prefix}-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('documents').upload(path, file, { upsert: true })
    if (error) throw new Error(`Upload ${prefix} échoué : ${error.message}`)
    return path
  }

  async function saveCni(e: React.FormEvent) {
    e.preventDefault()
    setCniError('')
    setCniSaving(true)
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) throw new Error('Non authentifié')

      let cniRectoUrl = profil?.cni_recto_url ?? null
      let cniVersoUrl = profil?.cni_verso_url ?? null

      if (cniRectoFile) {
        cniRectoUrl = await uploadDoc(authUser.id, cniRectoFile, 'cni-recto')
        setCniRectoFile(null)
        if (cniRectoRef.current) cniRectoRef.current.value = ''
      }
      if (cniVersoFile) {
        cniVersoUrl = await uploadDoc(authUser.id, cniVersoFile, 'cni-verso')
        setCniVersoFile(null)
        if (cniVersoRef.current) cniVersoRef.current.value = ''
      }

      if (profil?.id) {
        const { data } = await supabase
          .from('profils_transporteur')
          .update({ cni_recto_url: cniRectoUrl, cni_verso_url: cniVersoUrl })
          .eq('id', profil.id)
          .select()
          .single()
        setProfil(data as ProfilTransporteur)
      } else {
        const { data } = await supabase
          .from('profils_transporteur')
          .insert({
            user_id: authUser.id,
            cni_recto_url: cniRectoUrl,
            cni_verso_url: cniVersoUrl,
            statut_cni: 'non_soumis',
            statut_permis: 'non_soumis',
          })
          .select()
          .single()
        setProfil(data as ProfilTransporteur)
      }
    } catch (err: unknown) {
      setCniError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde.')
    } finally {
      setCniSaving(false)
    }
  }

  async function soumettreCni() {
    if (!profil?.id) return
    if (!profil.cni_recto_url || !profil.cni_verso_url) {
      setCniError('Fournissez le recto ET le verso de votre CNI avant de soumettre.')
      return
    }
    setCniError('')
    const { error } = await supabase
      .from('profils_transporteur')
      .update({ statut_cni: 'en_attente' })
      .eq('id', profil.id)
    if (error) {
      setCniError(`Erreur lors de la soumission : ${error.message}`)
      return
    }
    setProfil(p => p ? { ...p, statut_cni: 'en_attente' } : p)
  }

  // ── Permis ─────────────────────────────────────────────────────────────────
  async function savePermis(e: React.FormEvent) {
    e.preventDefault()
    setPermisError('')
    setPermisSaving(true)
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) throw new Error('Non authentifié')

      let permisUrl = profil?.permis_url ?? null

      if (permisFile) {
        permisUrl = await uploadDoc(authUser.id, permisFile, 'permis')
        setPermisFile(null)
        if (permisRef.current) permisRef.current.value = ''
      }

      if (profil?.id) {
        const { data } = await supabase
          .from('profils_transporteur')
          .update({ permis_url: permisUrl })
          .eq('id', profil.id)
          .select()
          .single()
        setProfil(data as ProfilTransporteur)
      } else {
        const { data } = await supabase
          .from('profils_transporteur')
          .insert({
            user_id: authUser.id,
            permis_url: permisUrl,
            statut_cni: 'non_soumis',
            statut_permis: 'non_soumis',
          })
          .select()
          .single()
        setProfil(data as ProfilTransporteur)
      }
    } catch (err: unknown) {
      setPermisError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde.')
    } finally {
      setPermisSaving(false)
    }
  }

  async function soumettrePermis() {
    if (!profil?.id) return
    if (!profil.permis_url) {
      setPermisError('Fournissez votre permis de conduire avant de soumettre.')
      return
    }
    setPermisError('')
    const { error } = await supabase
      .from('profils_transporteur')
      .update({ statut_permis: 'en_attente' })
      .eq('id', profil.id)
    if (error) {
      setPermisError(`Erreur lors de la soumission : ${error.message}`)
      return
    }
    setProfil(p => p ? { ...p, statut_permis: 'en_attente' } : p)
  }

  // ── Véhicules ──────────────────────────────────────────────────────────────
  function openAddVehicule() {
    setEditingVehiculeId(null)
    setVehiculeForm(emptyVehiculeForm())
    setVehiculeError('')
  }

  function openEditVehicule(v: VehiculeTransporteur) {
    setEditingVehiculeId(v.id)
    setVehiculeForm({
      type_vehicule: v.type_vehicule ?? '',
      marque: v.marque ?? '',
      modele: v.modele ?? '',
      plaque: v.plaque ?? '',
      nb_places: v.nb_places != null ? String(v.nb_places) : '',
      capacite_kg: v.capacite_kg != null ? String(v.capacite_kg) : '',
      volume_m3: v.volume_m3 != null ? String(v.volume_m3) : '',
      types_colis_acceptes: (v.types_colis_acceptes ?? []) as TypeColis[],
      equipements: v.equipements ?? [],
      carteGriseFile: null,
      carteGriseStored: v.carte_grise_url ?? null,
      photoVehiculeFile: null,
      photoVehiculeStored: v.photo_vehicule_url ?? null,
    })
    setVehiculeError('')
  }

  function cancelVehiculeForm() {
    setVehiculeForm(null)
    setEditingVehiculeId(null)
    setVehiculeError('')
  }

  async function uploadVehiculeDoc(authId: string, file: File, bucket: string, prefix: string): Promise<string> {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${authId}/${prefix}-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
    if (error) throw new Error(`Upload ${prefix} échoué : ${error.message}`)
    return path
  }

  async function saveVehicule(e: React.FormEvent, soumettre = false) {
    e.preventDefault()
    if (!vehiculeForm) return
    setVehiculeError('')
    setVehiculeSaving(true)
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) throw new Error('Non authentifié')

      let carteGriseUrl = vehiculeForm.carteGriseStored
      let photoVehiculeUrl = vehiculeForm.photoVehiculeStored

      if (vehiculeForm.carteGriseFile) {
        carteGriseUrl = await uploadVehiculeDoc(authUser.id, vehiculeForm.carteGriseFile, 'documents', 'carte-grise')
      }
      if (vehiculeForm.photoVehiculeFile) {
        photoVehiculeUrl = await uploadVehiculeDoc(authUser.id, vehiculeForm.photoVehiculeFile, 'photos', 'vehicule')
      }

      const payload = {
        user_id: authUser.id,
        type_vehicule: vehiculeForm.type_vehicule || null,
        marque: vehiculeForm.marque || null,
        modele: vehiculeForm.modele || null,
        plaque: vehiculeForm.plaque || null,
        nb_places: vehiculeForm.nb_places ? parseInt(vehiculeForm.nb_places) : null,
        capacite_kg: vehiculeForm.capacite_kg ? parseFloat(vehiculeForm.capacite_kg) : null,
        volume_m3: vehiculeForm.volume_m3 ? parseFloat(vehiculeForm.volume_m3) : null,
        types_colis_acceptes: vehiculeForm.types_colis_acceptes,
        equipements: vehiculeForm.equipements,
        carte_grise_url: carteGriseUrl,
        photo_vehicule_url: photoVehiculeUrl,
        ...(soumettre ? { statut_verification: 'en_attente' as const } : {}),
      }

      if (editingVehiculeId) {
        const { data } = await supabase
          .from('vehicules_transporteur')
          .update(payload)
          .eq('id', editingVehiculeId)
          .select()
          .single()
        setVehicules(vs => vs.map(v => v.id === editingVehiculeId ? (data as VehiculeTransporteur) : v))
      } else {
        const { data } = await supabase
          .from('vehicules_transporteur')
          .insert({ ...payload, statut_verification: 'non_soumis' })
          .select()
          .single()
        setVehicules(vs => [...vs, data as VehiculeTransporteur])
      }

      setVehiculeForm(null)
      setEditingVehiculeId(null)
    } catch (err: unknown) {
      setVehiculeError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde.')
    } finally {
      setVehiculeSaving(false)
    }
  }

  async function supprimerVehicule(vehiculeId: string) {
    await supabase.from('vehicules_transporteur').delete().eq('id', vehiculeId)
    setVehicules(vs => vs.filter(v => v.id !== vehiculeId))
  }

  async function soumettreVehicule(vehiculeId: string, carteGriseUrl: string | undefined) {
    if (!carteGriseUrl) {
      setVehiculeError('Fournissez la carte grise avant de soumettre ce véhicule.')
      return
    }
    setVehiculeError('')
    const { error } = await supabase
      .from('vehicules_transporteur')
      .update({ statut_verification: 'en_attente' })
      .eq('id', vehiculeId)
    if (error) {
      setVehiculeError(`Erreur lors de la soumission : ${error.message}`)
      return
    }
    setVehicules(vs => vs.map(v => v.id === vehiculeId ? { ...v, statut_verification: 'en_attente' } : v))
  }

  const cniCanEdit = !profil || profil.statut_cni === 'non_soumis' || profil.statut_cni === 'rejeté'
  const cniCanSubmit = cniCanEdit && !!profil?.cni_recto_url && !!profil?.cni_verso_url
  const permisCanEdit = !profil || profil.statut_permis === 'non_soumis' || profil.statut_permis === 'rejeté'
  const permisCanSubmit = permisCanEdit && !!profil?.permis_url

  if (!user) return <div style={{ padding: 40, color: 'var(--ink-3)' }}>Chargement…</div>

  return (
    <>
      <div className="page-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Avatar nom={user.nom} size="lg" />
          <div>
            <h1 className="page-title">{user.nom}</h1>
            <p className="page-sub">{user.ville}</p>
          </div>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 28 }}>
        <button type="button" className={`tab ${activeTab === 'profil' ? 'active' : ''}`} onClick={() => setActiveTab('profil')}>Mon profil</button>
        <button type="button" className={`tab ${activeTab === 'transporteur' ? 'active' : ''}`} onClick={() => setActiveTab('transporteur')}>Profil transporteur</button>
      </div>

      {/* ── Onglet Profil ── */}
      {activeTab === 'profil' && (
        <form onSubmit={saveProfile} style={{ maxWidth: 560 }}>
          <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="field">
              <label className="field-label">Nom complet</label>
              <input className="input" value={user.nom} onChange={e => setUser(u => u ? { ...u, nom: e.target.value } : u)} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="field">
                <label className="field-label">Téléphone</label>
                <input className="input" type="tel" value={user.telephone ?? ''} onChange={e => setUser(u => u ? { ...u, telephone: e.target.value } : u)} required />
              </div>
              <div className="field">
                <label className="field-label">WhatsApp</label>
                <input className="input" type="tel" value={user.whatsapp ?? ''} onChange={e => setUser(u => u ? { ...u, whatsapp: e.target.value } : u)} />
              </div>
            </div>
            <div className="field">
              <label className="field-label">Email <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optionnel)</span></label>
              <input className="input" type="email" value={user.email ?? ''} onChange={e => setUser(u => u ? { ...u, email: e.target.value } : u)} placeholder="ex: contact@email.com" />
            </div>
            <div className="field">
              <label className="field-label">Ville</label>
              <select className="select" value={user.ville} onChange={e => setUser(u => u ? { ...u, ville: e.target.value } : u)}>
                {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Sauvegarde…' : 'Enregistrer'}</button>
              {saved && <span style={{ color: 'var(--success)', fontSize: 14 }}>✓ Sauvegardé</span>}
            </div>
          </div>
        </form>
      )}

      {/* ── Onglet Transporteur ── */}
      {activeTab === 'transporteur' && (
        <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* Section CNI */}
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--ink)', marginBottom: 4 }}>Carte Nationale d&rsquo;Identité</div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 12 }}>Requis pour tous les services (covoiturage, colis, location)</div>
            <div className="card card-pad">
              {profil && (
                <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 14, color: 'var(--ink-2)' }}>Statut :</span>
                  <StatusBadge statut={profil.statut_cni} />
                  {profil.statut_cni === 'rejeté' && profil.motif_rejet_cni && (
                    <span style={{ fontSize: 13, color: 'var(--danger)', marginLeft: 4 }}>— {profil.motif_rejet_cni}</span>
                  )}
                </div>
              )}

              {cniError && <div className="notice warn" style={{ marginBottom: 16 }}>{cniError}</div>}

              <form onSubmit={saveCni} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { label: 'Recto', file: cniRectoFile, setFile: setCniRectoFile, ref: cniRectoRef, stored: profil?.cni_recto_url, prefix: 'recto' as const },
                  { label: 'Verso', file: cniVersoFile, setFile: setCniVersoFile, ref: cniVersoRef, stored: profil?.cni_verso_url, prefix: 'verso' as const },
                ].map(({ label, file, setFile, ref, stored }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0', borderBottom: '1px solid var(--line)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>
                        CNI — {label} <span style={{ color: 'var(--danger)' }}>*</span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>
                        {file ? (
                          <span style={{ color: 'var(--warning)' }}>En attente de sauvegarde : {file.name}</span>
                        ) : stored ? (
                          <span style={{ color: 'var(--success)' }}>✓ Document fourni</span>
                        ) : (
                          <span style={{ color: 'var(--danger)' }}>Non fourni</span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {file && (
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setFile(null); if (ref.current) ref.current.value = '' }}>Annuler</button>
                      )}
                      <input ref={ref} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => setFile(e.target.files?.[0] ?? null)} />
                      {cniCanEdit && (
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => ref.current?.click()}>
                          {stored ? 'Remplacer' : 'Ajouter'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {cniCanEdit && (
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button type="submit" className="btn btn-outline" disabled={cniSaving}>
                      {cniSaving ? 'Sauvegarde…' : 'Enregistrer'}
                    </button>
                    <button type="button" className="btn btn-primary" disabled={cniSaving || !cniCanSubmit} onClick={soumettreCni}>
                      Soumettre pour vérification
                    </button>
                  </div>
                )}

                {(profil?.statut_cni === 'en_attente' || profil?.statut_cni === 'vérifié') && (
                  <p style={{ fontSize: 13, color: 'var(--ink-3)' }}>
                    {profil.statut_cni === 'en_attente' && 'Votre CNI est en cours d\'examen. Édition bloquée pendant la vérification.'}
                    {profil.statut_cni === 'vérifié' && 'CNI vérifiée.'}
                  </p>
                )}
              </form>
            </div>
          </div>

          {/* Section Permis */}
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--ink)', marginBottom: 4 }}>Permis de conduire</div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 12 }}>Requis uniquement pour le covoiturage et le transport de colis</div>
            <div className="card card-pad">
              {profil && (
                <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 14, color: 'var(--ink-2)' }}>Statut :</span>
                  <StatusBadge statut={profil.statut_permis} />
                  {profil.statut_permis === 'rejeté' && profil.motif_rejet_permis && (
                    <span style={{ fontSize: 13, color: 'var(--danger)', marginLeft: 4 }}>— {profil.motif_rejet_permis}</span>
                  )}
                </div>
              )}

              {permisError && <div className="notice warn" style={{ marginBottom: 16 }}>{permisError}</div>}

              <form onSubmit={savePermis} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0', borderBottom: '1px solid var(--line)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>
                      Permis de conduire <span style={{ color: 'var(--danger)' }}>*</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>
                      {permisFile ? (
                        <span style={{ color: 'var(--warning)' }}>En attente de sauvegarde : {permisFile.name}</span>
                      ) : profil?.permis_url ? (
                        <span style={{ color: 'var(--success)' }}>✓ Document fourni</span>
                      ) : (
                        <span style={{ color: 'var(--danger)' }}>Non fourni</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {permisFile && (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setPermisFile(null); if (permisRef.current) permisRef.current.value = '' }}>Annuler</button>
                    )}
                    <input ref={permisRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }}
                      onChange={e => setPermisFile(e.target.files?.[0] ?? null)} />
                    {permisCanEdit && (
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => permisRef.current?.click()}>
                        {profil?.permis_url ? 'Remplacer' : 'Ajouter'}
                      </button>
                    )}
                  </div>
                </div>

                {permisCanEdit && (
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button type="submit" className="btn btn-outline" disabled={permisSaving}>
                      {permisSaving ? 'Sauvegarde…' : 'Enregistrer'}
                    </button>
                    <button type="button" className="btn btn-primary" disabled={permisSaving || !permisCanSubmit} onClick={soumettrePermis}>
                      Soumettre pour vérification
                    </button>
                  </div>
                )}

                {(profil?.statut_permis === 'en_attente' || profil?.statut_permis === 'vérifié') && (
                  <p style={{ fontSize: 13, color: 'var(--ink-3)' }}>
                    {profil.statut_permis === 'en_attente' && 'Votre permis est en cours d\'examen. Édition bloquée pendant la vérification.'}
                    {profil.statut_permis === 'vérifié' && 'Permis vérifié. Vous pouvez publier des annonces covoiturage/colis avec vos véhicules vérifiés.'}
                  </p>
                )}
              </form>
            </div>
          </div>

          {/* Section Véhicules */}
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--ink)', marginBottom: 4 }}>Mes véhicules</div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 12 }}>Pour le covoiturage et le transport de colis — chaque véhicule est vérifié indépendamment</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div />
              {!vehiculeForm && (
                <button type="button" className="btn btn-outline btn-sm" onClick={openAddVehicule}>+ Ajouter un véhicule</button>
              )}
            </div>

            {vehicules.map(v => (
              <div key={v.id} className="card card-pad" style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>
                      {v.marque && v.modele ? `${v.marque} ${v.modele}` : 'Véhicule sans nom'}
                      {v.type_vehicule && <span style={{ fontWeight: 400, color: 'var(--ink-3)', marginLeft: 8, fontSize: 13 }}>({v.type_vehicule})</span>}
                    </div>
                    {v.plaque && <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>Plaque : {v.plaque}</div>}
                    <div style={{ marginTop: 8 }}><StatusBadge statut={v.statut_verification} /></div>
                    {v.statut_verification === 'rejeté' && v.motif_rejet && (
                      <div style={{ fontSize: 13, color: 'var(--danger)', marginTop: 4 }}>{v.motif_rejet}</div>
                    )}
                  </div>
                  {(v.statut_verification === 'non_soumis' || v.statut_verification === 'rejeté') && editingVehiculeId !== v.id && (
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => openEditVehicule(v)}>Modifier</button>
                      <button type="button" className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}
                        onClick={() => supprimerVehicule(v.id)}>
                        Supprimer
                      </button>
                      <button type="button" className="btn btn-primary btn-sm"
                        onClick={() => soumettreVehicule(v.id, v.carte_grise_url)}>
                        Soumettre
                      </button>
                    </div>
                  )}
                </div>

                {editingVehiculeId === v.id && vehiculeForm && (
                  <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--line)' }}>
                    <VehiculeFormInline
                      form={vehiculeForm}
                      setForm={setVehiculeForm}
                      onSave={saveVehicule}
                      onCancel={cancelVehiculeForm}
                      saving={vehiculeSaving}
                      error={vehiculeError}
                      carteGriseRef={carteGriseRef}
                      photoVehiculeRef={photoVehiculeRef}
                    />
                  </div>
                )}
              </div>
            ))}

            {vehicules.length === 0 && !vehiculeForm && (
              <div className="card" style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 14 }}>
                Aucun véhicule enregistré. Ajoutez-en un pour pouvoir publier des trajets.
              </div>
            )}

            {vehiculeForm && !editingVehiculeId && (
              <div className="card card-pad">
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Nouveau véhicule</div>
                <VehiculeFormInline
                  form={vehiculeForm}
                  setForm={setVehiculeForm}
                  onSave={saveVehicule}
                  onCancel={cancelVehiculeForm}
                  saving={vehiculeSaving}
                  error={vehiculeError}
                  carteGriseRef={carteGriseRef}
                  photoVehiculeRef={photoVehiculeRef}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

interface VehiculeFormInlineProps {
  form: VehiculeFormState
  setForm: React.Dispatch<React.SetStateAction<VehiculeFormState | null>>
  onSave: (e: React.FormEvent, soumettre?: boolean) => Promise<void>
  onCancel: () => void
  saving: boolean
  error: string
  carteGriseRef: React.RefObject<HTMLInputElement | null>
  photoVehiculeRef: React.RefObject<HTMLInputElement | null>
}

function VehiculeFormInline({ form, setForm, onSave, onCancel, saving, error, carteGriseRef, photoVehiculeRef }: VehiculeFormInlineProps) {
  function update(patch: Partial<VehiculeFormState>) {
    setForm(f => f ? { ...f, ...patch } : null)
  }

  function toggleColis(t: TypeColis) {
    const current = form.types_colis_acceptes
    update({ types_colis_acceptes: current.includes(t) ? current.filter(x => x !== t) : [...current, t] })
  }

  function toggleEquipement(t: string) {
    const current = form.equipements
    update({ equipements: current.includes(t) ? current.filter(x => x !== t) : [...current, t] })
  }

  return (
    <form onSubmit={onSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="field">
          <label className="field-label">Type de véhicule</label>
          <select className="select" value={form.type_vehicule} onChange={e => update({ type_vehicule: e.target.value as TypeVehicule | '' })}>
            <option value="">—</option>
            {TYPES_VEHICULE.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="field">
          <label className="field-label">Marque</label>
          <input className="input" value={form.marque} onChange={e => update({ marque: e.target.value })} placeholder="Ex: Toyota" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="field">
          <label className="field-label">Modèle</label>
          <input className="input" value={form.modele} onChange={e => update({ modele: e.target.value })} />
        </div>
        <div className="field">
          <label className="field-label">Plaque d&rsquo;immatriculation</label>
          <input className="input" value={form.plaque} onChange={e => update({ plaque: e.target.value })} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        <div className="field">
          <label className="field-label">Nb places</label>
          <input className="input" type="number" min="1" value={form.nb_places} onChange={e => update({ nb_places: e.target.value })} />
        </div>
        <div className="field">
          <label className="field-label">Capacité kg</label>
          <input className="input" type="number" min="0" value={form.capacite_kg} onChange={e => update({ capacite_kg: e.target.value })} />
        </div>
        <div className="field">
          <label className="field-label">Volume m³</label>
          <input className="input" type="number" min="0" step="0.1" value={form.volume_m3} onChange={e => update({ volume_m3: e.target.value })} />
        </div>
      </div>

      <div className="field">
        <label className="field-label">Types de colis acceptés</label>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
          {TYPES_COLIS.map(t => (
            <label key={t} className="checkbox-row">
              <input type="checkbox" checked={form.types_colis_acceptes.includes(t)} onChange={() => toggleColis(t)} />
              <span style={{ fontSize: 14, textTransform: 'capitalize' }}>{t}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="field">
        <label className="field-label">Équipements <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optionnel)</span></label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px 16px', marginTop: 8 }}>
          {EQUIPEMENTS.map(eq => (
            <label key={eq} className="checkbox-row">
              <input type="checkbox" checked={form.equipements.includes(eq)} onChange={() => toggleEquipement(eq)} />
              <span style={{ fontSize: 14 }}>{eq}</span>
            </label>
          ))}
        </div>
      </div>

      {[
        { label: 'Carte grise', ref: carteGriseRef, fileKey: 'carteGriseFile' as const, storedKey: 'carteGriseStored' as const, required: true },
        { label: 'Photo du véhicule', ref: photoVehiculeRef, fileKey: 'photoVehiculeFile' as const, storedKey: 'photoVehiculeStored' as const, required: false },
      ].map(({ label, ref, fileKey, storedKey, required }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500, fontSize: 14 }}>
              {label}{required && <span style={{ color: 'var(--danger)', marginLeft: 4 }}>*</span>}
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>
              {form[fileKey] ? (
                <span style={{ color: 'var(--warning)' }}>En attente : {(form[fileKey] as File).name}</span>
              ) : form[storedKey] ? (
                <span style={{ color: 'var(--success)' }}>✓ Document fourni</span>
              ) : (
                <span style={{ color: required ? 'var(--danger)' : 'var(--ink-3)' }}>Non fourni</span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {form[fileKey] && (
              <button type="button" className="btn btn-ghost btn-sm"
                onClick={() => update({ [fileKey]: null } as Partial<VehiculeFormState>)}>
                Annuler
              </button>
            )}
            <input ref={ref} type="file" accept="image/*,.pdf" style={{ display: 'none' }}
              onChange={e => { update({ [fileKey]: e.target.files?.[0] ?? null } as Partial<VehiculeFormState>); if (ref.current) ref.current.value = '' }} />
            <button type="button" className="btn btn-outline btn-sm" onClick={() => ref.current?.click()}>
              {form[storedKey] ? 'Remplacer' : 'Ajouter'}
            </button>
          </div>
        </div>
      ))}

      {error && <div className="notice warn">{error}</div>}

      <div style={{ display: 'flex', gap: 12 }}>
        <button type="submit" className="btn btn-outline" disabled={saving}>
          {saving ? 'Sauvegarde…' : 'Enregistrer'}
        </button>
        <button type="button" className="btn btn-primary" disabled={saving}
          onClick={e => onSave(e as unknown as React.FormEvent, true)}>
          Enregistrer et soumettre
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Annuler</button>
      </div>
    </form>
  )
}
