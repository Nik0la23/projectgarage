'use client'

// Cascading dropdowns for Make → Model → Year → Trim selection
// Optimized flow: Make loads once, models fetch after make, years generated locally, trims fetch on-demand

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useCarData } from '../hooks/use-car-data'
import type { Car } from '@/types'

interface CarSearchFormProps {
  onSearch: (car: Car) => void
  className?: string
}

export function CarSearchForm({ onSearch, className }: CarSearchFormProps) {
  const [make, setMake] = useState<string | null>(null)
  const [year, setYear] = useState<number | null>(null)
  const [model, setModel] = useState<string | null>(null)
  const [trim, setTrim] = useState<string | null>(null)

  const { makes, models, years, trims, specs, loading, error } = useCarData({ make, year, model, trim })

  // Auto-submit when required fields are selected and specs are loaded
  // Trim is optional - if trims exist, wait for selection; if no trims, proceed without
  useEffect(() => {
    if (make && model && year && specs) {
      // If trims are available but none selected, don't auto-submit yet
      if (trims.length > 0 && !trim) {
        return
      }
      onSearch({ make, year, model, trim: trim || undefined })
    }
  }, [make, model, year, trim, trims, specs, onSearch])

  const handleMakeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMake = e.target.value || null
    setMake(newMake)
    setModel(null)
    setYear(null)
    setTrim(null)
  }

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModel = e.target.value || null
    setModel(newModel)
    setYear(null)
    setTrim(null)
  }

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = e.target.value ? parseInt(e.target.value) : null
    setYear(newYear)
    setTrim(null)
  }

  const handleTrimChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTrim = e.target.value || null
    setTrim(newTrim)
  }

  const handleReset = () => {
    setMake(null)
    setModel(null)
    setYear(null)
    setTrim(null)
  }

  return (
    <Card className={className}>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Find Your Car</h2>
        
        <div className="space-y-4">
          {/* Make Dropdown - Step 1 */}
          <div>
            <label htmlFor="make" className="block text-sm font-medium mb-2">
              Make <span className="text-gray-400 text-xs">(Step 1)</span>
            </label>
            <select
              id="make"
              value={make || ''}
              onChange={handleMakeChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={makes.length === 0}
            >
              <option value="">Select Make</option>
              {makes.map((m, index) => (
                <option key={m.makeId || `${m.makeName}-${index}`} value={m.makeName}>
                  {m.makeName}
                </option>
              ))}
            </select>
            {makes.length === 0 && loading && (
              <p className="text-sm text-gray-500 mt-1">Loading makes...</p>
            )}
          </div>

          {/* Model Dropdown - Step 2 */}
          <div>
            <label htmlFor="model" className="block text-sm font-medium mb-2">
              Model <span className="text-gray-400 text-xs">(Step 2)</span>
            </label>
            <select
              id="model"
              value={model || ''}
              onChange={handleModelChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!make || models.length === 0}
            >
              <option value="">Select Model</option>
              {models.map((m, index) => (
                <option key={m.modelId || `${m.modelName}-${index}`} value={m.modelName}>
                  {m.modelName}
                </option>
              ))}
            </select>
            {make && models.length === 0 && loading && (
              <p className="text-sm text-gray-500 mt-1">Loading models...</p>
            )}
          </div>

          {/* Year Dropdown - Step 3 */}
          <div>
            <label htmlFor="year" className="block text-sm font-medium mb-2">
              Year <span className="text-gray-400 text-xs">(Step 3)</span>
            </label>
            <select
              id="year"
              value={year || ''}
              onChange={handleYearChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!model || years.length === 0}
            >
              <option value="">
                {years.length === 0 ? 'No years available' : 'Select Year'}
              </option>
              {years.map(y => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            {make && model && years.length === 0 && loading && (
              <p className="text-sm text-gray-500 mt-1">Loading years...</p>
            )}
          </div>

          {/* Trim Dropdown - Step 4 (Optional) */}
          {year && (
            <div>
              <label htmlFor="trim" className="block text-sm font-medium mb-2">
                Trim, Engine & Transmission <span className="text-gray-400 text-xs">(Step 4 - Optional)</span>
              </label>
              <select
                id="trim"
                value={trim || ''}
                onChange={handleTrimChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!year || trims.length === 0}
              >
                <option value="">
                  {trims.length === 0 ? 'No trims available' : 'Select Trim (Optional)'}
                </option>
                {trims.map((t, index) => (
                  <option key={t.trimId || `${t.trimName}-${index}`} value={t.trimName}>
                    {t.displayName || t.trimName}
                  </option>
                ))}
              </select>
              {make && model && year && trims.length === 0 && loading && (
                <p className="text-sm text-gray-500 mt-1">Loading trims...</p>
              )}
              {trims.length === 0 && !loading && (
                <p className="text-sm text-gray-500 mt-1">
                  No specific trims available - showing general specs
                </p>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading...</span>
            </div>
          )}

          {/* Reset Button */}
          {(make || model || year || trim) && (
            <Button
              onClick={handleReset}
              variant="outline"
              className="w-full"
            >
              Reset Search
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
