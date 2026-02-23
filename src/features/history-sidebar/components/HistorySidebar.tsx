'use client'

// Main collapsible history sidebar.
// Composes the toggle button and two history sections.
// Navigation callbacks are handled here, keeping sections pure.

import { useRouter } from 'next/navigation'
import { useSidebarState } from '../hooks/use-sidebar-state'
import { SidebarToggleButton } from './SidebarToggleButton'
import { CarHistorySection } from './CarHistorySection'
import { ComparisonHistorySection } from './ComparisonHistorySection'
import type { SearchHistoryItem, ComparisonHistoryItem } from '@/lib/storage'

export function HistorySidebar() {
  const { isOpen, isClient, toggle } = useSidebarState()
  const router = useRouter()

  const handleSelectCar = (item: SearchHistoryItem) => {
    const encoded = encodeURIComponent(
      JSON.stringify({
        make: item.make,
        model: item.model,
        year: item.year,
        trim: item.trim,
      })
    )
    router.push(`/?car=${encoded}`)
  }

  const handleSelectComparison = (item: ComparisonHistoryItem) => {
    const encoded = encodeURIComponent(JSON.stringify(item.cars))
    router.push(`/compare?cars=${encoded}`)
  }

  // Avoid hydration mismatch — render nothing until client is ready
  if (!isClient) return null

  return (
    <aside
      className={[
        'flex flex-row shrink-0',
        'sticky top-0 h-screen',
        'transition-[width] duration-200 ease-in-out',
        isOpen ? 'w-[288px]' : 'w-8',
      ].join(' ')}
    >
      {/* Toggle tab — always visible on the left edge */}
      <SidebarToggleButton isOpen={isOpen} onToggle={toggle} />

      {/* Panel body — only visible when open */}
      {isOpen && (
        <div className="flex-1 flex flex-col bg-white border-l border-gray-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-4 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">Search History</h2>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto py-3 space-y-4">
            <CarHistorySection onSelectCar={handleSelectCar} />
            <div className="border-t border-gray-100 mx-3" />
            <ComparisonHistorySection onSelectComparison={handleSelectComparison} />
          </div>
        </div>
      )}
    </aside>
  )
}
