'use client'

// Main Comparison Page - Orchestrates the entire comparison feature

import { useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import { useComparison } from '../hooks/use-comparison'
import { useComparisonHistory } from '@/features/history-sidebar'
import { CarSelector } from './CarSelector'
import { SpecsComparisonTable } from './SpecsComparisonTable'
import { ComparisonAnalysis } from './ComparisonAnalysis'
import { IndividualCarAnalysis } from './IndividualCarAnalysis'

export function ComparisonPage() {
  const searchParams = useSearchParams()
  const {
    cars,
    comparisonData,
    loading,
    error,
    addCar,
    removeCar,
    fetchComparison,
    reset,
  } = useComparison()
  const { addComparison } = useComparisonHistory()

  // Pre-populate cars from URL parameters (runs once on mount)
  // Supports: ?car1=<Car> (single car, existing behaviour)
  //       and ?cars=<Car[]> (multi-car array, set by history sidebar)
  useEffect(() => {
    const carsParam = searchParams.get('cars')
    const car1Param = searchParams.get('car1')

    if (carsParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(carsParam))
        if (Array.isArray(parsed)) {
          parsed.forEach(car => {
            if (car.make && car.model && car.year) addCar(car)
          })
        }
      } catch (e) {
        console.error('[ComparisonPage] Failed to parse cars param:', e)
      }
    } else if (car1Param) {
      try {
        const car = JSON.parse(decodeURIComponent(car1Param))
        if (car.make && car.model && car.year) {
          addCar(car)
        }
      } catch (e) {
        console.error('[ComparisonPage] Failed to parse car1 param:', e)
      }
    }
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Save comparison to history when results arrive
  useEffect(() => {
    if (comparisonData && comparisonData.cars.length >= 2) {
      addComparison(comparisonData.cars)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comparisonData])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Compare Cars</h1>
              <p className="mt-2 text-sm text-gray-600">
                Select 2-3 cars to compare side-by-side with AI-powered insights
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/car-finder">
                <Button variant="outline" size="sm">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Car Finder
                </Button>
              </Link>
              <a href="/" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                ← Back to Search
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Car Selector */}
        <CarSelector
          cars={cars}
          onAdd={addCar}
          onRemove={removeCar}
          className="mb-6"
        />

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Compare Button (shown when 2+ cars selected and no comparison data) */}
        {cars.length >= 2 && !comparisonData && (
          <Button
            onClick={fetchComparison}
            disabled={loading}
            className="w-full mb-6 py-6 text-lg"
            size="lg"
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Comparing Cars...</span>
              </div>
            ) : (
              `Compare ${cars.length} Cars`
            )}
          </Button>
        )}

        {/* Comparison Results */}
        {comparisonData && (
          <div className="space-y-6">
            {/* Reset Button */}
            <div className="flex justify-end">
              <Button onClick={reset} variant="outline">
                Start New Comparison
              </Button>
            </div>

            {/* Specs Comparison Table */}
            <SpecsComparisonTable
              cars={comparisonData.cars}
              specs={comparisonData.specs}
            />

            {/* AI Comparison Analysis */}
            {comparisonData.comparisonAnalysis && (
              <ComparisonAnalysis data={comparisonData.comparisonAnalysis} />
            )}

            {/* Individual Car Analysis */}
            <IndividualCarAnalysis
              cars={comparisonData.cars}
              analyses={comparisonData.analyses}
              videos={comparisonData.videos}
            />
          </div>
        )}

        {/* Empty State */}
        {cars.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚗</div>
            <h3 className="text-xl font-semibold mb-2">Ready to Compare?</h3>
            <p className="text-gray-600">
              Add 2-3 cars using the selector above to get started
            </p>
          </div>
        )}

        {/* Partial State (1 car selected) */}
        {cars.length === 1 && !comparisonData && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="text-5xl mb-4">➕</div>
            <h3 className="text-xl font-semibold mb-2">Add One More Car</h3>
            <p className="text-gray-600">
              You need at least 2 cars to start comparison
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-sm text-gray-500">
            ProjectGarage Comparison Tool - Make informed car buying decisions
          </p>
        </div>
      </footer>
    </div>
  )
}
