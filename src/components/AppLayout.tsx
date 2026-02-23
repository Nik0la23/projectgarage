'use client'

// Client-side flex layout wrapper that hosts the main content + history sidebar.
// Kept in /components (not /features) because it is infrastructure, not a feature.
// The root layout.tsx (server component) imports this and wraps {children} with it.

import { HistorySidebar } from '@/features/history-sidebar'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex flex-row min-h-screen">
      {/* Main content — shrinks when sidebar opens */}
      <div className="flex-1 min-w-0 overflow-auto">
        {children}
      </div>

      {/* History sidebar — fixed-width panel on the right */}
      <HistorySidebar />
    </div>
  )
}
