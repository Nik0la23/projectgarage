'use client'

import Link from 'next/link'
import { Car, Fuel, Users, Gauge, DollarSign } from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { CarFinderResult } from '../types'

interface CarFinderResultCardProps {
  result: CarFinderResult
}

export function CarFinderResultCard({ result }: CarFinderResultCardProps) {
  const midYear = parseMidYear(result.yearRange)
  const carData = encodeURIComponent(JSON.stringify({
    make: result.make,
    model: result.model,
    year: midYear,
  }))

  const matchColor =
    result.matchScore >= 75 ? 'text-green-700 bg-green-100' :
    result.matchScore >= 50 ? 'text-yellow-700 bg-yellow-100' :
                              'text-gray-500 bg-gray-100'

  return (
    <Card className="overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200">
      {/* Placeholder image area */}
      <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 h-44 flex items-center justify-center shrink-0">
        <Car className="h-20 w-20 text-slate-300" strokeWidth={1} />
        <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold ${matchColor}`}>
          {result.matchScore}% match
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1 gap-4">
        {/* Name & category */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 leading-tight">
            {result.make} {result.model}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {result.yearRange} &middot; {result.category}
          </p>
        </div>

        {/* Key specs grid */}
        <div className="grid grid-cols-2 gap-2">
          {result.fuelEconomy && (
            <SpecChip icon={<Fuel className="h-3.5 w-3.5" />} label={result.fuelEconomy} />
          )}
          {result.seats && (
            <SpecChip icon={<Users className="h-3.5 w-3.5" />} label={`${result.seats} seats`} />
          )}
          {result.drivetrain && (
            <SpecChip icon={<Gauge className="h-3.5 w-3.5" />} label={result.drivetrain} />
          )}
          {result.priceRange && (
            <SpecChip icon={<DollarSign className="h-3.5 w-3.5" />} label={result.priceRange} />
          )}
        </div>

        {/* Engine type */}
        {result.engineType && (
          <p className="text-xs text-gray-400">{result.engineType}</p>
        )}

        {/* Why it matches */}
        <div className="bg-blue-50 rounded-lg p-3 flex-1">
          <p className="text-xs font-semibold text-blue-600 mb-1 uppercase tracking-wide">
            Why this matches you
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">{result.whyItMatches}</p>
        </div>

        {/* CTA */}
        <Link
          href={`/?car=${carData}`}
          className="block text-center py-2.5 px-4 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          View Full Specs →
        </Link>
      </div>
    </Card>
  )
}

function SpecChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 rounded-lg px-2.5 py-2 min-w-0">
      <span className="text-gray-400 shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </div>
  )
}

function parseMidYear(yearRange: string): number {
  const matches = yearRange.match(/\d{4}/g)
  if (!matches) return new Date().getFullYear()
  if (matches.length === 1) return parseInt(matches[0])
  const start = parseInt(matches[0])
  const end = parseInt(matches[matches.length - 1])
  return Math.floor((start + end) / 2)
}
