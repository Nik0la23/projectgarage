// CarQuery API integration
// Documentation: https://www.carqueryapi.com/documentation/

import type { CarQueryTrim, CarSpecs } from '@/types'

const CARQUERY_BASE_URL = 'https://www.carqueryapi.com/api/0.3/'

interface CarQueryResponse<T> {
  Trims?: T[]
}

// Get available trims/specs for a specific make, model, and year
export async function fetchCarQueryTrims(
  make: string,
  model: string,
  year: number
): Promise<CarQueryTrim[]> {
  try {
    // CarQuery uses JSONP, but we can remove the callback wrapper
    const url = new URL(CARQUERY_BASE_URL)
    url.searchParams.set('cmd', 'getTrims')
    url.searchParams.set('make', make.toLowerCase())
    url.searchParams.set('model', model.toLowerCase())
    url.searchParams.set('year', year.toString())
    
    console.log(`[CarQuery] Fetching trims: ${url.toString()}`)
    
    const response = await fetch(url.toString(), {
      next: { revalidate: 86400 }, // Cache for 24 hours (static data)
    })
    
    console.log(`[CarQuery] Response status: ${response.status}`)
    
    if (!response.ok) {
      console.error(`[CarQuery] API error: ${response.status} ${response.statusText}`)
      throw new Error(`CarQuery API error: ${response.status}`)
    }
    
    const text = await response.text()
    console.log(`[CarQuery] Response text length: ${text.length} chars`)
    
    // Remove JSONP wrapper if present
    const jsonText = text.replace(/^\?\(/, '').replace(/\);?$/, '')
    const data: CarQueryResponse<CarQueryTrim> = JSON.parse(jsonText)
    
    const trimsCount = data.Trims?.length || 0
    console.log(`[CarQuery] Found ${trimsCount} trims`)
    
    return data.Trims || []
  } catch (error) {
    console.error('[CarQuery] Error fetching trims:', error)
    return []
  }
}

// Convert CarQuery data to our CarSpecs format
export function mapCarQueryToSpecs(trim: CarQueryTrim): CarSpecs {
  // Helper to parse numbers safely
  const parseNum = (value: string | undefined): number | undefined => {
    if (!value) return undefined
    const num = parseFloat(value)
    return isNaN(num) ? undefined : num
  }
  
  return {
    make: trim.model_make_id,
    model: trim.model_name,
    year: parseInt(trim.model_year),
    trim: trim.model_trim,
    bodyType: trim.model_body,
    
    // Engine
    engine: trim.model_engine_cc 
      ? `${trim.model_engine_cc}cc ${trim.model_engine_cyl}-cyl ${trim.model_engine_type}`
      : undefined,
    horsepower: parseNum(trim.model_engine_power_ps),
    torque: parseNum(trim.model_engine_torque_nm),
    transmission: trim.model_transmission_type,
    drivetrain: trim.model_drive,
    
    // Fuel
    fuelType: trim.model_engine_fuel,
    mpgCity: trim.model_lkm_city ? convertL100kmToMPG(parseNum(trim.model_lkm_city)) : undefined,
    mpgHighway: trim.model_lkm_hwy ? convertL100kmToMPG(parseNum(trim.model_lkm_hwy)) : undefined,
    mpgCombined: trim.model_lkm_mixed ? convertL100kmToMPG(parseNum(trim.model_lkm_mixed)) : undefined,
    fuelCapacity: parseNum(trim.model_fuel_cap_l),
    
    // Dimensions
    length: parseNum(trim.model_length_mm),
    width: parseNum(trim.model_width_mm),
    height: parseNum(trim.model_height_mm),
    wheelbase: parseNum(trim.model_wheelbase_mm),
    curbWeight: parseNum(trim.model_weight_kg),
    
    // Performance
    zeroToSixty: parseNum(trim.model_0_to_100_kph),
    topSpeed: parseNum(trim.model_top_speed_kph),
    
    // Metadata
    dataSource: 'verified',
    sourceApi: 'carquery',
  }
}

// Convert L/100km to MPG (US)
function convertL100kmToMPG(l100km: number | undefined): number | undefined {
  if (!l100km || l100km === 0) return undefined
  return Math.round(235.214583 / l100km)
}

// Check if CarQuery has data for this year range (1995-2022)
export function isCarQuerySupported(year: number): boolean {
  return year >= 1995 && year <= 2022
}
