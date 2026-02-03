// GET /api/youtube/search?make=Honda&model=Civic&year=2020 - Search YouTube for car review videos

import { NextRequest, NextResponse } from 'next/server'
import { searchCarVideos } from '@/features/car-lookup/services/youtube-api'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const make = searchParams.get('make')
    const model = searchParams.get('model')
    const year = searchParams.get('year')
    const maxResults = searchParams.get('maxResults')

    if (!make || !model || !year) {
      return NextResponse.json(
        { error: 'Make, model, and year parameters are required' },
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

    const maxResultsNum = maxResults ? parseInt(maxResults) : 6
    if (isNaN(maxResultsNum) || maxResultsNum < 1 || maxResultsNum > 50) {
      return NextResponse.json(
        { error: 'maxResults must be between 1 and 50' },
        { status: 400 }
      )
    }

    // Search YouTube for videos
    const result = await searchCarVideos(make, model, yearNum, maxResultsNum)

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      {
        headers: {
          // Cache for 24 hours (videos don't change often)
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
        },
      }
    )
  } catch (error) {
    console.error('[API] YouTube search failed:', error)

    // Check if it's an API key error
    if (error instanceof Error && error.message.includes('not configured')) {
      return NextResponse.json(
        {
          success: false,
          error: 'YouTube API is not configured. Please add YOUTUBE_API_KEY to environment variables.',
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch YouTube videos',
      },
      { status: 500 }
    )
  }
}
