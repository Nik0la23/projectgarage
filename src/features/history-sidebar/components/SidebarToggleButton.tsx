'use client'

// The tab/button that sits on the left edge of the sidebar panel.
// Always visible — lets users open/close the sidebar regardless of state.

import { ChevronLeft, ChevronRight, History } from 'lucide-react'

interface SidebarToggleButtonProps {
  isOpen: boolean
  onToggle: () => void
  className?: string
}

export function SidebarToggleButton({
  isOpen,
  onToggle,
  className,
}: SidebarToggleButtonProps) {
  return (
    <button
      onClick={onToggle}
      aria-label={isOpen ? 'Close history sidebar' : 'Open history sidebar'}
      className={[
        'flex flex-col items-center justify-center gap-1',
        'w-8 py-6 rounded-l-lg',
        'bg-white border border-r-0 border-gray-200 shadow-sm',
        'hover:bg-gray-50 active:bg-gray-100',
        'transition-colors duration-100',
        'text-gray-500 hover:text-gray-700',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <History className="h-4 w-4" />
      <span
        className="text-gray-400"
        style={{ writingMode: 'vertical-lr', fontSize: '10px', letterSpacing: '0.05em' }}
      >
        History
      </span>
      {isOpen ? (
        <ChevronRight className="h-3 w-3 mt-1" />
      ) : (
        <ChevronLeft className="h-3 w-3 mt-1" />
      )}
    </button>
  )
}
