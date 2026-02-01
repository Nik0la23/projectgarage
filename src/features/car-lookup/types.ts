// Feature-specific types for car-lookup

import type { CarSpecs } from '@/types'

export interface CarLookupState {
  year: number | null
  make: string | null
  model: string | null
  trim: string | null
}

export interface CarLookupResult {
  specs: CarSpecs | null
  loading: boolean
  error: string | null
}

export interface DropdownOption {
  value: string
  label: string
}

export interface FetchSpecsParams {
  make: string
  model: string
  year: number
  trim?: string
}
