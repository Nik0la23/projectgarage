'use client'

import { useState, useCallback, useEffect } from 'react'
import { fetchCarRecommendations } from '../services/car-finder-service'
import { saveFinderPreferences, getFinderPreferences, clearFinderPreferences } from '@/lib/storage'
import type { CarFinderFilters, CarFinderResult, CarFinderState } from '../types'

const INITIAL_STATE: CarFinderState = {
  filters: {},
  lifestyle: '',
  results: null,
  refinement: '',
  loading: false,
  error: null,
}

export function useCarFinder() {
  const [state, setState] = useState<CarFinderState>(INITIAL_STATE)

  // Restore only the last results after mount — input fields stay empty for a fresh run
  useEffect(() => {
    const saved = getFinderPreferences()
    if (!saved?.results) return
    setState(prev => ({ ...prev, results: saved.results ?? null }))
  }, [])

  const updateFilter = useCallback(<K extends keyof CarFinderFilters>(
    key: K,
    value: CarFinderFilters[K] | undefined
  ) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, [key]: value },
    }))
  }, [])

  const setLifestyle = useCallback((text: string) => {
    setState(prev => ({ ...prev, lifestyle: text }))
  }, [])

  const setRefinement = useCallback((text: string) => {
    setState(prev => ({ ...prev, refinement: text }))
  }, [])

  const submit = useCallback(async (filters: CarFinderFilters, lifestyle: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const results = await fetchCarRecommendations(filters, lifestyle)

      // Save filters, lifestyle, and results so the session survives navigation
      saveFinderPreferences({
        savedAt: new Date().toISOString(),
        filters,
        lifestyle: lifestyle || undefined,
        results,
      })

      setState(prev => ({ ...prev, results, loading: false }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
      }))
    }
  }, [])

  const refine = useCallback(async (
    filters: CarFinderFilters,
    lifestyle: string,
    refinement: string,
    previousResults: CarFinderResult[]
  ) => {
    if (!refinement.trim()) return

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const results = await fetchCarRecommendations(filters, lifestyle, refinement, previousResults)

      // Update stored results after refinement
      saveFinderPreferences({
        savedAt: new Date().toISOString(),
        filters,
        lifestyle: lifestyle || undefined,
        results,
      })

      setState(prev => ({ ...prev, results, loading: false, refinement: '' }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
      }))
    }
  }, [])

  const reset = useCallback(() => {
    // Clear localStorage so the match indicator and stored session are both wiped
    clearFinderPreferences()
    setState(INITIAL_STATE)
  }, [])

  return {
    ...state,
    updateFilter,
    setLifestyle,
    setRefinement,
    submit,
    refine,
    reset,
  }
}
