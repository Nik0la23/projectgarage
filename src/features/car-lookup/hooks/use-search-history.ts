'use client'

// Client-side hook for managing search history

import { useState, useEffect } from 'react'
import { 
  getSearchHistory, 
  addToSearchHistory, 
  clearSearchHistory,
  type SearchHistoryItem 
} from '@/lib/storage'
import type { Car } from '@/types'

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([])
  const [isClient, setIsClient] = useState(false)

  // Load history on mount (client-side only)
  useEffect(() => {
    setIsClient(true)
    setHistory(getSearchHistory())
  }, [])

  const addSearch = (car: Car) => {
    if (!isClient) return
    addToSearchHistory(car)
    setHistory(getSearchHistory())
  }

  const clearHistory = () => {
    if (!isClient) return
    clearSearchHistory()
    setHistory([])
  }

  return {
    history,
    addSearch,
    clearHistory,
    isClient,
  }
}
