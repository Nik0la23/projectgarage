// Main orchestrator for forum/article analysis
// Coordinates all data sources, caching, and AI analysis

import { fetchRedditDiscussions } from './sources/reddit'
import { fetchBraveArticles } from './sources/brave'
import { fetchEdmundsReviews } from './sources/edmunds'
import { analyzeCarReliability as runGroqAnalysis } from './groq-analyzer'
import { getCachedAnalysis, saveCachedAnalysis } from './cache-manager'
import type { CarAnalysisResult, ForumSource } from '@/features/car-lookup/types'

// Main function to analyze car reliability
export async function analyzeCarReliability(
  make: string,
  model: string,
  year: number
): Promise<CarAnalysisResult> {
  console.log(`\n=== Starting Car Analysis: ${year} ${make} ${model} ===\n`)

  // STEP 1: Check cache first
  const cachedResult = getCachedAnalysis(make, model, year)
  if (cachedResult) {
    console.log('[Orchestrator] Cache hit - returning cached analysis')
    return cachedResult
  }

  console.log('[Orchestrator] Cache miss - fetching fresh data')

  // STEP 2: Fetch from all sources in parallel (using Promise.allSettled)
  console.log('[Orchestrator] Fetching data from all sources in parallel...')
  
  const startTime = Date.now()
  
  const results = await Promise.allSettled([
    fetchRedditDiscussions(make, model, year),
    fetchBraveArticles(make, model, year),
    fetchEdmundsReviews(make, model, year),
  ])

  const fetchDuration = Date.now() - startTime
  console.log(`[Orchestrator] Data fetching completed in ${fetchDuration}ms`)

  // STEP 3: Extract successful results or use empty arrays for failures
  const redditPosts: ForumSource[] = 
    results[0].status === 'fulfilled' ? results[0].value : []
  
  const webArticles: ForumSource[] = 
    results[1].status === 'fulfilled' ? results[1].value : []
  
  const edmundsReviews: ForumSource[] = 
    results[2].status === 'fulfilled' ? results[2].value : []

  // Log any failures with detailed information
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      const sourceName = ['Reddit', 'Brave', 'Edmunds'][index]
      console.error(`[Orchestrator] ${sourceName} failed:`, result.reason)
      if (result.reason instanceof Error) {
        console.error(`[Orchestrator] ${sourceName} error details:`, {
          name: result.reason.name,
          message: result.reason.message,
          stack: result.reason.stack
        })
      }
    }
  })

  // Calculate total sources
  const totalSources = redditPosts.length + webArticles.length + edmundsReviews.length

  console.log('[Orchestrator] Source counts:', {
    reddit: redditPosts.length,
    brave: webArticles.length,
    edmunds: edmundsReviews.length,
    total: totalSources,
  })

  // STEP 4: Validate we have enough data
  if (totalSources === 0) {
    throw new Error(
      `No data found for ${year} ${make} ${model}. ` +
      'This car may be too obscure or the model/year combination may not exist.'
    )
  }

  // STEP 5: Analyze with Groq AI
  console.log('[Orchestrator] Analyzing data with Groq AI...')
  
  const analysisStartTime = Date.now()
  
  const analysis = await runGroqAnalysis({
    make,
    model,
    year,
    redditPosts,
    edmundsReviews,
    webArticles,
  })

  const analysisDuration = Date.now() - analysisStartTime
  console.log(`[Orchestrator] AI analysis completed in ${analysisDuration}ms`)

  // STEP 6: Save to cache before returning
  saveCachedAnalysis(make, model, year, analysis)
  console.log('[Orchestrator] Analysis cached for 7 days')

  const totalDuration = Date.now() - startTime
  console.log(`\n=== Analysis Complete (total: ${totalDuration}ms) ===\n`)

  // STEP 7: Return complete analysis
  return analysis
}
