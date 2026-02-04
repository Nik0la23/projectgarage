'use client'

// AI Comparison Analysis - Display AI-powered comparison insights

import { Card } from '@/components/ui/card'
import { Trophy, Zap, Fuel, Shield, DollarSign, CheckCircle, XCircle } from 'lucide-react'
import type { ComparisonAnalysisResult } from '../types'

interface ComparisonAnalysisProps {
  data: ComparisonAnalysisResult
  className?: string
}

const WINNER_CATEGORIES = [
  { title: 'Overall Winner', icon: Trophy, key: 'overall' as const, color: 'text-yellow-600' },
  { title: 'Best Performance', icon: Zap, key: 'speed' as const, color: 'text-blue-600' },
  { title: 'Best Fuel Economy', icon: Fuel, key: 'fuelEfficiency' as const, color: 'text-green-600' },
  { title: 'Most Reliable', icon: Shield, key: 'reliability' as const, color: 'text-purple-600' },
  { title: 'Best Value', icon: DollarSign, key: 'value' as const, color: 'text-emerald-600' },
]

export function ComparisonAnalysis({ data, className }: ComparisonAnalysisProps) {
  return (
    <div className={className}>
      <Card className="p-6 mb-6">
        <h2 className="text-2xl font-bold mb-6">AI Comparison Analysis</h2>

        {/* Winner Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {WINNER_CATEGORIES.map((category) => (
            <Card key={category.key} className="p-4 text-center">
              <category.icon className={`h-8 w-8 ${category.color} mx-auto mb-2`} />
              <h4 className="font-semibold text-sm mb-1">{category.title}</h4>
              <p className="text-xs text-gray-600">{data.winner[category.key]}</p>
            </Card>
          ))}
        </div>

        {/* Summary */}
        <Card className="p-4 bg-blue-50 border-blue-200 mb-8">
          <h3 className="font-semibold mb-2">Summary</h3>
          <p className="text-sm text-gray-700">{data.summary}</p>
        </Card>

        {/* Strengths and Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Strengths */}
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Strengths
            </h3>
            <div className="space-y-4">
              {Object.entries(data.strengths).map(([carName, strengths]) => (
                <Card key={carName} className="p-4">
                  <h4 className="font-semibold mb-3 text-sm">{carName}</h4>
                  <ul className="space-y-2">
                    {strengths.map((strength, index) => (
                      strength && (
                        <li key={index} className="flex items-start gap-2 text-sm text-green-800">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{strength}</span>
                        </li>
                      )
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>

          {/* Weaknesses */}
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Weaknesses
            </h3>
            <div className="space-y-4">
              {Object.entries(data.weaknesses).map(([carName, weaknesses]) => (
                <Card key={carName} className="p-4">
                  <h4 className="font-semibold mb-3 text-sm">{carName}</h4>
                  <ul className="space-y-2">
                    {weaknesses.map((weakness, index) => (
                      weakness && (
                        <li key={index} className="flex items-start gap-2 text-sm text-red-800">
                          <XCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                          <span>{weakness}</span>
                        </li>
                      )
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Best For */}
        <div>
          <h3 className="text-xl font-bold mb-4">Best For</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(data.bestFor).map(([carName, useCase]) => (
              <Card key={carName} className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
                <h4 className="font-semibold text-sm mb-2">{carName}</h4>
                <p className="text-sm text-gray-700">{useCase}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 text-xs text-gray-500 border-t pt-4">
          <p>
            AI-generated analysis is based on specifications and reliability data. 
            Always test drive and research thoroughly before making a purchase decision.
          </p>
        </div>
      </Card>
    </div>
  )
}
