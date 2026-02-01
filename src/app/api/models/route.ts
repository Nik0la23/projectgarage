// GET /api/models?make=bmw&year=2024 - Returns available models for a make and year

import { NextRequest, NextResponse } from 'next/server'
import { fetchModelsForMakeYear } from '@/features/car-lookup/services/nhtsa-api'
import type { ModelOption } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const year = searchParams.get('year')
    const make = searchParams.get('make')
    
    if (!year || !make) {
      return NextResponse.json(
        { error: 'Year and make parameters are required' },
        { status: 400 }
      )
    }
    
    const yearNum = parseInt(year)
    if (isNaN(yearNum)) {
      return NextResponse.json(
        { error: 'Invalid year parameter' },
        { status: 400 }
      )
    }
    
    // Fetch models from NHTSA
    const nhtsamodels = await fetchModelsForMakeYear(make, yearNum)
    
    // Convert to our ModelOption format
    const models: ModelOption[] = nhtsamodels.map(model => ({
      modelId: model.Model_ID,
      modelName: model.Model_Name,
    }))
    
    return NextResponse.json(models, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
      },
    })
  } catch (error) {
    console.error('Error fetching models:', error)
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    )
  }
}
