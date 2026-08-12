'use client'

import { useState, useEffect, useRef } from 'react'
import { searchNominatim, type NominatimResult } from '@/lib/nominatim'

export function useNominatim(query: string, debounceMs = 400) {
  const normalizedQuery = query.trim()
  const canSearch = normalizedQuery.length >= 2
  const [response, setResponse] = useState<{ query: string; results: NominatimResult[] }>({
    query: '',
    results: [],
  })
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let cancelled = false

    if (timerRef.current) clearTimeout(timerRef.current)

    if (!canSearch) return

    timerRef.current = setTimeout(async () => {
      const data = await searchNominatim(normalizedQuery)
      if (cancelled) return
      setResponse({ query: normalizedQuery, results: data })
    }, debounceMs)

    return () => {
      cancelled = true
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [normalizedQuery, canSearch, debounceMs])

  return {
    results: canSearch && response.query === normalizedQuery ? response.results : [],
    isLoading: canSearch && response.query !== normalizedQuery,
  }
}
