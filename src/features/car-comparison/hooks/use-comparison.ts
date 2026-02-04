'use client'

// Hook to manage car comparison state and API integration

import { useState, useCallback } from 'react'
import type { ComparisonCar, ComparisonData } from '../types'

interface UseComparisonResult {
  cars: ComparisonCar[]
  comparisonData: ComparisonData | null
  loading: boolean
  error: string | null
  addCar: (car: ComparisonCar) => void
  removeCar: (index: number) => void
  fetchComparison: () => Promise<void>
  reset: () => void
}

export function useComparison(): UseComparisonResult {
  const [cars, setCars] = useState<ComparisonCar[]>([])
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Add a car to comparison
  const addCar = useCallback((car: ComparisonCar) => {
    setError(null)

    // Check max cars limit
    if (cars.length >= 3) {
      setError('Maximum 3 cars can be compared')
      return
    }

    // Check for duplicate
    const isDuplicate = cars.some(
      (existingCar) =>
        existingCar.make === car.make &&
        existingCar.model === car.model &&
        existingCar.year === car.year &&
        existingCar.trim === car.trim
    )

    if (isDuplicate) {
      setError('This car is already in the comparison')
      return
    }

    setCars((prev) => [...prev, car])
    // Clear comparison data when cars change
    setComparisonData(null)
  }, [cars])

  // Remove a car from comparison
  const removeCar = useCallback((index: number) => {
    setCars((prev) => prev.filter((_, i) => i !== index))
    // Clear comparison data when cars change
    setComparisonData(null)
    setError(null)
  }, [])

  // Fetch comparison data from API
  const fetchComparison = useCallback(async () => {
    if (cars.length < 2) {
      setError('Select at least 2 cars to compare')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cars }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch comparison')
      }

      const result = await response.json()

      if (result.success && result.data) {
        setComparisonData(result.data)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (err) {
      console.error('[useComparison] Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to compare cars')
      setComparisonData(null)
    } finally {
      setLoading(false)
    }
  }, [cars])

  // Reset all state
  const reset = useCallback(() => {
    setCars([])
    setComparisonData(null)
    setLoading(false)
    setError(null)
  }, [])

  return {
    cars,
    comparisonData,
    loading,
    error,
    addCar,
    removeCar,
    fetchComparison,
    reset,
  }
}
