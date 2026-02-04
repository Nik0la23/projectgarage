'use client'

// Individual Car Analysis - Tabbed view of forum analysis and YouTube videos for each car

import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ExternalLink } from 'lucide-react'
import type { ComparisonCar } from '../types'
import type { CarAnalysisResult, YouTubeVideo, ForumSource } from '@/features/car-lookup/types'

interface IndividualCarAnalysisProps {
  cars: ComparisonCar[]
  analyses: (CarAnalysisResult | null)[]
  videos: YouTubeVideo[][]
  className?: string
}

export function IndividualCarAnalysis({ cars, analyses, videos, className }: IndividualCarAnalysisProps) {
  const formatViewCount = (views?: number): string => {
    if (!views) return '0'
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
    return views.toLocaleString()
  }

  // Get top 5 article/forum links from analysis sources
  const getTopArticles = (analysis: CarAnalysisResult | null): ForumSource[] => {
    if (!analysis?.rawSources) return []

    // Combine all sources
    const allSources: ForumSource[] = [
      ...(analysis.rawSources.reddit || []),
      ...(analysis.rawSources.edmunds || []),
      ...(analysis.rawSources.webArticles || []),
    ]

    // Sort by score/rating (higher is better) and take top 5
    return allSources
      .filter(source => source.url) // Only sources with URLs
      .sort((a, b) => {
        const scoreA = a.score || a.rating || 0
        const scoreB = b.score || b.rating || 0
        return scoreB - scoreA
      })
      .slice(0, 5)
  }

  // Get source type badge color
  const getSourceBadgeColor = (sourceType: string): string => {
    switch (sourceType) {
      case 'reddit':
        return 'bg-orange-100 text-orange-800'
      case 'edmunds':
        return 'bg-blue-100 text-blue-800'
      case 'web-article':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className={className}>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Individual Car Details</h2>

        <Tabs defaultValue="0" className="w-full">
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${cars.length}, 1fr)` }}>
            {cars.map((car, index) => (
              <TabsTrigger key={index} value={index.toString()}>
                <div className="text-sm">
                  <div>{car.year} {car.make}</div>
                  <div>{car.model}</div>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          {cars.map((car, index) => {
            const analysis = analyses[index]
            const carVideos = videos[index] || []
            const topArticles = getTopArticles(analysis)

            return (
              <TabsContent key={index} value={index.toString()} className="space-y-6 mt-6">
                {/* Forum Analysis Section */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Reliability & Owner Feedback</h3>
                  
                  {analysis ? (
                    <div className="space-y-4">
                      {/* Reliability Score */}
                      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold mb-1">Reliability Score</h4>
                            <p className="text-3xl font-bold text-blue-600">
                              {analysis.reliabilityScore}/10
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            Based on {analysis.sourceCounts.total} sources
                          </Badge>
                        </div>
                      </Card>

                      {/* Common Problems */}
                      {analysis.commonProblems.length > 0 && (
                        <Card className="p-4">
                          <h4 className="font-semibold mb-3">Common Problems</h4>
                          <ul className="space-y-2">
                            {analysis.commonProblems.map((problem, i) => (
                              <li key={i} className="text-sm">
                                <span className="font-medium text-red-700">• {problem.issue}</span>
                                <div className="text-xs text-gray-600 ml-3 mt-1">
                                  Sources: {problem.sources.join(', ')}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </Card>
                      )}

                      {/* What Owners Love */}
                      {analysis.whatOwnersLove.length > 0 && (
                        <Card className="p-4">
                          <h4 className="font-semibold mb-3 text-green-700">What Owners Love</h4>
                          <ul className="space-y-1">
                            {analysis.whatOwnersLove.map((item, i) => (
                              <li key={i} className="text-sm text-gray-700">
                                ✓ {item}
                              </li>
                            ))}
                          </ul>
                        </Card>
                      )}

                      {/* What Owners Hate */}
                      {analysis.whatOwnersHate.length > 0 && (
                        <Card className="p-4">
                          <h4 className="font-semibold mb-3 text-red-700">What Owners Hate</h4>
                          <ul className="space-y-1">
                            {analysis.whatOwnersHate.map((item, i) => (
                              <li key={i} className="text-sm text-gray-700">
                                ✗ {item}
                              </li>
                            ))}
                          </ul>
                        </Card>
                      )}

                      {/* Overall Verdict */}
                      <Card className="p-4 bg-gray-50">
                        <h4 className="font-semibold mb-2">Overall Verdict</h4>
                        <p className="text-sm text-gray-700">{analysis.overallVerdict}</p>
                      </Card>
                    </div>
                  ) : (
                    <Card className="p-4 bg-yellow-50 border-yellow-200">
                      <p className="text-sm text-yellow-800">
                        Reliability analysis not available for this vehicle.
                      </p>
                    </Card>
                  )}
                </div>

                {/* Top Articles & Forum Links */}
                {topArticles.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold mb-4">Top Articles & Forum Discussions</h3>
                    <Card className="p-4">
                      <ul className="space-y-3">
                        {topArticles.map((source, i) => (
                          <li key={i} className="border-b last:border-0 pb-3 last:pb-0">
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-start gap-3 hover:bg-gray-50 p-2 rounded transition-colors"
                            >
                              <ExternalLink className="h-4 w-4 text-blue-600 flex-shrink-0 mt-1" />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm group-hover:text-blue-600 transition-colors line-clamp-2">
                                  {source.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${getSourceBadgeColor(source.sourceType)}`}
                                  >
                                    {source.sourceType === 'web-article' ? 'Article' : source.sourceType}
                                  </Badge>
                                  {(source.score !== undefined || source.rating !== undefined) && (
                                    <span className="text-xs text-gray-500">
                                      {source.score ? `${source.score} upvotes` : `${source.rating}/5 stars`}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </div>
                )}

                {/* YouTube Videos Section */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Video Reviews</h3>
                  
                  {carVideos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {carVideos.slice(0, 6).map((video) => (
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
                              <div className="bg-red-600 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            </div>
                          </div>

                          {/* Video Info */}
                          <div className="p-3">
                            <h4 className="font-medium text-sm group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                              {video.title}
                            </h4>
                            <p className="text-xs text-gray-600 mb-1">{video.channelTitle}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              {video.viewCount && (
                                <span>{formatViewCount(video.viewCount)} views</span>
                              )}
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <Card className="p-4 bg-gray-50">
                      <p className="text-sm text-gray-600">
                        No video reviews available for this vehicle.
                      </p>
                    </Card>
                  )}
                </div>
              </TabsContent>
            )
          })}
        </Tabs>
      </div>
    </Card>
  )
}
