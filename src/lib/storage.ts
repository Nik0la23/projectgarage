// localStorage utilities for search history and cached data

import type { Car } from '@/types'
import type { CarFinderPreferences } from '@/features/car-finder/types'

const STORAGE_KEYS = {
  SEARCH_HISTORY: 'projectgarage_search_history',
  RECENT_CARS: 'projectgarage_recent_cars',
  COMPARISON_HISTORY: 'projectgarage_comparison_history',
  SIDEBAR_OPEN: 'projectgarage_sidebar_open',
  FINDER_PREFERENCES: 'projectgarage_finder_preferences',
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

// Comparison history management
export interface ComparisonHistoryItem {
  id: string           // unique ID (timestamp + random suffix)
  cars: Car[]          // 2-3 cars in the comparison
  comparedAt: string   // ISO timestamp
}

export function getComparisonHistory(): ComparisonHistoryItem[] {
  return getItem<ComparisonHistoryItem[]>(STORAGE_KEYS.COMPARISON_HISTORY) || []
}

export function addToComparisonHistory(cars: Car[]): void {
  const history = getComparisonHistory()

  // Deduplicate: same set of cars (order-insensitive)
  const incomingKey = [...cars]
    .map(c => `${c.year}-${c.make}-${c.model}-${c.trim ?? ''}`)
    .sort()
    .join('|')

  const existingIndex = history.findIndex(item => {
    const key = [...item.cars]
      .map(c => `${c.year}-${c.make}-${c.model}-${c.trim ?? ''}`)
      .sort()
      .join('|')
    return key === incomingKey
  })

  if (existingIndex !== -1) {
    history.splice(existingIndex, 1)
  }

  const newItem: ComparisonHistoryItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    cars,
    comparedAt: new Date().toISOString(),
  }
  history.unshift(newItem)

  setItem(STORAGE_KEYS.COMPARISON_HISTORY, history.slice(0, MAX_HISTORY_ITEMS))
}

export function clearComparisonHistory(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEYS.COMPARISON_HISTORY)
}

// Sidebar open/closed state
export function getSidebarOpen(): boolean {
  return getItem<boolean>(STORAGE_KEYS.SIDEBAR_OPEN) ?? false
}

export function setSidebarOpen(value: boolean): void {
  setItem(STORAGE_KEYS.SIDEBAR_OPEN, value)
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

// Car Finder preferences (used to power match indicators across the app)

export function getFinderPreferences(): CarFinderPreferences | null {
  return getItem<CarFinderPreferences>(STORAGE_KEYS.FINDER_PREFERENCES)
}

export function saveFinderPreferences(prefs: CarFinderPreferences): void {
  setItem(STORAGE_KEYS.FINDER_PREFERENCES, prefs)
}

export function clearFinderPreferences(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEYS.FINDER_PREFERENCES)
}
