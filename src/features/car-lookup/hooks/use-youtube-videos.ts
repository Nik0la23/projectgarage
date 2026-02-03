'use client'

// Hook to fetch YouTube videos for a car

import { useState, useEffect } from 'react'
import type { YouTubeVideo } from '../services/youtube-api'

interface UseYouTubeVideosParams {
  make: string | null
  model: string | null
  year: number | null
  maxResults?: number
}

interface UseYouTubeVideosResult {
  videos: YouTubeVideo[]
  loading: boolean
  error: string | null
  totalResults: number
}

export function useYouTubeVideos({
  make,
  model,
  year,
  maxResults = 6,
}: UseYouTubeVideosParams): UseYouTubeVideosResult {
  const [videos, setVideos] = useState<YouTubeVideo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalResults, setTotalResults] = useState(0)

  useEffect(() => {
    // Only fetch if all required params are present
    if (!make || !model || !year) {
      setVideos([])
      setTotalResults(0)
      return
    }

    const fetchVideos = async () => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          make,
          model,
          year: year.toString(),
          maxResults: maxResults.toString(),
        })

        const response = await fetch(`/api/youtube/search?${params}`)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch videos')
        }

        const result = await response.json()

        if (result.success && result.data) {
          setVideos(result.data.videos)
          setTotalResults(result.data.totalResults)
        } else {
          throw new Error('Invalid response format')
        }
      } catch (err) {
        console.error('[useYouTubeVideos] Error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load videos')
        setVideos([])
        setTotalResults(0)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [make, model, year, maxResults])

  return {
    videos,
    loading,
    error,
    totalResults,
  }
}
