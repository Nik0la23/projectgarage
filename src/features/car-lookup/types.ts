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

// Forum/Article Analysis Types

export interface ForumSource {
  title: string
  body: string
  sourceType: 'reddit' | 'edmunds' | 'web-article'
  score?: number        // Reddit upvotes or Edmunds rating
  rating?: number       // Edmunds star rating (1-5)
  url: string
}

export interface CarAnalysisResult {
  // Analysis results
  commonProblems: Array<{ issue: string; sources: string[] }>
  whatOwnersLove: string[]
  whatOwnersHate: string[]
  standoutFeatures: string[]  // Cool features, technology, design highlights
  reliabilityScore: number  // 1-10
  expertVsOwner: string     // Comparison text
  overallVerdict: string
  
  // Metadata
  sourceCounts: {
    reddit: number
    edmunds: number
    webArticles: number
    total: number
  }
  
  // Raw sources with links
  rawSources?: {
    reddit: ForumSource[]
    edmunds: ForumSource[]
    webArticles: ForumSource[]
  }
  
  rawAnalysis?: string      // Full AI response for debugging
  dataSource: 'ai-generated'
  analyzedAt: string        // ISO timestamp
}

export interface CachedAnalysis {
  data: CarAnalysisResult
  timestamp: number
  cacheKey: string
}

// YouTube Video Types

export interface YouTubeVideo {
  videoId: string
  title: string
  description: string
  thumbnail: string
  channelTitle: string
  publishedAt: string
  viewCount?: number
  likeCount?: number
  duration?: string
}

export interface YouTubeSearchResult {
  videos: YouTubeVideo[]
  totalResults: number
}
