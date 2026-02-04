// Reddit RSS fallback when JSON API is blocked
// Uses RSS feeds which are less likely to be rate-limited

import { redditQueue } from '../rate-limiter'
import type { ForumSource } from '@/features/car-lookup/types'

const CAR_SUBREDDITS = [
  'cars',
  'whatcarshouldIbuy',
  'askcarsales',
  'mechanicadvice',
  'cartalk',
  'UsedCars',
] as const

// Fetch Reddit discussions using RSS feed
export async function fetchRedditDiscussionsRSS(
  make: string,
  model: string,
  year: number
): Promise<ForumSource[]> {
  const searchQuery = `${year} ${make} ${model}`
  const allPosts: ForumSource[] = []

  console.log(`[Reddit-RSS] Searching for: "${searchQuery}"`)

  // Fetch from each subreddit
  for (const subreddit of CAR_SUBREDDITS) {
    try {
      const posts = await redditQueue.add(async () => {
        return await fetchFromSubredditRSS(subreddit, searchQuery, make, model)
      })

      if (posts && posts.length > 0) {
        allPosts.push(...posts)
        console.log(`[Reddit-RSS] Found ${posts.length} posts in r/${subreddit}`)
      }
    } catch (error) {
      console.error(
        `[Reddit-RSS] Failed to fetch from r/${subreddit}:`,
        error instanceof Error ? error.message : 'Unknown error'
      )
    }
  }

  // Sort by score (if available) and return top 20
  const sortedPosts = allPosts
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 20)

  console.log(`[Reddit-RSS] Total posts collected: ${sortedPosts.length}`)

  return sortedPosts
}

async function fetchFromSubredditRSS(
  subreddit: string,
  query: string,
  make: string,
  model: string
): Promise<ForumSource[]> {
  // Use RSS search feed
  const searchTerm = encodeURIComponent(query)
  const url = `https://www.reddit.com/r/${subreddit}/search.rss?q=${searchTerm}&restrict_sr=on&sort=relevance&t=all`

  console.log(`[Reddit-RSS] Fetching from: ${url}`)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  let response: Response
  try {
    response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
      signal: controller.signal,
      cache: 'no-store',
    })
    clearTimeout(timeoutId)
    console.log(`[Reddit-RSS] Response status: ${response.status}`)
  } catch (error) {
    clearTimeout(timeoutId)
    console.error(`[Reddit-RSS] Fetch error:`, error instanceof Error ? error.message : 'Unknown')
    throw error
  }

  if (!response.ok) {
    console.error(`[Reddit-RSS] API error ${response.status}`)
    throw new Error(`Reddit RSS error: ${response.status}`)
  }

  const xml = await response.text()
  return parseRedditRSS(xml, make, model)
}

// Simple RSS XML parser (no external dependencies)
function parseRedditRSS(xml: string, make: string, model: string): ForumSource[] {
  const posts: ForumSource[] = []

  // Extract entries using regex (simple parser, good enough for our needs)
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g
  const entries = [...xml.matchAll(entryRegex)]

  for (const [, entryContent] of entries) {
    try {
      // Extract title
      const titleMatch = entryContent.match(/<title[^>]*>([\s\S]*?)<\/title>/)
      const title = titleMatch ? decodeHTML(titleMatch[1].trim()) : 'No title'

      // Extract link
      const linkMatch = entryContent.match(/<link[^>]*href="([^"]+)"/)
      const url = linkMatch ? linkMatch[1] : ''

      // Extract content/description
      const contentMatch = entryContent.match(/<content[^>]*>([\s\S]*?)<\/content>/)
      let body = contentMatch ? contentMatch[1] : ''

      // Remove HTML tags and decode entities
      body = body.replace(/<[^>]+>/g, ' ').trim()
      body = decodeHTML(body)

      // Filter out short posts (low quality)
      if (body.length < 100) {
        continue
      }

      // IMPORTANT: Verify the post actually mentions the specific car
      const combinedText = `${title} ${body}`.toLowerCase()
      const makePattern = make.toLowerCase()
      const modelPattern = model.toLowerCase()
      
      // Must contain both make AND model (not just make)
      if (!combinedText.includes(makePattern) || !combinedText.includes(modelPattern)) {
        console.log(`[Reddit-RSS] Filtered out: "${title}" (doesn't contain ${make} ${model})`)
        continue
      }

      // Extract score if available (sometimes in title)
      const scoreMatch = title.match(/\[(\d+)\]/)
      const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 0

      posts.push({
        title: title.replace(/\[\d+\]\s*/, ''), // Remove score from title
        body: body.slice(0, 1000), // Limit body length
        sourceType: 'reddit',
        score,
        url,
      })
    } catch (error) {
      // Skip malformed entries
      console.warn('[Reddit-RSS] Failed to parse entry:', error)
    }
  }

  return posts.slice(0, 15) // Limit per subreddit
}

// Decode HTML entities
function decodeHTML(html: string): string {
  return html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
