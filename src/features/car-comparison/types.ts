// Feature-specific types for car-comparison

import type { Car, CarSpecs } from '@/types/car'
import type { CarAnalysisResult, YouTubeVideo } from '@/features/car-lookup/types'

export interface ComparisonCar extends Car {
  // Reuses Car type from shared types
}

export interface ComparisonData {
  cars: ComparisonCar[]
  specs: (CarSpecs | null)[]  // Null if fetch failed
  analyses: (CarAnalysisResult | null)[]  // Null if fetch failed
  videos: YouTubeVideo[][]  // Array of video arrays
  comparisonAnalysis: ComparisonAnalysisResult | null
}

export interface ComparisonAnalysisResult {
  winner: {
    overall: string  // Car name "2020 Honda Civic"
    speed: string
    fuelEfficiency: string
    reliability: string
    value: string
  }
  strengths: {
    [carName: string]: string[]  // 3 strengths per car
  }
  weaknesses: {
    [carName: string]: string[]  // 2 weaknesses per car
  }
  bestFor: {
    [carName: string]: string  // "Best for families", "Best for commuting"
  }
  summary: string  // Overall comparison summary
}

export interface ComparisonCategory {
  name: string  // "Horsepower"
  key: keyof CarSpecs  // "horsepower"
  unit?: string  // "hp"
  higherIsBetter: boolean  // true
}
