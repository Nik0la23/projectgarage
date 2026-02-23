// Types for the Car Finder feature

export interface CarFinderFilters {
  carType?: string        // 'sedan' | 'suv' | 'truck' | 'coupe' | 'hatchback' | 'convertible' | 'minivan' | 'wagon'
  budgetMax?: number      // Max budget in USD
  fuelType?: string       // 'gasoline' | 'diesel' | 'hybrid' | 'electric' | 'plug-in hybrid'
  seats?: number          // 2, 4, 5, 7, 8
  transmission?: string   // 'automatic' | 'manual'
  // More filters (secondary)
  drivetrain?: string     // 'fwd' | 'rwd' | 'awd' | '4wd'
  condition?: string      // 'new' | 'used'
  brandPreference?: string
}

export interface CarFinderPreferences {
  savedAt: string
  filters: CarFinderFilters
  lifestyle?: string
  results?: CarFinderResult[]  // Last analysis results, restored on next visit
}

export interface CarFinderResult {
  id: string
  make: string
  model: string
  yearRange: string       // e.g., "2020-2024"
  category: string        // e.g., "Compact SUV"
  engineType?: string     // e.g., "1.5L Turbocharged 4-cylinder"
  priceRange?: string     // e.g., "$22,000 - $28,000"
  fuelEconomy?: string    // e.g., "28 city / 36 highway mpg"
  seats?: string          // e.g., "5"
  drivetrain?: string     // e.g., "FWD (AWD available)"
  whyItMatches: string    // AI-generated explanation
  matchScore: number      // 0-100
}

export interface CarFinderState {
  filters: CarFinderFilters
  lifestyle: string
  results: CarFinderResult[] | null
  refinement: string
  loading: boolean
  error: string | null
}

export interface CarFinderRequest {
  filters: CarFinderFilters
  lifestyle: string
  refinement?: string
  previousResults?: CarFinderResult[]
}

export interface CarFinderResponse {
  success: boolean
  results?: CarFinderResult[]
  error?: string
}

export interface MatchScoreBreakdown {
  total: number
  bodyType?: { score: number; matched: boolean }
  fuelType?: { score: number; matched: boolean }
  transmission?: { score: number; matched: boolean }
  drivetrain?: { score: number; matched: boolean }
  seats?: { score: number; matched: boolean }
}
