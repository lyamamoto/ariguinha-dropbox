import { useState, useEffect, useRef } from 'react'
import type { Asset } from '../types'
import { securitiesApi } from '../services'

export function useAssetSearch(query: string, debounceMs = 800) {
  const [results, setResults] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    const timeoutId = setTimeout(async () => {
      abortControllerRef.current?.abort()
      abortControllerRef.current = new AbortController()

      try {
        const data = await securitiesApi.searchAssets(query, 10, abortControllerRef.current.signal);

        const assets: Asset[] = data.map(item => ({
          id: item.id,
          code: item.internalSymbol,
          name: item.name,
          assetClass: item.assetClassCode,
          assetType: item.assetTypeCode,
        }))

        setResults(assets)
        setError(null)
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }
        console.error('Search error:', err)
        setError('Failed to search assets')
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }, debounceMs)

    return () => {
      clearTimeout(timeoutId)
      abortControllerRef.current?.abort()
    }
  }, [query, debounceMs])

  return { results, isLoading, error }
}
