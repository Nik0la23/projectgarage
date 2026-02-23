// Client-side service for calling the car finder API

import type { CarFinderFilters, CarFinderResult, CarFinderResponse } from '../types'

export async function fetchCarRecommendations(
  filters: CarFinderFilters,
  lifestyle: string,
  refinement?: string,
  previousResults?: CarFinderResult[]
): Promise<CarFinderResult[]> {
  const response = await fetch('/api/car-finder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filters, lifestyle, refinement, previousResults }),
  })

  const data: CarFinderResponse = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to get car recommendations')
  }

  return data.results || []
}
