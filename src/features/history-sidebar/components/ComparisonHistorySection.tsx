'use client'

// Comparisons history section.
// Owns the useComparisonHistory hook and exposes only selection callbacks to the parent.

import { Trash2 } from 'lucide-react'
import { useComparisonHistory } from '../hooks/use-comparison-history'
import { ComparisonHistoryItem } from './ComparisonHistoryItem'
import type { ComparisonHistoryItem as ComparisonHistoryItemType } from '@/lib/storage'

interface ComparisonHistorySectionProps {
  onSelectComparison: (item: ComparisonHistoryItemType) => void
  className?: string
}

export function ComparisonHistorySection({
  onSelectComparison,
  className,
}: ComparisonHistorySectionProps) {
  const { history, clearHistory, isClient } = useComparisonHistory()

  if (!isClient) return null

  return (
    <section className={className}>
      {/* Section header */}
      <div className="flex items-center justify-between px-3 mb-1">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Comparisons
        </h3>
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            aria-label="Clear comparison history"
            className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Items */}
      {history.length === 0 ? (
        <p className="px-3 py-3 text-xs text-gray-400 italic">
          No comparisons yet. Compare 2+ cars to get started.
        </p>
      ) : (
        <ul className="space-y-0.5">
          {history.map(item => (
            <li key={item.id}>
              <ComparisonHistoryItem item={item} onSelect={onSelectComparison} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
