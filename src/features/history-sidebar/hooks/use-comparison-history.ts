'use client'

// Client-side hook for managing comparison history
// Mirrors the pattern of use-search-history.ts

import { useState, useEffect } from 'react'
import {
  getComparisonHistory,
  addToComparisonHistory,
  clearComparisonHistory,
  type ComparisonHistoryItem,
} from '@/lib/storage'
import type { Car } from '@/types'

export function useComparisonHistory() {
  const [history, setHistory] = useState<ComparisonHistoryItem[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    setHistory(getComparisonHistory())
  }, [])

  const addComparison = (cars: Car[]) => {
    if (!isClient) return
    addToComparisonHistory(cars)
    setHistory(getComparisonHistory())
  }

  const clearHistory = () => {
    if (!isClient) return
    clearComparisonHistory()
    setHistory([])
  }

  return {
    history,
    addComparison,
    clearHistory,
    isClient,
  }
}
