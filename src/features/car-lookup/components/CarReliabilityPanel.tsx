'use client'

// Reliability Analysis Panel - Shows owner experiences and reliability insights

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCarAnalysis } from '@/features/car-lookup/hooks/use-car-analysis'
import type { Car } from '@/types'

interface CarReliabilityPanelProps {
  car: Car | null
  className?: string
}

export function CarReliabilityPanel({ car, className }: CarReliabilityPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { loading, error, data, fetchAnalysis } = useCarAnalysis()

  const handleAnalyze = async () => {
    if (!car) return
    
    setIsExpanded(true)
    if (!data) {
      await fetchAnalysis(car.make, car.model, car.year)
    }
  }

  // Don't show if no car selected
  if (!car) {
    return null
  }

  return (
    <Card className={className}>
      <div className="p-6">
        {!isExpanded ? (
          // Collapsed state - Show button
          <div className="text-center">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Want to know more?
              </h3>
              <p className="text-sm text-gray-600">
                See what real owners think and discover common issues before you buy
              </p>
            </div>
            
            <Button 
              onClick={handleAnalyze}
              size="lg"
              className="w-full sm:w-auto"
            >
              <span className="mr-2">📊</span>
              Reliability Analysis
            </Button>
          </div>
        ) : (
          // Expanded state - Show analysis
          <div>
            {/* Header with collapse button */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold text-gray-900">
                  Reliability Analysis
                </h3>
                {data && (
                  <Badge 
                    variant={data.reliabilityScore >= 7 ? 'default' : 'destructive'}
                    className="text-base px-3 py-1"
                  >
                    {data.reliabilityScore}/10
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
              >
                Collapse
              </Button>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Analyzing owner experiences and reviews...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium">Failed to load analysis</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => car && fetchAnalysis(car.make, car.model, car.year)}
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* Analysis Results */}
            {data && !loading && (
              <div className="space-y-6">
                {/* Overall Verdict */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <span>💡</span>
                    Overall Verdict
                  </h4>
                  <p className="text-blue-800">{data.overallVerdict}</p>
                </div>

                {/* Reliability Score */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Reliability Score</h4>
                    <div className="flex items-center gap-3">
                      <div className="text-4xl font-bold text-blue-600">
                        {data.reliabilityScore}
                      </div>
                      <div className="text-sm text-gray-600">out of 10</div>
                    </div>
                    <div className="mt-2 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          data.reliabilityScore >= 7 ? 'bg-green-500' : 
                          data.reliabilityScore >= 5 ? 'bg-yellow-500' : 
                          'bg-red-500'
                        }`}
                        style={{ width: `${data.reliabilityScore * 10}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Data Sources</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reddit Posts:</span>
                        <span className="font-medium">{data.sourceCounts.reddit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Web Articles:</span>
                        <span className="font-medium">{data.sourceCounts.webArticles}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Edmunds Reviews:</span>
                        <span className="font-medium">{data.sourceCounts.edmunds}</span>
                      </div>
                      <div className="flex justify-between border-t pt-1 mt-1">
                        <span className="text-gray-900 font-medium">Total Sources:</span>
                        <span className="font-bold">{data.sourceCounts.total}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Common Problems */}
                {data.commonProblems.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                      <span>⚠️</span>
                      Common Problems
                    </h4>
                    <ul className="space-y-2">
                      {data.commonProblems.map((problem, index) => (
                        <li key={index} className="text-red-800">
                          <span className="font-medium">{problem.issue}</span>
                          {problem.sources.length > 0 && (
                            <span className="text-xs text-red-600 ml-2">
                              ({problem.sources.join(', ')})
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* What Owners Love */}
                {data.whatOwnersLove.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                      <span>💚</span>
                      What Owners Love
                    </h4>
                    <ul className="space-y-1">
                      {data.whatOwnersLove.map((item, index) => (
                        <li key={index} className="text-green-800 flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Standout Features */}
                {data.standoutFeatures && data.standoutFeatures.length > 0 && (
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <span>⭐</span>
                      Standout Features & Technology
                    </h4>
                    <ul className="space-y-1">
                      {data.standoutFeatures.map((item, index) => (
                        <li key={index} className="text-blue-800 flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">✦</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* What Owners Hate */}
                {data.whatOwnersHate.length > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                      <span>👎</span>
                      What Owners Dislike
                    </h4>
                    <ul className="space-y-1">
                      {data.whatOwnersHate.map((item, index) => (
                        <li key={index} className="text-orange-800 flex items-start gap-2">
                          <span className="text-orange-600 mt-0.5">✗</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Expert vs Owner */}
                {data.expertVsOwner && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                      <span>🔍</span>
                      Expert vs Owner Opinions
                    </h4>
                    <p className="text-purple-800">{data.expertVsOwner}</p>
                  </div>
                )}

                {/* Original Sources - Links for Transparency */}
                {data.rawSources && (
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-5">
                    <h4 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                      <span>🔗</span>
                      Read the Full Sources
                    </h4>
                    <p className="text-sm text-indigo-700 mb-4">
                      Don't just take our word for it — explore the original content and form your own opinion
                    </p>

                    <div className="space-y-4">
                      {/* Reddit Posts */}
                      {data.rawSources.reddit.length > 0 && (
                        <div>
                          <h5 className="text-sm font-semibold text-indigo-800 mb-2">
                            Reddit Discussions ({data.rawSources.reddit.length})
                          </h5>
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {data.rawSources.reddit.map((source, index) => (
                              <a
                                key={index}
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block bg-white hover:bg-indigo-50 border border-indigo-100 rounded p-3 transition-colors group"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 truncate">
                                      {source.title}
                                    </p>
                                    {source.score !== undefined && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        ⬆️ {source.score} upvotes
                                      </p>
                                    )}
                                  </div>
                                  <span className="text-indigo-400 group-hover:text-indigo-600 flex-shrink-0">
                                    ↗
                                  </span>
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Edmunds Reviews */}
                      {data.rawSources.edmunds.length > 0 && (
                        <div>
                          <h5 className="text-sm font-semibold text-indigo-800 mb-2">
                            Edmunds Reviews ({data.rawSources.edmunds.length})
                          </h5>
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {data.rawSources.edmunds.map((source, index) => (
                              <a
                                key={index}
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block bg-white hover:bg-indigo-50 border border-indigo-100 rounded p-3 transition-colors group"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 truncate">
                                      {source.title}
                                    </p>
                                    {source.rating !== undefined && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        ⭐ {source.rating}/5 stars
                                      </p>
                                    )}
                                  </div>
                                  <span className="text-indigo-400 group-hover:text-indigo-600 flex-shrink-0">
                                    ↗
                                  </span>
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Web Articles */}
                      {data.rawSources.webArticles.length > 0 && (
                        <div>
                          <h5 className="text-sm font-semibold text-indigo-800 mb-2">
                            Web Articles ({data.rawSources.webArticles.length})
                          </h5>
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {data.rawSources.webArticles.map((source, index) => (
                              <a
                                key={index}
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block bg-white hover:bg-indigo-50 border border-indigo-100 rounded p-3 transition-colors group"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 truncate">
                                      {source.title}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1 truncate">
                                      {new URL(source.url).hostname}
                                    </p>
                                  </div>
                                  <span className="text-indigo-400 group-hover:text-indigo-600 flex-shrink-0">
                                    ↗
                                  </span>
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Disclaimer */}
                <div className="text-xs text-gray-500 border-t pt-4">
                  <p>
                    <strong>Disclaimer:</strong> This analysis is generated from public discussions and reviews. 
                    Results may vary based on individual usage, maintenance, and model year variations. 
                    Always test drive and have a professional inspection before purchasing.
                  </p>
                  <p className="mt-1">
                    Analyzed on: {new Date(data.analyzedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
