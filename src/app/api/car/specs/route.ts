// GET /api/car/specs?make=bmw&year=2024&model=m3 - Returns full specifications

import { NextRequest, NextResponse } from 'next/server'
import { 
  fetchCarQueryTrims, 
  mapCarQueryToSpecs,
  isCarQuerySupported 
} from '@/features/car-lookup/services/carquery-api'
import { validateCarExists } from '@/features/car-lookup/services/nhtsa-api'
import { generateAISpecs, getFallbackSpecs } from '@/features/car-lookup/services/ai-fallback'
import type { CarSpecs } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const year = searchParams.get('year')
    const make = searchParams.get('make')
    const model = searchParams.get('model')
    const trim = searchParams.get('trim') // Optional trim parameter
    
    if (!make || !year || !model) {
      return NextResponse.json(
        { error: 'Make, year, and model parameters are required' },
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
    
    // Step 1: Validate with NHTSA (always check if car exists)
    const exists = await validateCarExists(make, model, yearNum)
    if (!exists) {
      return NextResponse.json(
        { error: 'Car not found in database' },
        { status: 404 }
      )
    }
    
    // Step 2: Try CarQuery API for detailed specs (if supported year range)
    if (isCarQuerySupported(yearNum)) {
      console.log(`[Specs] Trying CarQuery for ${yearNum} ${make} ${model}`)
      const trims = await fetchCarQueryTrims(make, model, yearNum)
      console.log(`[Specs] CarQuery returned ${trims.length} trims`)
      
      if (trims.length > 0) {
        // If trim is specified, find it; otherwise use first trim
        let selectedTrim = trims[0]
        
        if (trim) {
          const matchedTrim = trims.find(t => t.model_trim === trim)
          if (matchedTrim) {
            selectedTrim = matchedTrim
          }
        }
        
        const specs = mapCarQueryToSpecs(selectedTrim)
        console.log(`[Specs] Returning CarQuery specs for ${specs.make} ${specs.model}`)
        
        return NextResponse.json(specs, {
          headers: {
            'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
          },
        })
      } else {
        console.log(`[Specs] CarQuery returned no trims, falling back to AI`)
      }
    }
    
    // Step 3: Fall back to AI-generated specs
    try {
      console.log(`[Specs] Generating AI specs for ${yearNum} ${make} ${model}`)
      const aiSpecs = await generateAISpecs({
        make,
        model,
        year: yearNum,
      })
      console.log(`[Specs] AI generation successful`)
      
      return NextResponse.json(aiSpecs, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
        },
      })
    } catch (aiError) {
      console.error('[Specs] AI generation failed:', aiError)
      
      // Return basic specs as last resort
      console.log(`[Specs] Using fallback specs`)
      const fallbackSpecs = getFallbackSpecs({
        make,
        model,
        year: yearNum,
      })
      
      return NextResponse.json(fallbackSpecs, {
        headers: {
          'Cache-Control': 'public, s-maxage=600',
        },
      })
    }
  } catch (error) {
    console.error('Error fetching car specs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch car specifications' },
      { status: 500 }
    )
  }
}
