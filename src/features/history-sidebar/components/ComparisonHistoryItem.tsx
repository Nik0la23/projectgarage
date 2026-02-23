'use client'

// Stateless presentational component for a single comparison history entry.
// All logic lives in the parent section — this component only renders and fires callbacks.

import { GitCompare } from 'lucide-react'
import type { ComparisonHistoryItem as ComparisonHistoryItemType } from '@/lib/storage'

interface ComparisonHistoryItemProps {
  item: ComparisonHistoryItemType
  onSelect: (item: ComparisonHistoryItemType) => void
  className?: string
}

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'yesterday'
  return `${days}d ago`
}

function carLabel(car: { year: number; make: string; model: string }): string {
  return `${car.year} ${car.make} ${car.model}`
}

export function ComparisonHistoryItem({
  item,
  onSelect,
  className,
}: ComparisonHistoryItemProps) {
  const labels = item.cars.map(carLabel)

  return (
    <button
      onClick={() => onSelect(item)}
      className={[
        'w-full text-left px-3 py-2.5 rounded-lg',
        'hover:bg-gray-100 active:bg-gray-200',
        'transition-colors duration-100',
        'group flex items-start gap-2',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <GitCompare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400 group-hover:text-indigo-500 transition-colors" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-800 leading-tight">
          {labels.join(' vs ')}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {item.cars.length} cars · {formatRelativeTime(item.comparedAt)}
        </p>
      </div>
    </button>
  )
}
