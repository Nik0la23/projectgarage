// POST /api/car-analysis - Analyze car reliability from forums and articles
// GET /api/car-analysis - Test endpoint with query params

import { NextRequest, NextResponse } from 'next/server'
import { analyzeCarReliability } from '@/features/car-lookup/services/forum-analysis/forum-aggregator'

interface AnalysisRequest {
  make: string
  model: string
  year: number
}

// POST handler - Primary endpoint
export async function POST(request: NextRequest) {
  try {
    const body: AnalysisRequest = await request.json()
    const { make, model, year } = body

    // Validate required fields
    if (!make || !model || !year) {
      return NextResponse.json(
        {
          success: false,
          error: 'Make, model, and year are required',
        },
        { status: 400 }
      )
    }

    // Validate year range
    const currentYear = new Date().getFullYear()
    if (year < 1990 || year > currentYear + 1) {
      return NextResponse.json(
        {
          success: false,
          error: `Year must be between 1990 and ${currentYear + 1}`,
        },
        { status: 400 }
      )
    }

    // Call orchestrator
    const analysis = await analyzeCarReliability(make, model, year)

    return NextResponse.json(
      {
        success: true,
        data: analysis,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    )
  } catch (error) {
    console.error('[API] Car analysis failed:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    )
  }
}

// GET handler - For testing with query parameters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const make = searchParams.get('make')
    const model = searchParams.get('model')
    const yearStr = searchParams.get('year')

    // Validate parameters
    if (!make || !model || !yearStr) {
      return NextResponse.json(
        {
          success: false,
          error: 'Query parameters required: make, model, year',
          example: '/api/car-analysis?make=Toyota&model=Camry&year=2020',
        },
        { status: 400 }
      )
    }

    // Parse year
    const year = parseInt(yearStr, 10)
    if (isNaN(year)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Year must be a valid number',
        },
        { status: 400 }
      )
    }

    // Validate year range
    const currentYear = new Date().getFullYear()
    if (year < 1990 || year > currentYear + 1) {
      return NextResponse.json(
        {
          success: false,
          error: `Year must be between 1990 and ${currentYear + 1}`,
        },
        { status: 400 }
      )
    }

    // Call orchestrator
    const analysis = await analyzeCarReliability(make, model, year)

    return NextResponse.json(
      {
        success: true,
        data: analysis,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    )
  } catch (error) {
    console.error('[API] Car analysis failed:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    )
  }
}
