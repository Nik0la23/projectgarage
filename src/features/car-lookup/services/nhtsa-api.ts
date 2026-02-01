// NHTSA vPIC API integration
// Documentation: https://vpic.nhtsa.dot.gov/api/

import type { NHTSAMake, NHTSAModel } from '@/types'

const NHTSA_BASE_URL = 'https://vpic.nhtsa.dot.gov/api/vehicles'

interface NHTSAResponse<T> {
  Count: number
  Message: string
  SearchCriteria: string | null
  Results: T[]
}

// Whitelist of known car manufacturers (more reliable than exclusion list)
const CAR_MANUFACTURERS = new Set([
  // Major American Brands
  'FORD', 'CHEVROLET', 'DODGE', 'RAM', 'JEEP', 'GMC', 'CADILLAC', 'BUICK',
  'LINCOLN', 'CHRYSLER', 'TESLA', 'RIVIAN', 'LUCID', 'FISKER',
  
  // Major European Brands
  'BMW', 'MERCEDES-BENZ', 'AUDI', 'VOLKSWAGEN', 'PORSCHE', 'VOLVO',
  'LAND ROVER', 'JAGUAR', 'BENTLEY', 'ROLLS-ROYCE', 'MINI', 'SMART',
  'FIAT', 'ALFA ROMEO', 'MASERATI', 'FERRARI', 'LAMBORGHINI',
  'PEUGEOT', 'RENAULT', 'CITROEN', 'SEAT', 'SKODA',
  
  // Major Asian Brands
  'TOYOTA', 'HONDA', 'NISSAN', 'MAZDA', 'SUBARU', 'MITSUBISHI', 'SUZUKI',
  'LEXUS', 'INFINITI', 'ACURA', 'HYUNDAI', 'KIA', 'GENESIS',
  
  // Chinese Brands
  'BYD', 'GEELY', 'NIO', 'XPENG', 'LI AUTO', 'POLESTAR', 'LYNK & CO',
  'GREAT WALL', 'CHERY', 'MG', 'AIWAYS',
  
  // Historic/Classic Brands
  'PLYMOUTH', 'PONTIAC', 'OLDSMOBILE', 'SATURN', 'MERCURY', 'HUMMER',
  'SAAB', 'DAEWOO', 'DAIHATSU', 'ISUZU', 'GEO', 'EAGLE',
  'AMC', 'AMERICAN MOTORS', 'STUDEBAKER', 'PACKARD', 'DESOTO',
  
  // Luxury/Exotic Brands
  'ASTON MARTIN', 'MCLAREN', 'BUGATTI', 'LOTUS', 'KOENIGSEGG',
  'PAGANI', 'MAYBACH', 'SPYKER',
  
  // Other Notable Brands
  'DACIA', 'LADA', 'TATA', 'MAHINDRA', 'SSANGYONG', 'PROTON',
  'HOLDEN', 'VAUXHALL', 'OPEL', 'DS', 'CUPRA',
])

// Helper function to check if a make is a car manufacturer
function isCarManufacturer(makeName: string): boolean {
  const upperName = makeName.toUpperCase().trim()
  
  // Use whitelist approach for known car manufacturers
  return CAR_MANUFACTURERS.has(upperName)
}

// Get all available makes
export async function fetchAllMakes(): Promise<NHTSAMake[]> {
  try {
    const response = await fetch(`${NHTSA_BASE_URL}/GetAllMakes?format=json`, {
      next: { revalidate: 86400 }, // Cache for 24 hours
    })
    
    if (!response.ok) {
      throw new Error(`NHTSA API error: ${response.status}`)
    }
    
    const data: NHTSAResponse<NHTSAMake> = await response.json()
    
    // Filter for valid car manufacturers only
    return data.Results
      .filter(make => 
        make.Make_Name && 
        typeof make.Make_Name === 'string' &&
        isCarManufacturer(make.Make_Name)
      )
      .sort((a, b) => a.Make_Name.localeCompare(b.Make_Name))
  } catch (error) {
    console.error('Error fetching makes from NHTSA:', error)
    throw error
  }
}

// Get models for a specific make and year
export async function fetchModelsForMakeYear(
  make: string,
  year: number
): Promise<NHTSAModel[]> {
  try {
    const response = await fetch(
      `${NHTSA_BASE_URL}/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${year}?format=json`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    )
    
    if (!response.ok) {
      throw new Error(`NHTSA API error: ${response.status}`)
    }
    
    const data: NHTSAResponse<NHTSAModel> = await response.json()
    
    // Filter out entries with undefined/null Model_Name and sort
    return data.Results
      .filter(model => model.Model_Name && typeof model.Model_Name === 'string')
      .sort((a, b) => a.Model_Name.localeCompare(b.Model_Name))
  } catch (error) {
    console.error('Error fetching models from NHTSA:', error)
    throw error
  }
}

// Validate if a make/model/year combination exists
export async function validateCarExists(
  make: string,
  model: string,
  year: number
): Promise<boolean> {
  try {
    const models = await fetchModelsForMakeYear(make, year)
    return models.some(
      m => m.Model_Name.toLowerCase() === model.toLowerCase()
    )
  } catch (error) {
    console.error('Error validating car:', error)
    return false
  }
}

// Generate year range (current year down to 1995 for CarQuery compatibility)
export function getAvailableYears(): number[] {
  const currentYear = new Date().getFullYear()
  const startYear = 1995
  const years: number[] = []
  
  for (let year = currentYear + 1; year >= startYear; year--) {
    years.push(year)
  }
  
  return years
}

// Get available years for a specific make and model
export async function fetchYearsForMakeModel(
  make: string,
  model: string
): Promise<number[]> {
  const currentYear = new Date().getFullYear()
  const startYear = 1995
  const years: number[] = []
  
  // Create array of years to check
  const yearsToCheck: number[] = []
  for (let year = currentYear + 1; year >= startYear; year--) {
    yearsToCheck.push(year)
  }
  
  try {
    // Check years in batches to speed up (10 years at a time)
    const batchSize = 10
    const batches: number[][] = []
    
    for (let i = 0; i < yearsToCheck.length; i += batchSize) {
      batches.push(yearsToCheck.slice(i, i + batchSize))
    }
    
    // Process batches sequentially to avoid overwhelming the API
    for (const batch of batches) {
      const promises = batch.map(async (year) => {
        try {
          const models = await fetchModelsForMakeYear(make, year)
          const hasModel = models.some(
            m => m.Model_Name.toLowerCase() === model.toLowerCase()
          )
          return hasModel ? year : null
        } catch (error) {
          console.error(`Error checking year ${year}:`, error)
          return null
        }
      })
      
      const results = await Promise.all(promises)
      years.push(...results.filter((y): y is number => y !== null))
    }
    
    return years.sort((a, b) => b - a) // Sort descending (newest first)
  } catch (error) {
    console.error('Error fetching years for make/model:', error)
    throw error
  }
}
