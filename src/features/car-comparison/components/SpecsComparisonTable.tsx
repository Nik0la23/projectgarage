'use client'

// Specs Comparison Table - Side-by-side specs with winner highlighting

import { Card } from '@/components/ui/card'
import { Check } from 'lucide-react'
import type { ComparisonCar, ComparisonCategory } from '../types'
import type { CarSpecs } from '@/types/car'

interface SpecsComparisonTableProps {
  cars: ComparisonCar[]
  specs: (CarSpecs | null)[]
  className?: string
}

// Define comparison categories with their properties
const COMPARISON_CATEGORIES: ComparisonCategory[] = [
  { name: 'Engine', key: 'engine', higherIsBetter: false },
  { name: 'Horsepower', key: 'horsepower', unit: 'hp', higherIsBetter: true },
  { name: 'Torque', key: 'torque', unit: 'lb-ft', higherIsBetter: true },
  { name: '0-60 mph', key: 'zeroToSixty', unit: 's', higherIsBetter: false },
  { name: 'Top Speed', key: 'topSpeed', unit: 'mph', higherIsBetter: true },
  { name: 'Transmission', key: 'transmission', higherIsBetter: false },
  { name: 'Drivetrain', key: 'drivetrain', higherIsBetter: false },
  { name: 'Fuel Type', key: 'fuelType', higherIsBetter: false },
  { name: 'MPG City', key: 'mpgCity', unit: 'mpg', higherIsBetter: true },
  { name: 'MPG Highway', key: 'mpgHighway', unit: 'mpg', higherIsBetter: true },
  { name: 'Fuel Tank', key: 'fuelCapacity', unit: 'gal', higherIsBetter: true },
  { name: 'Weight', key: 'curbWeight', unit: 'lbs', higherIsBetter: false },
  { name: 'Cargo Volume', key: 'cargoVolume', unit: 'cu ft', higherIsBetter: true },
]

export function SpecsComparisonTable({ cars, specs, className }: SpecsComparisonTableProps) {
  /**
   * Find the winner index for a given category
   * Returns -1 if no clear winner (all null/undefined or non-numeric)
   */
  const findWinner = (category: ComparisonCategory): number => {
    const values = specs.map(s => {
      if (!s) return null
      const value = s[category.key]
      // Only compare numeric values for winner detection
      return typeof value === 'number' ? value : null
    })

    // Check if we have at least 2 valid values to compare
    const validValues = values.filter(v => v !== null)
    if (validValues.length < 2) return -1

    // Find the best value
    let bestIndex = -1
    let bestValue: number | null = null

    values.forEach((value, index) => {
      if (value === null) return

      if (bestValue === null) {
        bestValue = value
        bestIndex = index
      } else {
        if (category.higherIsBetter) {
          if (value > bestValue) {
            bestValue = value
            bestIndex = index
          }
        } else {
          if (value < bestValue) {
            bestValue = value
            bestIndex = index
          }
        }
      }
    })

    return bestIndex
  }

  /**
   * Format a spec value for display
   */
  const formatValue = (value: unknown, unit?: string): string => {
    if (value === null || value === undefined) return 'N/A'
    
    if (typeof value === 'number') {
      return `${value}${unit ? ` ${unit}` : ''}`
    }
    
    return String(value)
  }

  return (
    <Card className={className}>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Specifications Comparison</h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2">
                <th className="text-left p-3 font-semibold">Specification</th>
                {cars.map((car, index) => (
                  <th key={index} className="text-left p-3 font-semibold">
                    <div className="min-w-[150px]">
                      <div className="text-sm">{car.year} {car.make}</div>
                      <div className="text-sm">{car.model}</div>
                      {car.trim && (
                        <div className="text-xs text-gray-600 font-normal">{car.trim}</div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_CATEGORIES.map((category) => {
                const winnerIndex = findWinner(category)

                return (
                  <tr key={category.key} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-700">{category.name}</td>
                    {specs.map((carSpecs, index) => {
                      const value = carSpecs ? carSpecs[category.key] : null
                      const isWinner = winnerIndex === index
                      
                      return (
                        <td
                          key={index}
                          className={`p-3 ${
                            isWinner ? 'bg-green-50 font-semibold text-green-900' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {formatValue(value, category.unit)}
                            {isWinner && (
                              <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                            )}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Check className="h-4 w-4 text-green-600" />
            <span>Indicates the best value in each category</span>
          </div>
        </div>

        {/* Data source badges */}
        <div className="mt-4 flex flex-wrap gap-2">
          {specs.map((carSpecs, index) => {
            if (!carSpecs) return null
            
            return (
              <div key={index} className="text-xs">
                <span className="font-medium">{cars[index].make} {cars[index].model}:</span>
                {' '}
                <span className={`px-2 py-1 rounded ${
                  carSpecs.dataSource === 'verified' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {carSpecs.dataSource === 'verified' ? '✓ Verified' : '⚡ AI-Generated'}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
