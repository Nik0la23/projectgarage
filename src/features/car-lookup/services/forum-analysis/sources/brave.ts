// Brave Search API integration for web articles
// Runs two targeted queries:
//   1. Authority automotive sites (Car and Driver, Motor Trend, KBB, Cars.com, Edmunds)
//   2. General reliability/owner review search

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

// Convert "AUDI" / "A3" to "Audi" / "A3" for natural search queries
function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
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

  // Normalise case: "AUDI" → "Audi", "A3" stays "A3"
  const makeName = toTitleCase(make)
  const modelName = toTitleCase(model)

  // Query 1: professional review-focused — authority sites naturally rank for "[year] [make] [model] review"
  const authorityQuery = `${year} ${makeName} ${modelName} review expert rating`

  // Query 2: reliability & owner experience — Reddit and forums allowed
  const reliabilityQuery = `${year} ${makeName} ${modelName} reliability owner experience problems`

  console.log(`[Brave] Running 2 targeted queries for ${year} ${makeName} ${modelName}`)

  // Run both queries sequentially — each fails independently so a 429 on query 2
  // doesn't discard results already returned by query 1
  const authorityArticles = await braveQueue.add(async () => {
    return await performBraveSearch(authorityQuery, apiKey, 5)
  }).catch((err) => {
    console.warn('[Brave] Authority query failed:', err instanceof Error ? err.message : err)
    return [] as ForumSource[]
  })

  const reliabilityArticles = await braveQueue.add(async () => {
    return await performBraveSearch(reliabilityQuery, apiKey, 5)
  }).catch((err) => {
    console.warn('[Brave] Reliability query failed:', err instanceof Error ? err.message : err)
    return [] as ForumSource[]
  })

  // Merge and deduplicate by URL
  const seen = new Set<string>()
  const merged: ForumSource[] = []

  for (const article of [...authorityArticles, ...reliabilityArticles]) {
    if (!seen.has(article.url)) {
      seen.add(article.url)
      merged.push(article)
    }
  }

  console.log(`[Brave] Found ${merged.length} unique articles for ${year} ${makeName} ${modelName} (authority: ${authorityArticles.length}, reliability: ${reliabilityArticles.length})`)
  return merged
}

// Perform the actual Brave Search API call
async function performBraveSearch(
  query: string,
  apiKey: string,
  count: number
): Promise<ForumSource[]> {
  const url = new URL('https://api.search.brave.com/res/v1/web/search')
  url.searchParams.set('q', query)
  url.searchParams.set('count', count.toString())

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

  if (data.web && data.web.results) {
    for (const result of data.web.results) {
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
