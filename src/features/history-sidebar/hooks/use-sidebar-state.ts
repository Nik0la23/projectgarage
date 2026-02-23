'use client'

// Manages sidebar open/closed state with localStorage persistence

import { useState, useEffect, useCallback } from 'react'
import { getSidebarOpen, setSidebarOpen } from '@/lib/storage'

export function useSidebarState() {
  const [isOpen, setIsOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    setIsOpen(getSidebarOpen())
  }, [])

  const toggle = useCallback(() => {
    setIsOpen(prev => {
      const next = !prev
      setSidebarOpen(next)
      return next
    })
  }, [])

  const open = useCallback(() => {
    setIsOpen(true)
    setSidebarOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setSidebarOpen(false)
  }, [])

  return { isOpen, isClient, toggle, open, close }
}
