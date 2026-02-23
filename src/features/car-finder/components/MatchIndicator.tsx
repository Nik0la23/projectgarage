'use client'

// Self-contained client component that reads Car Finder preferences from localStorage
// and shows a match score badge for a given car's specs.
// Renders nothing if no preferences are saved.

import { useState, useEffect } from 'react'
import { getFinderPreferences } from '@/lib/storage'
import { calculateMatchScore } from '../utils/match-calculator'
import type { CarSpecs } from '@/types'
import type { MatchScoreBreakdown } from '../types'

interface MatchIndicatorProps {
  specs: CarSpecs
  className?: string
}

const CRITERIA_LABELS: Partial<Record<keyof MatchScoreBreakdown, string>> = {
  bodyType: 'Vehicle type',
  fuelType: 'Fuel type',
  transmission: 'Transmission',
  drivetrain: 'Drivetrain',
  seats: 'Seating',
}

export function MatchIndicator({ specs, className = '' }: MatchIndicatorProps) {
  const [breakdown, setBreakdown] = useState<MatchScoreBreakdown | null>(null)
  const [open, setOpen] = useState(false)

  // Load preferences client-side only (avoids hydration mismatch)
  useEffect(() => {
    const prefs = getFinderPreferences()
    if (!prefs) return
    const result = calculateMatchScore(specs, prefs.filters)
    setBreakdown(result)
  }, [specs])

  if (!breakdown) return null

  const score = breakdown.total
  const { bgClass, textClass, label } =
    score >= 75 ? { bgClass: 'bg-green-100', textClass: 'text-green-700', label: 'Great match' } :
    score >= 50 ? { bgClass: 'bg-yellow-100', textClass: 'text-yellow-700', label: 'Partial match' } :
                  { bgClass: 'bg-gray-100',   textClass: 'text-gray-500',   label: 'Low match' }

  // Criteria rows (skip 'total' key)
  const criteriaEntries = (Object.keys(CRITERIA_LABELS) as (keyof typeof CRITERIA_LABELS)[])
    .filter(k => breakdown[k] !== undefined)

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${bgClass} ${textClass} border-current/20 hover:opacity-80 transition-opacity cursor-pointer`}
        title="Based on your Car Finder preferences"
      >
        {score}% match &middot; {label}
      </button>

      {open && (
        <>
          {/* Backdrop to close on outside click */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-60 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Car Finder match breakdown
            </p>
            <div className="space-y-2">
              {criteriaEntries.map(key => {
                const item = breakdown[key] as { score: number; matched: boolean } | undefined
                if (!item) return null
                return (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{CRITERIA_LABELS[key]}</span>
                    <span className={item.matched ? 'text-green-600 font-medium' : 'text-red-400'}>
                      {item.matched ? '✓ Match' : '✗ No match'}
                    </span>
                  </div>
                )
              })}
            </div>
            <p className="text-[11px] text-gray-400 mt-3 pt-2 border-t border-gray-100">
              Based on your saved Car Finder criteria
            </p>
          </div>
        </>
      )}
    </div>
  )
}
