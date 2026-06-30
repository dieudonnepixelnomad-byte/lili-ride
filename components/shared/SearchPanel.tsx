'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AddressAutocomplete, { type AddressSelection } from '@/components/shared/AddressAutocomplete'

type TabType = 'covoiturage' | 'colis' | 'location'

interface AddressState {
  label: string
  lat?: number
  lng?: number
}

const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
  {
    id: 'covoiturage',
    label: 'Covoiturage',
    icon: (
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
        <path d="M3 13l1-4a2 2 0 012-2h8a2 2 0 012 2l1 4v3a1 1 0 01-1 1h-1a1 1 0 01-1-1v-1H6v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-3z" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="6.5" cy="13.5" r="1" fill="currentColor" />
        <circle cx="13.5" cy="13.5" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'colis',
    label: 'Colis (avion)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
        <path d="M3 7l7-3 7 3v6l-7 3-7-3V7z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M3 7l7 3 7-3M10 10v6" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    ),
  },
  {
    id: 'location',
    label: 'Location',
    icon: (
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="8" width="14" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M5 8l1.5-3h7L15 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="6.5" cy="14.5" r="1.2" fill="currentColor" />
        <circle cx="13.5" cy="14.5" r="1.2" fill="currentColor" />
      </svg>
    ),
  },
]

const inlineInputStyle: React.CSSProperties = {
  border: 'none',
  padding: 0,
  fontSize: 15,
  color: 'var(--ink)',
  background: 'transparent',
  outline: 'none',
  fontFamily: 'inherit',
  width: '100%',
}

interface Props {
  defaultTab?: TabType
  defaultDepart?: string
  defaultArrivee?: string
  defaultDate?: string
}

export default function SearchPanel({ defaultTab = 'covoiturage', defaultDepart = '', defaultArrivee = '', defaultDate = '' }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab)
  const [depart, setDepart] = useState<AddressState>({ label: defaultDepart })
  const [arrivee, setArrivee] = useState<AddressState>({ label: defaultArrivee })
  const [date, setDate] = useState(defaultDate)
  const [passagers, setPassagers] = useState('1')

  function handleDepartSelect(sel: AddressSelection) {
    setDepart(sel)
  }

  function handleArriveeSelect(sel: AddressSelection) {
    setArrivee(sel)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (depart.label) params.set('depart', depart.label)
    if (arrivee.label) params.set('arrivee', arrivee.label)
    if (date) params.set('date', date)
    if (depart.lat != null) params.set('depart_lat', depart.lat.toString())
    if (depart.lng != null) params.set('depart_lng', depart.lng.toString())
    if (arrivee.lat != null) params.set('arrivee_lat', arrivee.lat.toString())
    if (arrivee.lng != null) params.set('arrivee_lng', arrivee.lng.toString())
    if (activeTab === 'covoiturage' && passagers !== '1') params.set('passagers', passagers)
    router.push(`/${activeTab}?${params.toString()}`)
  }

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--line)',
      borderRadius: 20,
      boxShadow: 'var(--shadow-lg)',
      padding: 18,
      position: 'relative',
      zIndex: 5,
    }}>
      {/* Tabs */}
      <div className="search-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 16px',
              borderRadius: 8,
              background: activeTab === tab.id ? 'var(--surface)' : 'transparent',
              border: 'none',
              fontSize: 13.5, fontWeight: 500,
              color: activeTab === tab.id ? 'var(--ink)' : 'var(--ink-3)',
              cursor: 'pointer',
              fontFamily: 'inherit',
              boxShadow: activeTab === tab.id ? 'var(--shadow-xs)' : 'none',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Form */}
      <form
        onSubmit={handleSearch}
        className={`search-form${activeTab === 'location' ? ' location' : ''}`}
      >
        <div style={{ background: 'var(--surface)', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', fontWeight: 600 }}>
            {activeTab === 'location' ? 'Ville' : 'Départ'}
          </label>
          <AddressAutocomplete
            value={depart.label}
            onChange={(val) => setDepart({ label: val })}
            onSelect={handleDepartSelect}
            placeholder="Ville ou quartier"
            inputStyle={inlineInputStyle}
          />
        </div>

        {activeTab !== 'location' && (
          <div style={{ background: 'var(--surface)', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', fontWeight: 600 }}>Arrivée</label>
            <AddressAutocomplete
              value={arrivee.label}
              onChange={(val) => setArrivee({ label: val })}
              onSelect={handleArriveeSelect}
              placeholder="Ville ou quartier"
              inputStyle={inlineInputStyle}
            />
          </div>
        )}

        <div style={{ background: 'var(--surface)', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', fontWeight: 600 }}>Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{ border: 'none', padding: 0, fontSize: 15, color: 'var(--ink)', background: 'transparent', outline: 'none', fontFamily: 'inherit' }}
          />
        </div>

        {activeTab === 'covoiturage' && (
          <div style={{ background: 'var(--surface)', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', fontWeight: 600 }}>Passagers</label>
            <select
              value={passagers}
              onChange={e => setPassagers(e.target.value)}
              style={{ border: 'none', padding: 0, fontSize: 15, color: 'var(--ink)', background: 'transparent', outline: 'none', fontFamily: 'inherit', appearance: 'none' }}
            >
              {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} passager{n > 1 ? 's' : ''}</option>)}
            </select>
          </div>
        )}

        <button type="submit" className="search-form-submit">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          Rechercher
        </button>
      </form>
    </div>
  )
}
