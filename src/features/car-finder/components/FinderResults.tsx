'use client'

import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { CarFinderResultCard } from './CarFinderResultCard'
import type { CarFinderResult } from '../types'

interface FinderResultsProps {
  results: CarFinderResult[]
  refinement: string
  loading: boolean
  onRefinementChange: (text: string) => void
  onRefine: () => void
  onReset: () => void
}

export function FinderResults({
  results,
  refinement,
  loading,
  onRefinementChange,
  onRefine,
  onReset,
}: FinderResultsProps) {
  const sectionRef = useRef<HTMLDivElement>(null)

  // Scroll into view when results first appear
  useEffect(() => {
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <div ref={sectionRef} className="pt-2 animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Based on your needs, here are your best matches
        </h2>
        <p className="text-gray-500 mt-1 text-sm">
          {results.length} vehicle{results.length !== 1 ? 's' : ''} found &middot; Click any card to view full specs &amp; analysis
        </p>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-10">
        {results.map(result => (
          <CarFinderResultCard key={result.id} result={result} />
        ))}
      </div>

      {/* Refinement & Reset */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-1">Not quite right?</h3>
        <p className="text-xs text-gray-400 mb-4">
          Describe what you'd like to change and we'll refine the results.
        </p>

        <div className="flex gap-3">
          <input
            type="text"
            value={refinement}
            onChange={e => onRefinementChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !loading && refinement.trim()) onRefine()
            }}
            placeholder='e.g. "show me cheaper options" or "I prefer Japanese brands"'
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-0"
          />
          <Button
            onClick={onRefine}
            disabled={loading || !refinement.trim()}
            className="shrink-0"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              'Refine'
            )}
          </Button>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <Button onClick={onReset} variant="outline" size="sm">
            ← Start Over
          </Button>
        </div>
      </div>
    </div>
  )
}
