// GET /api/makes - Returns all available makes (no filtering needed)
// Heavily cached since this list rarely changes

import { NextResponse } from 'next/server'
import { fetchAllMakes } from '@/features/car-lookup/services/nhtsa-api'
import type { MakeOption } from '@/types'

export async function GET() {
  try {
    // Fetch all makes from NHTSA
    const nhtsaMakes = await fetchAllMakes()
    
    // Convert to our MakeOption format
    const makes: MakeOption[] = nhtsaMakes.map(make => ({
      makeId: make.Make_ID,
      makeName: make.Make_Name,
    }))
    
    return NextResponse.json(makes, {
      headers: {
        // Cache aggressively - makes list doesn't change often
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    })
  } catch (error) {
    console.error('Error fetching makes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch makes' },
      { status: 500 }
    )
  }
}
