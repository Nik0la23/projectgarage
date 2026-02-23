'use client'

import Link from 'next/link'
import { Sparkles, GitCompare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FilterPanel } from './FilterPanel'
import { LifestyleTextBox } from './LifestyleTextBox'
import { FinderResults } from './FinderResults'
import { useCarFinder } from '../hooks/use-car-finder'

export function CarFinderPage() {
  const {
    filters,
    lifestyle,
    results,
    refinement,
    loading,
    error,
    updateFilter,
    setLifestyle,
    setRefinement,
    submit,
    refine,
    reset,
  } = useCarFinder()

  const hasInput =
    lifestyle.trim().length > 0 ||
    Object.values(filters).some(v => v !== undefined)

  const handleSubmit = () => submit(filters, lifestyle)
  const handleRefine = () => {
    if (results) refine(filters, lifestyle, refinement, results)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🚗 ProjectGarage</h1>
              <p className="mt-2 text-sm text-gray-600">Your intelligent car buying assistant</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                  Car Lookup
                </Button>
              </Link>
              <Link href="/compare">
                <Button variant="outline" size="sm">
                  <GitCompare className="mr-2 h-4 w-4" />
                  Compare
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            AI-Powered Recommendations
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-3 leading-tight">
            Tell us what you need,<br />
            <span className="text-blue-600">we'll find the right car.</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Use the filters, describe your lifestyle, or both — our AI analyzes your needs
            and recommends the best matches with personalized explanations.
          </p>
        </div>

        {/* Input Zone */}
        <Card className="mb-6 overflow-visible">
          <div className="p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row gap-0">
              {/* Left: Structured Filters */}
              <div className="flex-1 lg:pr-8">
                <FilterPanel filters={filters} onChange={updateFilter} />
              </div>

              {/* Desktop vertical divider */}
              <div className="hidden lg:flex flex-col items-center justify-center w-px relative">
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-gray-200" />
                <div className="relative z-10 bg-white px-2 py-2 rounded-full border border-gray-200 shadow-sm">
                  <p className="text-[10px] text-gray-400 font-semibold text-center leading-tight select-none">
                    and<br />or
                  </p>
                </div>
              </div>

              {/* Mobile horizontal divider */}
              <div className="lg:hidden flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-semibold bg-gray-100 px-3 py-1 rounded-full select-none">
                  and / or
                </span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Right: Lifestyle text */}
              <div className="flex-1 lg:pl-8">
                <LifestyleTextBox value={lifestyle} onChange={setLifestyle} />
              </div>
            </div>
          </div>

          {/* Submit footer */}
          <div className="border-t border-gray-100 bg-gray-50 px-6 lg:px-8 py-4 rounded-b-xl">
            {error && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={loading || !hasInput}
              className="w-full py-6 text-base font-semibold"
              size="lg"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  <span>Analyzing your needs...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Find My Car
                </div>
              )}
            </Button>

            {!hasInput && (
              <p className="text-xs text-gray-400 text-center mt-2">
                Set at least one filter or describe your situation to get started
              </p>
            )}
          </div>
        </Card>

        {/* Results Zone */}
        {results && (
          <FinderResults
            results={results}
            refinement={refinement}
            loading={loading}
            onRefinementChange={setRefinement}
            onRefine={handleRefine}
            onReset={reset}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-sm text-gray-500">
            ProjectGarage Car Finder — AI-powered recommendations for smarter car buying
          </p>
        </div>
      </footer>
    </div>
  )
}
