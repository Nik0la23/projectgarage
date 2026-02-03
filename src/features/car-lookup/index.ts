// Public API for car-lookup feature module

// Components
export { CarSearchForm, CarSpecsPanel, CarReliabilityPanel, CarYouTubePanel } from './components'

// Hooks
export { useCarData } from './hooks/use-car-data'
export { useSearchHistory } from './hooks/use-search-history'
export { useCarAnalysis } from './hooks/use-car-analysis'
export { useYouTubeVideos } from './hooks/use-youtube-videos'

// Types
export type { CarLookupState, CarLookupResult, FetchSpecsParams } from './types'
export type { ForumSource, CarAnalysisResult, CachedAnalysis } from './types'
export type { YouTubeVideo, YouTubeSearchResult } from './types'
