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
        return await fetchFromSubreddit(subreddit, searchQuery)
      })

      if (posts && posts.length > 0) {
        allPosts.push(...posts)
        console.log(`[Reddit] Found ${posts.length} posts in r/${subreddit}`)
      }
    } catch (error) {
      // Continue with other subreddits if one fails
      console.warn(`[Reddit] Failed to fetch from r/${subreddit}:`, error instanceof Error ? error.message : 'Unknown error')
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
  query: string
): Promise<ForumSource[]> {
  const url = new URL(`https://www.reddit.com/r/${subreddit}/search.json`)
  
  // Query parameters
  url.searchParams.set('q', query)
  url.searchParams.set('limit', '15')
  url.searchParams.set('sort', 'relevance')
  url.searchParams.set('restrict_sr', '1') // Restrict to this subreddit
  url.searchParams.set('t', 'all') // All time

  const response = await fetch(url.toString(), {
    headers: {
      'User-Agent': 'ProjectGarage/1.0 (Car Research Tool)',
      'Accept': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Reddit API error: ${response.status}`)
  }

  const data: RedditResponse = await response.json()
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
