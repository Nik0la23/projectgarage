// localStorage utilities for search history and cached data

import type { Car } from '@/types'

const STORAGE_KEYS = {
  SEARCH_HISTORY: 'projectgarage_search_history',
  RECENT_CARS: 'projectgarage_recent_cars',
} as const

const MAX_HISTORY_ITEMS = 10

// Type-safe localStorage wrapper
function getItem<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  
  try {
    const item = window.localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error)
    return null
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error)
  }
}

// Search history management
export interface SearchHistoryItem extends Car {
  searchedAt: string
}

export function getSearchHistory(): SearchHistoryItem[] {
  return getItem<SearchHistoryItem[]>(STORAGE_KEYS.SEARCH_HISTORY) || []
}

export function addToSearchHistory(car: Car): void {
  const history = getSearchHistory()
  
  // Check if car already exists
  const existingIndex = history.findIndex(
    item => item.year === car.year && 
            item.make === car.make && 
            item.model === car.model &&
            item.trim === car.trim
  )
  
  // Remove if exists (we'll add it to the front)
  if (existingIndex !== -1) {
    history.splice(existingIndex, 1)
  }
  
  // Add to front
  const newItem: SearchHistoryItem = {
    ...car,
    searchedAt: new Date().toISOString(),
  }
  history.unshift(newItem)
  
  // Keep only MAX_HISTORY_ITEMS
  const trimmedHistory = history.slice(0, MAX_HISTORY_ITEMS)
  
  setItem(STORAGE_KEYS.SEARCH_HISTORY, trimmedHistory)
}

export function clearSearchHistory(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY)
}

// Recent cars cache (for quick access)
export function getRecentCars(): Car[] {
  return getItem<Car[]>(STORAGE_KEYS.RECENT_CARS) || []
}

export function addRecentCar(car: Car): void {
  const recent = getRecentCars()
  
  // Remove if exists
  const filtered = recent.filter(
    item => !(item.year === car.year && 
              item.make === car.make && 
              item.model === car.model)
  )
  
  // Add to front
  filtered.unshift(car)
  
  // Keep only last 5
  const trimmed = filtered.slice(0, 5)
  
  setItem(STORAGE_KEYS.RECENT_CARS, trimmed)
}
