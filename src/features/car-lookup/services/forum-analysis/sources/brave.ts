// Brave Search API integration for web articles
// Uses Brave's free tier search API

import { braveQueue } from '../rate-limiter'
import type { ForumSource } from '@/features/car-lookup/types'

interface BraveSearchResult {
  title: string
  description: string
  url: string
}

interface BraveResponse {
  web?: {
    results: BraveSearchResult[]
  }
}

// Fetch web articles about a specific car using Brave Search
export async function fetchBraveArticles(
  make: string,
  model: string,
  year: number
): Promise<ForumSource[]> {
  const apiKey = process.env.BRAVE_API_KEY

  if (!apiKey || apiKey === 'your_brave_search_api_key_here') {
    console.warn('[Brave] API key not configured, skipping Brave Search')
    return []
  }

  // Build search query (exclude Reddit since we fetch that separately)
  const searchQuery = `${year} ${make} ${model} reliability review problems -site:reddit.com`

  console.log(`[Brave] Searching for: "${searchQuery}"`)

  try {
    // Use rate limiter queue
    const articles = await braveQueue.add(async () => {
      return await performBraveSearch(searchQuery, apiKey)
    })

    console.log(`[Brave] Found ${articles.length} articles`)
    return articles
  } catch (error) {
    console.error('[Brave] Search failed:', error instanceof Error ? error.message : 'Unknown error')
    // Return empty array on failure (graceful degradation)
    return []
  }
}

// Perform the actual Brave Search API call
async function performBraveSearch(
  query: string,
  apiKey: string
): Promise<ForumSource[]> {
  const url = new URL('https://api.search.brave.com/res/v1/web/search')
  
  // Query parameters
  url.searchParams.set('q', query)
  url.searchParams.set('count', '10') // Limit to 10 results

  const response = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
      'X-Subscription-Token': apiKey,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Brave API error: ${response.status} - ${errorText}`)
  }

  const data: BraveResponse = await response.json()
  const articles: ForumSource[] = []

  // Parse results
  if (data.web && data.web.results) {
    for (const result of data.web.results) {
      // Skip results with no description
      if (!result.description || result.description.length < 20) {
        continue
      }

      articles.push({
        title: result.title,
        body: result.description,
        sourceType: 'web-article',
        url: result.url,
      })
    }
  }

  return articles
}
