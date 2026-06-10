'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import StatusBadge from '@/components/shared/StatusBadge'
import Avatar from '@/components/shared/Avatar'
import type { User, ProfilTransporteur } from '@/types'

const VILLES = ['Douala', 'Yaoundé', 'Bafoussam', 'Autre']
const TYPES_COLIS = ['documents', 'petit', 'volumineux', 'fragile'] as const
const TYPES_VEHICULE = ['Berline', 'SUV', 'Minibus', 'Camionnette', 'Moto']

export default function ProfilPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profil, setProfil] = useState<ProfilTransporteur | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'profil' | 'transporteur'>('profil')
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return
      const [{ data: u }, { data: p }] = await Promise.all([
        supabase.from('users').select('*').eq('id', authUser.id).single(),
        supabase.from('profils_transporteur').select('*').eq('user_id', authUser.id).maybeSingle(),
      ])
      setUser(u as User)
      setProfil(p as ProfilTransporteur | null)
    }
    load()
  }, [])

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return
    await supabase.from('users').update({ nom: user.nom, telephone: user.telephone, whatsapp: user.whatsapp, ville: user.ville }).eq('id', authUser.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function saveProfil(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !profil) return
    setSaving(true)
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return
    const update = { user_id: authUser.id, type_vehicule: profil.type_vehicule, marque: profil.marque, modele: profil.modele, plaque: profil.plaque, nb_places: profil.nb_places, capacite_kg: profil.capacite_kg, types_colis_acceptes: profil.types_colis_acceptes }
    if (profil.id) {
      await supabase.from('profils_transporteur').update(update).eq('id', profil.id)
    } else {
      const { data } = await supabase.from('profils_transporteur').insert({ ...update, statut_verification: 'non_soumis' }).select().single()
      setProfil(data as ProfilTransporteur)
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function soumettre() {
    if (!profil?.id) return
    await supabase.from('profils_transporteur').update({ statut_verification: 'en_attente' }).eq('id', profil.id)
    setProfil(p => p ? { ...p, statut_verification: 'en_attente' } : p)
  }

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
                <input className="input" type="tel" value={user.telephone} onChange={e => setUser(u => u ? { ...u, telephone: e.target.value } : u)} required />
              </div>
              <div className="field">
                <label className="field-label">WhatsApp</label>
                <input className="input" type="tel" value={user.whatsapp ?? ''} onChange={e => setUser(u => u ? { ...u, whatsapp: e.target.value } : u)} />
              </div>
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

      {activeTab === 'transporteur' && (
        <div style={{ maxWidth: 640 }}>
          {profil && (
            <div className="notice" style={{ marginBottom: 20 }}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="icon">
                <path d="M10 2L3 5v5c0 4 3 7 7 8 4-1 7-4 7-8V5l-7-3z" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <div>
                Statut de vérification : <strong><StatusBadge statut={profil.statut_verification} /></strong>
                {profil.statut_verification === 'non_soumis' && ' — Complétez votre profil et soumettez-le pour validation.'}
                {profil.statut_verification === 'rejeté' && profil.motif_rejet && ` — Motif : ${profil.motif_rejet}`}
              </div>
            </div>
          )}

          <form onSubmit={saveProfil}>
            <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="field">
                  <label className="field-label">Type de véhicule</label>
                  <select className="select" value={profil?.type_vehicule ?? ''} onChange={e => setProfil(p => ({ ...(p ?? { id: '', user_id: '', statut_verification: 'non_soumis', created_at: '' }), type_vehicule: e.target.value as ProfilTransporteur['type_vehicule'] }))}>
                    <option value="">—</option>
                    {TYPES_VEHICULE.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">Marque</label>
                  <input className="input" value={profil?.marque ?? ''} onChange={e => setProfil(p => ({ ...(p ?? { id: '', user_id: '', statut_verification: 'non_soumis', created_at: '' }), marque: e.target.value }))} placeholder="Ex: Toyota" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="field">
                  <label className="field-label">Modèle</label>
                  <input className="input" value={profil?.modele ?? ''} onChange={e => setProfil(p => ({ ...(p ?? { id: '', user_id: '', statut_verification: 'non_soumis', created_at: '' }), modele: e.target.value }))} />
                </div>
                <div className="field">
                  <label className="field-label">Plaque d&rsquo;immatriculation</label>
                  <input className="input" value={profil?.plaque ?? ''} onChange={e => setProfil(p => ({ ...(p ?? { id: '', user_id: '', statut_verification: 'non_soumis', created_at: '' }), plaque: e.target.value }))} />
                </div>
              </div>
              <div className="field">
                <label className="field-label">Types de colis acceptés</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
                  {TYPES_COLIS.map(t => (
                    <label key={t} className="checkbox-row">
                      <input type="checkbox"
                        checked={profil?.types_colis_acceptes?.includes(t) ?? false}
                        onChange={() => setProfil(p => {
                          const base = p ?? { id: '', user_id: '', statut_verification: 'non_soumis', created_at: '' }
                          const current = base.types_colis_acceptes ?? []
                          return { ...base, types_colis_acceptes: current.includes(t) ? current.filter(x => x !== t) : [...current, t] }
                        })}
                      />
                      <span style={{ fontSize: 14, textTransform: 'capitalize' }}>{t}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, paddingTop: 8, flexWrap: 'wrap' }}>
                <button type="submit" className="btn btn-outline" disabled={saving}>{saving ? 'Sauvegarde…' : 'Enregistrer'}</button>
                {(!profil || profil.statut_verification === 'non_soumis' || profil.statut_verification === 'rejeté') && (
                  <button type="button" className="btn btn-primary" onClick={soumettre}>
                    Soumettre pour vérification
                  </button>
                )}
                {saved && <span style={{ color: 'var(--success)', fontSize: 14, alignSelf: 'center' }}>✓ Sauvegardé</span>}
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
