// GET /api/trims?make=bmw&year=2020&model=M3 - Returns available trims for a make, year, and model
// Uses 2-tier strategy: CarQuery API → Groq AI fallback

import { NextRequest, NextResponse } from 'next/server'
import { fetchCarQueryTrims, isCarQuerySupported } from '@/features/car-lookup/services/carquery-api'
import { generateAITrims } from '@/features/car-lookup/services/ai-fallback'
import type { TrimOption } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const make = searchParams.get('make')
    const year = searchParams.get('year')
    const model = searchParams.get('model')
    
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
    
    // Step 1: Try CarQuery API first (if supported year range)
    let trims: TrimOption[] = []
    
    if (isCarQuerySupported(yearNum)) {
      const carQueryTrims = await fetchCarQueryTrims(make, model, yearNum)
      
      if (carQueryTrims.length > 0) {
        // Convert CarQuery data to our TrimOption format with detailed display names
        trims = carQueryTrims.map(trim => {
      // Build detailed display name: "Trim Name Engine (fuel, transmission)"
      const parts: string[] = []
      
      // Add trim name
      if (trim.model_trim) {
        parts.push(trim.model_trim)
      }
      
      // Add engine size and cylinders
      if (trim.model_engine_cc && trim.model_engine_cyl) {
        const liters = (parseFloat(trim.model_engine_cc) / 1000).toFixed(1)
        parts.push(`${liters}L ${trim.model_engine_cyl}-cyl`)
      } else if (trim.model_engine_cc) {
        const liters = (parseFloat(trim.model_engine_cc) / 1000).toFixed(1)
        parts.push(`${liters}L`)
      }
      
      // Add fuel type and transmission in parentheses
      const details: string[] = []
      if (trim.model_engine_fuel) {
        // Simplify fuel names
        let fuelType = trim.model_engine_fuel.toLowerCase()
        if (fuelType.includes('diesel')) {
          fuelType = 'diesel'
        } else if (fuelType.includes('electric')) {
          fuelType = 'electric'
        } else if (fuelType.includes('hybrid')) {
          fuelType = 'hybrid'
        } else if (fuelType.includes('e85') || fuelType.includes('flex')) {
          fuelType = 'flex-fuel'
        } else if (fuelType.includes('premium') || fuelType.includes('unleaded')) {
          fuelType = 'petrol'
        } else if (fuelType.includes('gasoline') || fuelType.includes('petrol')) {
          fuelType = 'petrol'
        }
        details.push(fuelType)
      }
      
      if (trim.model_transmission_type) {
        // Simplify transmission names
        let transType = trim.model_transmission_type.toLowerCase()
        if (transType.includes('automatic') || transType.includes('auto') || /\dam/.test(transType)) {
          transType = 'automatic'
        } else if (transType.includes('manual') || /\dm/.test(transType)) {
          transType = 'manual'
        } else if (transType.includes('cvt')) {
          transType = 'CVT'
        } else if (transType.includes('dct') || transType.includes('dual')) {
          transType = 'dual-clutch'
        } else if (transType.includes('direct')) {
          transType = 'direct drive'
        }
        details.push(transType)
      }
      
      // Combine everything
      let displayName = parts.join(' ')
      if (details.length > 0) {
        displayName += ` (${details.join(', ')})`
      }
      
          return {
            trimId: `${trim.model_id}-${trim.model_trim.replace(/\s+/g, '-').toLowerCase()}`,
            trimName: trim.model_trim,
            displayName: displayName || trim.model_trim,
            dataSource: 'verified',
          }
        })
        
        // Return verified CarQuery data
        return NextResponse.json(trims, {
          headers: {
            'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
          },
        })
      }
    }
    
    // Step 2: Fall back to AI-generated trims if no CarQuery data
    try {
      const aiTrims = await generateAITrims({ make, model, year: yearNum })
      
      return NextResponse.json(aiTrims, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600', // Shorter cache for AI data
        },
      })
    } catch (aiError) {
      console.error('AI trim generation failed:', aiError)
      // Return empty array if AI also fails
      return NextResponse.json([], {
        headers: {
          'Cache-Control': 'public, s-maxage=300', // Short cache on failure
        },
      })
    }
  } catch (error) {
    console.error('Error fetching trims:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trims' },
      { status: 500 }
    )
  }
}
