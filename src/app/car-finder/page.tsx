import { Suspense } from 'react'
import type { Metadata } from 'next'
import { CarFinderPage } from '@/features/car-finder'

export const metadata: Metadata = {
  title: 'Car Finder',
  description: 'AI-powered car recommendations based on your lifestyle and preferences. Tell us what you need and we\'ll find your perfect match.',
}

export default function CarFinderRoute() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading Car Finder...</p>
          </div>
        </div>
      }
    >
      <CarFinderPage />
    </Suspense>
  )
}
