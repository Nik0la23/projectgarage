'use client'

// Vehicles history section.
// Owns the useSearchHistory hook and exposes only selection callbacks to the parent.

import { Trash2 } from 'lucide-react'
import { useSearchHistory } from '@/features/car-lookup/hooks/use-search-history'
import { HistoryCarItem } from './HistoryCarItem'
import type { SearchHistoryItem } from '@/lib/storage'

interface CarHistorySectionProps {
  onSelectCar: (item: SearchHistoryItem) => void
  className?: string
}

export function CarHistorySection({ onSelectCar, className }: CarHistorySectionProps) {
  const { history, clearHistory, isClient } = useSearchHistory()

  if (!isClient) return null

  return (
    <section className={className}>
      {/* Section header */}
      <div className="flex items-center justify-between px-3 mb-1">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Vehicles
        </h3>
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            aria-label="Clear vehicle history"
            className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Items */}
      {history.length === 0 ? (
        <p className="px-3 py-3 text-xs text-gray-400 italic">
          No vehicles yet. Search for a car to get started.
        </p>
      ) : (
        <ul className="space-y-0.5">
          {history.map(item => (
            <li key={`${item.year}-${item.make}-${item.model}-${item.trim ?? ''}-${item.searchedAt}`}>
              <HistoryCarItem item={item} onSelect={onSelectCar} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
