'use client'

import { useState, useRef, useEffect, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { useNominatim } from '@/hooks/useNominatim'
import { getShortLabel, type NominatimResult } from '@/lib/nominatim'

export interface AddressSelection {
  label: string
  lat?: number
  lng?: number
}

interface Props {
  value: string
  onChange: (value: string) => void
  onSelect: (selection: AddressSelection) => void
  placeholder?: string
  inputStyle?: React.CSSProperties
  inputClassName?: string
  required?: boolean
}

export default function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = 'Ville ou quartier',
  inputStyle,
  inputClassName,
  required,
}: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})
  const containerRef = useRef<HTMLDivElement>(null)
  const portalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { results, isLoading } = useNominatim(searchQuery)
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  )

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      const target = e.target as Node
      const inContainer = containerRef.current?.contains(target) ?? false
      const inPortal = portalRef.current?.contains(target) ?? false
      if (!inContainer && !inPortal) setOpen(false)
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [])

  function updatePosition() {
    if (!inputRef.current) return
    const rect = inputRef.current.getBoundingClientRect()
    setDropdownStyle({
      position: 'fixed',
      top: rect.bottom + 4,
      left: rect.left,
      width: Math.max(rect.width, 260),
      zIndex: 9999,
    })
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    onChange(val)
    setSearchQuery(val)
    updatePosition()
    setOpen(true)
  }

  function handleSelect(result: NominatimResult) {
    const label = getShortLabel(result)
    const lat = Number.parseFloat(result.lat)
    const lng = Number.parseFloat(result.lon)
    onChange(label)
    onSelect(
      Number.isFinite(lat) && Number.isFinite(lng)
        ? { label, lat, lng }
        : { label }
    )
    setSearchQuery('')
    setOpen(false)
  }

  function handleClear() {
    onChange('')
    setSearchQuery('')
    setOpen(false)
    inputRef.current?.focus()
  }

  const showDropdown = open && mounted && (results.length > 0 || isLoading)

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 4 }}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={() => {
          updatePosition()
          if (searchQuery.length >= 2) setOpen(true)
        }}
        placeholder={placeholder}
        style={inputStyle}
        className={inputClassName}
        required={required}
        minLength={required ? 2 : undefined}
        autoComplete="off"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', padding: 0, fontSize: 16, lineHeight: 1, flexShrink: 0 }}
          tabIndex={-1}
          aria-label="Effacer l’adresse"
        >
          ×
        </button>
      )}
      {showDropdown && createPortal(
        <div
          ref={portalRef}
          style={{
            ...dropdownStyle,
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            overflow: 'hidden',
          }}
        >
          {isLoading && results.length === 0 && (
            <div style={{ padding: '10px 14px', fontSize: 13, color: 'var(--ink-3)' }}>Recherche…</div>
          )}
          {results.map(r => (
            <button
              key={r.place_id}
              type="button"
              onMouseDown={() => handleSelect(r)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '9px 14px', background: 'transparent',
                border: 'none', borderBottom: '1px solid var(--line)',
                cursor: 'pointer', fontFamily: 'inherit',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--surface-2)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
            >
              <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--ink)' }}>{getShortLabel(r)}</div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {r.display_name}
              </div>
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  )
}
