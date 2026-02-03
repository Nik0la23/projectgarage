'use client'

// YouTube Videos Panel - Displays car review videos from YouTube

import { Card } from '@/components/ui/card'
import { useYouTubeVideos } from '../hooks/use-youtube-videos'
import { formatViewCount, formatDuration } from '../services/youtube-api'
import type { Car } from '@/types'

interface CarYouTubePanelProps {
  car: Car | null
  className?: string
}

export function CarYouTubePanel({ car, className }: CarYouTubePanelProps) {
  const { videos, loading, error } = useYouTubeVideos({
    make: car?.make || null,
    model: car?.model || null,
    year: car?.year || null,
    maxResults: 5,
  })

  // Don't show if no car selected
  if (!car) {
    return null
  }

  return (
    <Card className={className}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">🎥</span>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Video Reviews</h3>
            <p className="text-sm text-gray-600">
              Watch expert reviews and owner experiences
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading videos...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 font-medium">Unable to load videos</p>
            <p className="text-yellow-600 text-sm mt-1">{error}</p>
            {error.includes('not configured') && (
              <p className="text-xs text-gray-600 mt-2">
                YouTube integration is currently unavailable. The site administrator needs to configure the YouTube API key.
              </p>
            )}
          </div>
        )}

        {/* Videos Grid */}
        {!loading && !error && videos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videos.map((video) => (
              <a
                key={video.videoId}
                href={`https://www.youtube.com/watch?v=${video.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gray-100">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Play button overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                    <div className="bg-red-600 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  {/* Duration badge */}
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
                      {formatDuration(video.duration)}
                    </div>
                  )}
                </div>

                {/* Video Info */}
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                    {video.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">{video.channelTitle}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    {video.viewCount && (
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        {formatViewCount(video.viewCount)} views
                      </span>
                    )}
                    {video.likeCount && (
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                          />
                        </svg>
                        {formatViewCount(video.likeCount)}
                      </span>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* No Videos Found */}
        {!loading && !error && videos.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🎬</div>
            <p className="text-gray-600 font-medium">No videos found</p>
            <p className="text-sm text-gray-500 mt-2">
              Try searching on YouTube directly for reviews of this car
            </p>
          </div>
        )}

        {/* Disclaimer */}
        {videos.length > 0 && (
          <div className="mt-6 text-xs text-gray-500 border-t pt-4">
            <p>
              Videos are fetched from YouTube and sorted by relevance. 
              We are not affiliated with the content creators.
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
