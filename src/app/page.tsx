'use client'

// Main landing page with car search and specs display

import { useState } from 'react'
import { CarSearchForm, CarSpecsPanel } from '@/features/car-lookup'
import { useCarData } from '@/features/car-lookup/hooks/use-car-data'
import { useSearchHistory } from '@/features/car-lookup/hooks/use-search-history'
import type { Car } from '@/types'

export default function HomePage() {
  const [selectedCar, setSelectedCar] = useState<Car | null>(null)
  const { specs } = useCarData({
    make: selectedCar?.make || null,
    year: selectedCar?.year || null,
    model: selectedCar?.model || null,
    trim: selectedCar?.trim || null,
  })
  const { addSearch } = useSearchHistory()

  const handleSearch = (car: Car) => {
    setSelectedCar(car)
    addSearch(car)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            🚗 ProjectGarage
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Your intelligent car buying assistant
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Form - Left Column */}
          <div className="lg:col-span-1">
            <CarSearchForm onSearch={handleSearch} />
          </div>

          {/* Specs Display - Right Column */}
          <div className="lg:col-span-2">
            <CarSpecsPanel specs={specs} />
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="text-lg font-semibold mb-2">Smart Search</h3>
            <p className="text-sm text-gray-600">
              Search by make, year, model, and trim to find detailed technical specifications instantly.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl mb-3">✓</div>
            <h3 className="text-lg font-semibold mb-2">Verified Data</h3>
            <p className="text-sm text-gray-600">
              We use official NHTSA and CarQuery APIs to provide accurate, verified specifications.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-lg font-semibold mb-2">AI-Powered</h3>
            <p className="text-sm text-gray-600">
              For newer vehicles, we use AI to generate comprehensive specs when official data isn't available.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-sm text-gray-500">
            ProjectGarage V1 - Your Intelligent Car Buying Assistant
          </p>
        </div>
      </footer>
    </div>
  )
}
