'use client'

// Hook for fetching car data through our API routes
// Flow: Make → Model → Year → Trim (optimized for fewer API calls)

import { useState, useEffect } from 'react'
import type { MakeOption, ModelOption, TrimOption, CarSpecs } from '@/types'

interface UseCarDataResult {
  makes: MakeOption[]
  models: ModelOption[]
  years: number[]
  trims: TrimOption[]
  specs: CarSpecs | null
  loading: boolean
  error: string | null
}

interface UseCarDataParams {
  make: string | null
  year: number | null
  model: string | null
  trim: string | null
}

export function useCarData({ make, year, model, trim }: UseCarDataParams): UseCarDataResult {
  const [makes, setMakes] = useState<MakeOption[]>([])
  const [models, setModels] = useState<ModelOption[]>([])
  const [years, setYears] = useState<number[]>([])
  const [trims, setTrims] = useState<TrimOption[]>([])
  const [specs, setSpecs] = useState<CarSpecs | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch all makes on mount (only once, cached)
  useEffect(() => {
    const fetchMakes = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetch('/api/makes')
        if (!response.ok) throw new Error('Failed to fetch makes')
        
        const data: MakeOption[] = await response.json()
        setMakes(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        setMakes([])
      } finally {
        setLoading(false)
      }
    }

    fetchMakes()
  }, []) // Only run once on mount

  // Fetch models when make changes (year will be selected later)
  useEffect(() => {
    if (!make) {
      setModels([])
      setYears([])
      setTrims([])
      setSpecs(null)
      return
    }

    const fetchModels = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Fetch all models for the make (we'll filter by year later if needed)
        // Use a recent year to get comprehensive model list from NHTSA
        const response = await fetch(`/api/models?make=${encodeURIComponent(make)}&year=${new Date().getFullYear()}`)
        if (!response.ok) throw new Error('Failed to fetch models')
        
        const data: ModelOption[] = await response.json()
        setModels(data)
        setYears([])
        setTrims([])
        setSpecs(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        setModels([])
      } finally {
        setLoading(false)
      }
    }

    fetchModels()
  }, [make])

  // Fetch years when make and model are selected
  useEffect(() => {
    if (!make || !model) {
      setYears([])
      setTrims([])
      setSpecs(null)
      return
    }

    const fetchYears = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetch(
          `/api/years?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`
        )
        if (!response.ok) throw new Error('Failed to fetch years')
        
        const data: number[] = await response.json()
        setYears(data)
        setTrims([])
        setSpecs(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        setYears([])
      } finally {
        setLoading(false)
      }
    }

    fetchYears()
  }, [make, model])

  // Fetch trims when make, model, and year are selected
  useEffect(() => {
    if (!make || !model || !year) {
      setTrims([])
      setSpecs(null)
      return
    }

    const fetchTrims = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetch(
          `/api/trims?make=${encodeURIComponent(make)}&year=${year}&model=${encodeURIComponent(model)}`
        )
        if (!response.ok) throw new Error('Failed to fetch trims')
        
        const data: TrimOption[] = await response.json()
        setTrims(data)
        setSpecs(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        setTrims([])
      } finally {
        setLoading(false)
      }
    }

    fetchTrims()
  }, [make, model, year])

  // Fetch specs when make, model, year are selected (trim is optional)
  useEffect(() => {
    if (!make || !model || !year) {
      setSpecs(null)
      return
    }

    const fetchSpecs = async () => {
      setLoading(true)
      setError(null)
      
      try {
        let url = `/api/car/specs?make=${encodeURIComponent(make)}&year=${year}&model=${encodeURIComponent(model)}`
        if (trim) {
          url += `&trim=${encodeURIComponent(trim)}`
        }
        
        const response = await fetch(url)
        if (!response.ok) throw new Error('Failed to fetch specifications')
        
        const data: CarSpecs = await response.json()
        setSpecs(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        setSpecs(null)
      } finally {
        setLoading(false)
      }
    }

    fetchSpecs()
  }, [make, model, year, trim])

  return {
    makes,
    models,
    years,
    trims,
    specs,
    loading,
    error,
  }
}
