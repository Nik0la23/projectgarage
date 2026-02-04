'use client'

// Car Selector - Select 2-3 cars for comparison

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Plus } from 'lucide-react'
import { useCarData } from '@/features/car-lookup/hooks/use-car-data'
import type { ComparisonCar } from '../types'

interface CarSelectorProps {
  cars: ComparisonCar[]
  onAdd: (car: ComparisonCar) => void
  onRemove: (index: number) => void
  className?: string
}

export function CarSelector({ cars, onAdd, onRemove, className }: CarSelectorProps) {
  const [make, setMake] = useState<string | null>(null)
  const [year, setYear] = useState<number | null>(null)
  const [model, setModel] = useState<string | null>(null)
  const [trim, setTrim] = useState<string | null>(null)

  const { makes, models, years, trims } = useCarData({ make, year, model, trim })

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

  const handleAddCar = () => {
    if (!make || !model || !year) return

    const car: ComparisonCar = {
      make,
      model,
      year,
      trim: trim || undefined,
    }

    onAdd(car)

    // Reset form
    setMake(null)
    setModel(null)
    setYear(null)
    setTrim(null)
  }

  const canAddCar = make && model && year

  return (
    <div className={className}>
      <h2 className="text-xl font-bold mb-4">Selected Cars ({cars.length}/3)</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Selected car cards */}
        {cars.map((car, index) => (
          <Card key={index} className="p-4 relative">
            <Button
              onClick={() => onRemove(index)}
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
            
            <div className="pr-8">
              <h3 className="font-semibold text-lg">
                {car.year} {car.make} {car.model}
              </h3>
              {car.trim && (
                <p className="text-sm text-gray-600 mt-1">{car.trim}</p>
              )}
            </div>
          </Card>
        ))}

        {/* Add car card */}
        {cars.length < 3 && (
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Plus className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold">Add Car</h3>
            </div>

            <div className="space-y-3">
              {/* Make Dropdown */}
              <div>
                <label htmlFor="make-selector" className="block text-xs font-medium mb-1">
                  Make
                </label>
                <select
                  id="make-selector"
                  value={make || ''}
                  onChange={handleMakeChange}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={makes.length === 0}
                >
                  <option value="">Select Make</option>
                  {makes.map((m, index) => (
                    <option key={m.makeId || `${m.makeName}-${index}`} value={m.makeName}>
                      {m.makeName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Model Dropdown */}
              <div>
                <label htmlFor="model-selector" className="block text-xs font-medium mb-1">
                  Model
                </label>
                <select
                  id="model-selector"
                  value={model || ''}
                  onChange={handleModelChange}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!make || models.length === 0}
                >
                  <option value="">Select Model</option>
                  {models.map((m, index) => (
                    <option key={m.modelId || `${m.modelName}-${index}`} value={m.modelName}>
                      {m.modelName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year Dropdown */}
              <div>
                <label htmlFor="year-selector" className="block text-xs font-medium mb-1">
                  Year
                </label>
                <select
                  id="year-selector"
                  value={year || ''}
                  onChange={handleYearChange}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!model || years.length === 0}
                >
                  <option value="">Select Year</option>
                  {years.map(y => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              {/* Trim Dropdown (Optional) */}
              {year && trims.length > 0 && (
                <div>
                  <label htmlFor="trim-selector" className="block text-xs font-medium mb-1">
                    Trim (Optional)
                  </label>
                  <select
                    id="trim-selector"
                    value={trim || ''}
                    onChange={handleTrimChange}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Trim</option>
                    {trims.map((t, index) => (
                      <option key={t.trimId || `${t.trimName}-${index}`} value={t.trimName}>
                        {t.displayName || t.trimName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Add Button */}
              <Button
                onClick={handleAddCar}
                disabled={!canAddCar}
                className="w-full mt-2"
                size="sm"
              >
                Add to Comparison
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
