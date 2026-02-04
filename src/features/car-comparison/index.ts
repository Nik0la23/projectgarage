// Barrel export for car-comparison feature

// Components
export { ComparisonPage } from './components/ComparisonPage'
export { CarSelector } from './components/CarSelector'
export { SpecsComparisonTable } from './components/SpecsComparisonTable'
export { ComparisonAnalysis } from './components/ComparisonAnalysis'
export { IndividualCarAnalysis } from './components/IndividualCarAnalysis'

// Hooks
export { useComparison } from './hooks/use-comparison'

// Services
export { generateComparisonAnalysis } from './services/comparison-analyzer'

// Types
export type {
  ComparisonCar,
  ComparisonData,
  ComparisonAnalysisResult,
  ComparisonCategory,
} from './types'
