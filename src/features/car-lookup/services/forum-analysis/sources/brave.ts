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

  // Query 1: target authoritative automotive review sites directly
  const authorityQuery = `"${year} ${make} ${model}" site:caranddriver.com OR site:motortrend.com OR site:cars.com OR site:kbb.com OR site:edmunds.com`

  // Query 2: general reliability & owner experience search
  const reliabilityQuery = `${year} ${make} ${model} reliability owner problems long-term -site:reddit.com`

  console.log(`[Brave] Running 2 targeted queries for ${year} ${make} ${model}`)

  try {
    // Run both queries sequentially (rate limiter: 1 req/sec)
    const authorityArticles = await braveQueue.add(async () => {
      return await performBraveSearch(authorityQuery, apiKey, 5)
    })

    const reliabilityArticles = await braveQueue.add(async () => {
      return await performBraveSearch(reliabilityQuery, apiKey, 5)
    })

    // Merge and deduplicate by URL
    const seen = new Set<string>()
    const merged: ForumSource[] = []

    for (const article of [...(authorityArticles ?? []), ...(reliabilityArticles ?? [])]) {
      if (!seen.has(article.url)) {
        seen.add(article.url)
        merged.push(article)
      }
    }

    console.log(`[Brave] Found ${merged.length} unique articles (authority: ${authorityArticles?.length ?? 0}, reliability: ${reliabilityArticles?.length ?? 0})`)
    return merged
  } catch (error) {
    console.error('[Brave] Search failed:', error instanceof Error ? error.message : 'Unknown error')
    return []
  }
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
