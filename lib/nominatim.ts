export interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  name?: string
}

export async function searchNominatim(query: string): Promise<NominatimResult[]> {
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '5',
    countrycodes: 'cm',
    viewbox: '8.4,13.1,16.2,1.6',
    bounded: '1',
    addressdetails: '0',
  })

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: {
        'User-Agent': 'liliride-app/1.0',
        'Accept-Language': 'fr',
      },
    })
    if (!res.ok) return []
    const data: unknown = await res.json()
    if (!Array.isArray(data)) return []

    return data.filter((item): item is NominatimResult => {
      if (typeof item !== 'object' || item === null) return false
      const result = item as Partial<NominatimResult>
      return (
        typeof result.place_id === 'number' &&
        typeof result.display_name === 'string' &&
        typeof result.lat === 'string' &&
        typeof result.lon === 'string'
      )
    })
  } catch {
    return []
  }
}

export function getShortLabel(result: NominatimResult): string {
  if (result.name) return result.name
  return result.display_name.split(',')[0]?.trim() || result.display_name
}
