// Public API for car-lookup feature module

// Components
export { CarSearchForm, CarSpecsPanel, CarReliabilityPanel } from './components'

// Hooks
export { useCarData } from './hooks/use-car-data'
export { useSearchHistory } from './hooks/use-search-history'
export { useCarAnalysis } from './hooks/use-car-analysis'

// Types
export type { CarLookupState, CarLookupResult, FetchSpecsParams } from './types'
export type { ForumSource, CarAnalysisResult, CachedAnalysis } from './types'
