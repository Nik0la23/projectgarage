// In-memory cache manager for car analysis results
// This will be replaced with database storage in V4

import type { CarAnalysisResult, CachedAnalysis } from '@/features/car-lookup/types'

// Cache duration: 7 days in milliseconds
const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 604,800,000 ms

// In-memory cache storage
const cache = new Map<string, CachedAnalysis>()

// Generate cache key from car details
function generateCacheKey(make: string, model: string, year: number): string {
  return `${make.toLowerCase()}-${model.toLowerCase()}-${year}`
}

// Get cached analysis if it exists and is not expired
export function getCachedAnalysis(
  make: string,
  model: string,
  year: number
): CarAnalysisResult | null {
  const cacheKey = generateCacheKey(make, model, year)
  const cached = cache.get(cacheKey)

  if (!cached) {
    console.log(`[Cache] Miss for ${cacheKey}`)
    return null
  }

  // Check if cache is expired
  const now = Date.now()
  const age = now - cached.timestamp
  const isExpired = age > CACHE_DURATION_MS

  if (isExpired) {
    console.log(`[Cache] Expired for ${cacheKey} (age: ${Math.round(age / 1000 / 60 / 60)} hours)`)
    cache.delete(cacheKey)
    return null
  }

  const ageHours = Math.round(age / 1000 / 60 / 60)
  console.log(`[Cache] Hit for ${cacheKey} (age: ${ageHours} hours)`)
  return cached.data
}

// Save analysis to cache
export function saveCachedAnalysis(
  make: string,
  model: string,
  year: number,
  data: CarAnalysisResult
): void {
  const cacheKey = generateCacheKey(make, model, year)
  const now = Date.now()

  const cached: CachedAnalysis = {
    data,
    timestamp: now,
    cacheKey,
  }

  cache.set(cacheKey, cached)
  console.log(`[Cache] Saved ${cacheKey} (expires in 7 days)`)
}

// Clear expired cache entries (call periodically)
export function clearExpiredCache(): void {
  const now = Date.now()
  let clearedCount = 0

  for (const [key, cached] of cache.entries()) {
    const age = now - cached.timestamp
    if (age > CACHE_DURATION_MS) {
      cache.delete(key)
      clearedCount++
    }
  }

  if (clearedCount > 0) {
    console.log(`[Cache] Cleared ${clearedCount} expired entries`)
  }
}

// Get cache statistics (for debugging)
export function getCacheStats() {
  const now = Date.now()
  const entries = Array.from(cache.values())

  return {
    totalEntries: cache.size,
    oldestEntry: entries.length > 0
      ? Math.min(...entries.map(e => e.timestamp))
      : null,
    newestEntry: entries.length > 0
      ? Math.max(...entries.map(e => e.timestamp))
      : null,
    averageAge: entries.length > 0
      ? entries.reduce((sum, e) => sum + (now - e.timestamp), 0) / entries.length
      : 0,
  }
}

// Clear all cache (useful for testing)
export function clearAllCache(): void {
  const size = cache.size
  cache.clear()
  console.log(`[Cache] Cleared all ${size} entries`)
}
