export const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''

export const CAMEROON_BOUNDS = {
  north: 13.1,
  south: 1.6,
  west: 8.4,
  east: 16.2,
}

export const DEFAULT_CENTER = { lat: 3.848, lng: 11.502 } // Yaoundé

export const PLACES_OPTIONS = {
  componentRestrictions: { country: 'cm' },
  fields: ['place_id', 'formatted_address', 'geometry', 'name'],
}
