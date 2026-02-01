// GET /api/years - Returns available years for car selection
// Supports filtering: GET /api/years?make=BMW&model=M3

import { NextRequest, NextResponse } from 'next/server'
import { getAvailableYears, fetchYearsForMakeModel } from '@/features/car-lookup/services/nhtsa-api'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const make = searchParams.get('make')
    const model = searchParams.get('model')
    
    // If make and model provided, fetch specific years
    if (make && model) {
      const years = await fetchYearsForMakeModel(make, model)
      
      return NextResponse.json(years, {
        headers: {
          // Aggressive caching for model year data (doesn't change often)
          'Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=86400', // 1 week
        },
      })
    }
    
    // Otherwise return all years
    const years = getAvailableYears()
    
    return NextResponse.json(years, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
      },
    })
  } catch (error) {
    console.error('Error fetching years:', error)
    return NextResponse.json(
      { error: 'Failed to fetch years' },
      { status: 500 }
    )
  }
}
