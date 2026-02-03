// YouTube Data API v3 integration
// Fetches car review videos sorted by view count

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

interface YouTubeAPISearchResponse {
  items: Array<{
    id: {
      videoId: string
    }
    snippet: {
      title: string
      description: string
      channelTitle: string
      publishedAt: string
      thumbnails: {
        high: {
          url: string
        }
        medium: {
          url: string
        }
      }
    }
  }>
  pageInfo: {
    totalResults: number
  }
}

interface YouTubeAPIVideoResponse {
  items: Array<{
    id: string
    statistics: {
      viewCount: string
      likeCount: string
    }
    contentDetails: {
      duration: string
    }
  }>
}

/**
 * Search for car review videos on YouTube
 * @param make - Car make (e.g., "Honda")
 * @param model - Car model (e.g., "Civic")
 * @param year - Car year (e.g., 2020)
 * @param maxResults - Maximum number of videos to return (default: 6)
 */
export async function searchCarVideos(
  make: string,
  model: string,
  year: number,
  maxResults: number = 6
): Promise<YouTubeSearchResult> {
  const apiKey = process.env.YOUTUBE_API_KEY

  if (!apiKey) {
    throw new Error('YouTube API key not configured')
  }

  // Build search query - focus on reviews
  const query = `${year} ${make} ${model} review`

  console.log(`[YouTube] Searching for: "${query}"`)

  try {
    // Step 1: Search for videos
    const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search')
    searchUrl.searchParams.set('part', 'snippet')
    searchUrl.searchParams.set('q', query)
    searchUrl.searchParams.set('type', 'video')
    searchUrl.searchParams.set('maxResults', maxResults.toString())
    searchUrl.searchParams.set('order', 'viewCount') // Sort by most viewed
    searchUrl.searchParams.set('videoDuration', 'medium') // 4-20 minutes (avoid shorts and very long videos)
    searchUrl.searchParams.set('relevanceLanguage', 'en')
    searchUrl.searchParams.set('safeSearch', 'none')
    searchUrl.searchParams.set('key', apiKey)

    const searchResponse = await fetch(searchUrl.toString())

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text()
      console.error('[YouTube] Search failed:', errorText)
      throw new Error(`YouTube API search failed: ${searchResponse.status}`)
    }

    const searchData: YouTubeAPISearchResponse = await searchResponse.json()

    if (!searchData.items || searchData.items.length === 0) {
      console.log('[YouTube] No videos found')
      return {
        videos: [],
        totalResults: 0,
      }
    }

    // Step 2: Get video statistics (view count, likes, duration)
    const videoIds = searchData.items.map(item => item.id.videoId).join(',')
    const statsUrl = new URL('https://www.googleapis.com/youtube/v3/videos')
    statsUrl.searchParams.set('part', 'statistics,contentDetails')
    statsUrl.searchParams.set('id', videoIds)
    statsUrl.searchParams.set('key', apiKey)

    const statsResponse = await fetch(statsUrl.toString())

    if (!statsResponse.ok) {
      console.error('[YouTube] Failed to fetch video statistics')
      // Continue without statistics if this fails
    }

    let statsData: YouTubeAPIVideoResponse | null = null
    if (statsResponse.ok) {
      statsData = await statsResponse.json()
    }

    // Step 3: Combine search results with statistics
    const videos: YouTubeVideo[] = searchData.items.map((item, index) => {
      const stats = statsData?.items?.find(s => s.id === item.id.videoId)

      return {
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        viewCount: stats?.statistics?.viewCount ? parseInt(stats.statistics.viewCount) : undefined,
        likeCount: stats?.statistics?.likeCount ? parseInt(stats.statistics.likeCount) : undefined,
        duration: stats?.contentDetails?.duration,
      }
    })

    console.log(`[YouTube] Found ${videos.length} videos for ${year} ${make} ${model}`)

    return {
      videos,
      totalResults: searchData.pageInfo.totalResults,
    }
  } catch (error) {
    console.error('[YouTube] Error fetching videos:', error)
    throw error
  }
}

/**
 * Format YouTube ISO 8601 duration to readable format
 * @param duration - ISO 8601 duration (e.g., "PT15M33S")
 * @returns Formatted duration (e.g., "15:33")
 */
export function formatDuration(duration?: string): string {
  if (!duration) return ''

  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return ''

  const hours = parseInt(match[1] || '0')
  const minutes = parseInt(match[2] || '0')
  const seconds = parseInt(match[3] || '0')

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Format view count to readable format
 * @param views - View count
 * @returns Formatted view count (e.g., "1.2M", "450K", "1,234")
 */
export function formatViewCount(views?: number): string {
  if (!views) return '0'

  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`
  }
  return views.toLocaleString()
}
