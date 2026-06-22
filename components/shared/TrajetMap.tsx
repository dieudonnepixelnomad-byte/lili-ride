'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'

interface Props {
  departLabel: string
  departLat: number | null
  departLng: number | null
  arriveeLabel: string
  arriveeLat: number | null
  arriveeLng: number | null
  height?: number
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

function BoundsHandler({ bounds }: { bounds: [[number, number], [number, number]] }) {
  const map = useMap()
  useEffect(() => {
    map.fitBounds(bounds, { padding: [40, 40] })
  }, [map, bounds])
  return null
}

const departIcon = L.divIcon({
  html: '<div style="width:14px;height:14px;background:#1A4E8A;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(26,78,138,0.5)"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  className: '',
})

const arriveeIcon = L.divIcon({
  html: '<div style="width:14px;height:14px;background:#0F8A6B;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(15,138,107,0.5)"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  className: '',
})

export default function TrajetMap({
  departLabel,
  departLat,
  departLng,
  arriveeLabel,
  arriveeLat,
  arriveeLng,
  height = 300,
}: Props) {
  if (departLat === null || departLng === null || arriveeLat === null || arriveeLng === null) {
    return (
      <div
        style={{
          height,
          background: 'var(--surface-2)',
          borderRadius: 14,
          border: '1px solid var(--line)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--ink-3)',
          fontSize: 14,
        }}
      >
        Carte non disponible
      </div>
    )
  }

  const departPos: [number, number] = [departLat, departLng]
  const arriveePos: [number, number] = [arriveeLat, arriveeLng]
  const bounds: [[number, number], [number, number]] = [departPos, arriveePos]
  const distance = haversineKm(departLat, departLng, arriveeLat, arriveeLng)
  const center: [number, number] = [(departLat + arriveeLat) / 2, (departLng + arriveeLng) / 2]

  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--line)', position: 'relative' }}>
      <MapContainer
        center={center}
        zoom={7}
        style={{ height, width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <BoundsHandler bounds={bounds} />
        <Marker position={departPos} icon={departIcon}>
          <Popup>{departLabel}</Popup>
        </Marker>
        <Marker position={arriveePos} icon={arriveeIcon}>
          <Popup>{arriveeLabel}</Popup>
        </Marker>
        <Polyline
          positions={[departPos, arriveePos]}
          pathOptions={{ color: '#1A4E8A', weight: 2.5, dashArray: '6 6', opacity: 0.8 }}
        />
      </MapContainer>
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255,255,255,0.92)',
          border: '1px solid var(--line)',
          padding: '4px 14px',
          borderRadius: 999,
          fontSize: 12,
          color: 'var(--ink-2)',
          zIndex: 1000,
          whiteSpace: 'nowrap',
          fontFamily: 'var(--font-mono)',
          pointerEvents: 'none',
        }}
      >
        Distance estimée : {distance} km
      </div>
    </div>
  )
}
