import { useState, useCallback } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://api.cosinv.com'

/**
 * Custom hook for making API requests.
 * @template T - The type of data returned by the API.
 * @returns {Object} An object containing data, loading, error, and request function.
 */
export function useApi<T>() {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const request = useCallback(async (endpoint: string, options?: RequestInit) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      })
      if (!response.ok) throw new Error('Request failed')
      const result = await response.json()
      setData(result)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { data, loading, error, request }
}
