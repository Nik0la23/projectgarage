'use client'

// React hook for fetching car analysis data
// Provides loading states and error handling for forum/article analysis

import { useState } from 'react'
import type { CarAnalysisResult } from '@/features/car-lookup/types'

interface UseCarAnalysisResult {
  loading: boolean
  error: string | null
  data: CarAnalysisResult | null
  fetchAnalysis: (make: string, model: string, year: number) => Promise<void>
  reset: () => void
}

// Hook for fetching car reliability analysis
export function useCarAnalysis(): UseCarAnalysisResult {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<CarAnalysisResult | null>(null)

  const fetchAnalysis = async (make: string, model: string, year: number) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/car-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ make, model, year }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch analysis')
      }

      setData(result.data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setLoading(false)
    setError(null)
    setData(null)
  }

  return {
    loading,
    error,
    data,
    fetchAnalysis,
    reset,
  }
}
