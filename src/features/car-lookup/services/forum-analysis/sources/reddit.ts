// Reddit API integration for car discussions
// Uses Reddit's public JSON API (no authentication required)

import { redditQueue } from '../rate-limiter'
import type { ForumSource } from '@/features/car-lookup/types'

// Target subreddits for car discussions
const CAR_SUBREDDITS = [
  'cars',
  'whatcarshouldIbuy',
  'askcarsales',
  'mechanicadvice',
  'cartalk',
  'UsedCars',
] as const

interface RedditPost {
  data: {
    title: string
    selftext: string
    score: number
    permalink: string
    subreddit: string
  }
}

interface RedditResponse {
  data: {
    children: RedditPost[]
  }
}

// Fetch Reddit discussions for a specific car
export async function fetchRedditDiscussions(
  make: string,
  model: string,
  year: number
): Promise<ForumSource[]> {
  const searchQuery = `${year} ${make} ${model}`
  const allPosts: ForumSource[] = []

  console.log(`[Reddit] Searching for: "${searchQuery}"`)

  // Fetch from each subreddit
  for (const subreddit of CAR_SUBREDDITS) {
    try {
      // Use rate limiter queue
      const posts = await redditQueue.add(async () => {
        return await fetchFromSubreddit(subreddit, searchQuery, make, model)
      })

      if (posts && posts.length > 0) {
        allPosts.push(...posts)
        console.log(`[Reddit] Found ${posts.length} posts in r/${subreddit}`)
      }
    } catch (error) {
      // Continue with other subreddits if one fails
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`[Reddit] Failed to fetch from r/${subreddit}:`, errorMessage)
      
      // Log more details for debugging
      if (error instanceof Error) {
        console.error(`[Reddit] Error stack:`, error.stack)
      }
    }
  }

  // Sort by score (upvotes) and return top 20
  const sortedPosts = allPosts
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 20)

  console.log(`[Reddit] Total posts collected: ${sortedPosts.length}`)

  return sortedPosts
}

// Fetch posts from a specific subreddit
async function fetchFromSubreddit(
  subreddit: string,
  query: string,
  make: string,
  model: string
): Promise<ForumSource[]> {
  const url = new URL(`https://www.reddit.com/r/${subreddit}/search.json`)
  
  // Query parameters
  url.searchParams.set('q', query)
  url.searchParams.set('limit', '15')
  url.searchParams.set('sort', 'relevance')
  url.searchParams.set('restrict_sr', '1') // Restrict to this subreddit
  url.searchParams.set('t', 'all') // All time

  console.log(`[Reddit] Fetching from: ${url.toString()}`)
  
  // Create abort controller for timeout (more compatible than AbortSignal.timeout)
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)
  
  let response: Response
  try {
    response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ProjectGarage/1.0; +https://projectgarage.vercel.app)',
        'Accept': 'application/json',
      },
      signal: controller.signal,
      cache: 'no-store', // Prevent Next.js caching issues
    })
    clearTimeout(timeoutId)
    console.log(`[Reddit] Response status: ${response.status} ${response.statusText}`)
  } catch (error) {
    clearTimeout(timeoutId)
    console.error(`[Reddit] Fetch error:`, error instanceof Error ? error.message : 'Unknown')
    throw error
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'No error text')
    console.error(`[Reddit] API error ${response.status}:`, errorText)
    throw new Error(`Reddit API error: ${response.status} - ${response.statusText}`)
  }

  const data: RedditResponse = await response.json()
  
  // Validate response structure
  if (!data || !data.data || !data.data.children) {
    console.error(`[Reddit] Invalid response structure from r/${subreddit}:`, JSON.stringify(data).slice(0, 200))
    throw new Error('Invalid Reddit API response structure')
  }
  
  console.log(`[Reddit] r/${subreddit} returned ${data.data.children.length} raw posts`)
  
  const posts: ForumSource[] = []

  // Parse and filter posts
  for (const post of data.data.children) {
    const { title, selftext, score, permalink } = post.data

    // Filter out posts with very short or no body text (low quality)
    if (!selftext || selftext.length < 50) {
      continue
    }

    // Filter out deleted/removed posts
    if (selftext === '[deleted]' || selftext === '[removed]') {
      continue
    }

    // IMPORTANT: Verify the post actually mentions the specific car
    // Combine title and body for checking
    const combinedText = `${title} ${selftext}`.toLowerCase()
    const makePattern = make.toLowerCase()
    const modelPattern = model.toLowerCase()
    
    // Must contain both make AND model (not just make)
    if (!combinedText.includes(makePattern) || !combinedText.includes(modelPattern)) {
      console.log(`[Reddit] Filtered out: "${title}" (doesn't contain ${make} ${model})`)
      continue
    }

    posts.push({
      title,
      body: selftext,
      sourceType: 'reddit',
      score,
      url: `https://www.reddit.com${permalink}`,
    })
  }

  return posts
}
