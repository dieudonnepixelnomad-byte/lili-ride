'use client'

import { useState, useEffect, useRef } from 'react'
import { searchNominatim, type NominatimResult } from '@/lib/nominatim'

export function useNominatim(query: string, debounceMs = 400) {
  const [results, setResults] = useState<NominatimResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    if (query.length < 2) {
      setResults([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    timerRef.current = setTimeout(async () => {
      const data = await searchNominatim(query)
      setResults(data)
      setIsLoading(false)
    }, debounceMs)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [query, debounceMs])

  return { results, isLoading }
}
