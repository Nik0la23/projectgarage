// POST /api/compare - Compare multiple cars with specs, analyses, and AI insights

import { NextRequest, NextResponse } from 'next/server'
import { analyzeCarReliability } from '@/features/car-lookup/services/forum-analysis/forum-aggregator'
import { searchCarVideos } from '@/features/car-lookup/services/youtube-api'
import { generateComparisonAnalysis } from '@/features/car-comparison/services/comparison-analyzer'
import type { ComparisonCar, ComparisonData } from '@/features/car-comparison/types'
import type { CarSpecs } from '@/types/car'
import type { CarAnalysisResult, YouTubeVideo } from '@/features/car-lookup/types'

interface CompareRequest {
  cars: ComparisonCar[]
}

export async function POST(request: NextRequest) {
  try {
    const body: CompareRequest = await request.json()
    const { cars } = body

    // Validate input
    if (!cars || !Array.isArray(cars)) {
      return NextResponse.json(
        { success: false, error: 'Cars array is required' },
        { status: 400 }
      )
    }

    if (cars.length < 2 || cars.length > 3) {
      return NextResponse.json(
        { success: false, error: 'Must compare between 2 and 3 cars' },
        { status: 400 }
      )
    }

    // Validate each car has required fields
    for (const car of cars) {
      if (!car.make || !car.model || !car.year) {
        return NextResponse.json(
          { success: false, error: 'Each car must have make, model, and year' },
          { status: 400 }
        )
      }
    }

    console.log(`[API/Compare] Comparing ${cars.length} cars...`)

    // Fetch specs for each car in parallel
    const specsPromises = cars.map(async (car) => {
      try {
        const params = new URLSearchParams({
          make: car.make,
          model: car.model,
          year: car.year.toString(),
        })
        if (car.trim) {
          params.set('trim', car.trim)
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/car/specs?${params}`,
          { cache: 'no-store' }
        )

        if (!response.ok) {
          console.error(`[API/Compare] Failed to fetch specs for ${car.year} ${car.make} ${car.model}`)
          return null
        }

        const data = await response.json()
        return data as CarSpecs
      } catch (error) {
        console.error(`[API/Compare] Error fetching specs for ${car.year} ${car.make} ${car.model}:`, error)
        return null
      }
    })

    // Fetch forum analyses for each car in parallel
    const analysesPromises = cars.map(async (car) => {
      try {
        const analysis = await analyzeCarReliability(car.make, car.model, car.year)
        return analysis
      } catch (error) {
        console.error(`[API/Compare] Error fetching analysis for ${car.year} ${car.make} ${car.model}:`, error)
        return null
      }
    })

    // Fetch YouTube videos for each car in parallel
    const videosPromises = cars.map(async (car) => {
      try {
        const result = await searchCarVideos(car.make, car.model, car.year, 6)
        return result.videos
      } catch (error) {
        console.error(`[API/Compare] Error fetching videos for ${car.year} ${car.make} ${car.model}:`, error)
        return [] as YouTubeVideo[]
      }
    })

    // Execute all fetches in parallel using Promise.allSettled
    const [specsResults, analysesResults, videosResults] = await Promise.all([
      Promise.allSettled(specsPromises),
      Promise.allSettled(analysesPromises),
      Promise.allSettled(videosPromises),
    ])

    // Extract results (use null for failed fetches)
    const specs: (CarSpecs | null)[] = specsResults.map(result =>
      result.status === 'fulfilled' ? result.value : null
    )

    const analyses: (CarAnalysisResult | null)[] = analysesResults.map(result =>
      result.status === 'fulfilled' ? result.value : null
    )

    const videos: YouTubeVideo[][] = videosResults.map(result =>
      result.status === 'fulfilled' ? result.value : []
    )

    console.log('[API/Compare] All data fetched, generating AI comparison...')

    // Generate AI comparison analysis
    let comparisonAnalysis = null
    try {
      comparisonAnalysis = await generateComparisonAnalysis(cars, specs, analyses)
    } catch (error) {
      console.error('[API/Compare] Error generating comparison analysis:', error)
      // Continue without comparison analysis rather than failing entirely
    }

    // Build response
    const comparisonData: ComparisonData = {
      cars,
      specs,
      analyses,
      videos,
      comparisonAnalysis,
    }

    console.log('[API/Compare] Comparison completed successfully')

    return NextResponse.json(
      {
        success: true,
        data: comparisonData,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    )
  } catch (error) {
    console.error('[API/Compare] Comparison failed:', error)

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
