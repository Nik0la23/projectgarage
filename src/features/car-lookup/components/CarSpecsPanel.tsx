'use client'

// Display car specifications with tabbed interface

import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import type { CarSpecs } from '@/types'

interface CarSpecsPanelProps {
  specs: CarSpecs | null
  className?: string
}

export function CarSpecsPanel({ specs, className }: CarSpecsPanelProps) {
  if (!specs) {
    return (
      <Card className={className}>
        <div className="p-6">
          <div className="text-center text-gray-500">
            <p className="text-lg">Select a car to view specifications</p>
          </div>
        </div>
      </Card>
    )
  }

  const hasEngineData = !!(
    specs.engine || 
    specs.horsepower || 
    specs.transmission || 
    specs.drivetrain
  )

  const hasFuelData = !!(
    specs.fuelType || 
    specs.mpgCity || 
    specs.mpgHighway || 
    specs.fuelCapacity
  )

  const hasDimensionData = !!(
    specs.length || 
    specs.width || 
    specs.height || 
    specs.curbWeight
  )

  return (
    <Card className={className}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold">
                {specs.year} {specs.make} {specs.model}
              </h2>
              {specs.trim && (
                <p className="text-lg text-gray-600 mt-1">{specs.trim}</p>
              )}
            </div>
            <Badge variant={specs.dataSource === 'verified' ? 'default' : 'secondary'}>
              {specs.dataSource === 'verified' ? '✓ Verified' : '⚡ AI-Generated'}
            </Badge>
          </div>
          {specs.bodyType && (
            <p className="text-sm text-gray-500 mt-2">{specs.bodyType}</p>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="engine">Engine</TabsTrigger>
            <TabsTrigger value="fuel">Fuel</TabsTrigger>
            <TabsTrigger value="dimensions">Dimensions</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            <SpecRow label="Year" value={specs.year} />
            <SpecRow label="Make" value={specs.make} />
            <SpecRow label="Model" value={specs.model} />
            <SpecRow label="Trim" value={specs.trim} />
            <SpecRow label="Body Type" value={specs.bodyType} />
            <SpecRow label="Engine" value={specs.engine} />
            <SpecRow label="Horsepower" value={specs.horsepower ? `${specs.horsepower} HP` : undefined} />
            <SpecRow label="Transmission" value={specs.transmission} />
            <SpecRow label="Drivetrain" value={specs.drivetrain} />
            {specs.zeroToSixty && (
              <SpecRow label="0-60 mph" value={`${specs.zeroToSixty}s`} />
            )}
          </TabsContent>

          {/* Engine Tab */}
          <TabsContent value="engine" className="space-y-4 mt-4">
            {hasEngineData ? (
              <>
                <SpecRow label="Engine" value={specs.engine} />
                <SpecRow label="Horsepower" value={specs.horsepower ? `${specs.horsepower} HP` : undefined} />
                <SpecRow label="Torque" value={specs.torque ? `${specs.torque} Nm` : undefined} />
                <SpecRow label="Transmission" value={specs.transmission} />
                <SpecRow label="Drivetrain" value={specs.drivetrain} />
                {specs.zeroToSixty && (
                  <SpecRow label="0-60 mph" value={`${specs.zeroToSixty}s`} />
                )}
                {specs.topSpeed && (
                  <SpecRow label="Top Speed" value={`${specs.topSpeed} km/h`} />
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Engine specifications not available for this vehicle.</p>
              </div>
            )}
          </TabsContent>

          {/* Fuel Tab */}
          <TabsContent value="fuel" className="space-y-4 mt-4">
            {hasFuelData ? (
              <>
                <SpecRow label="Fuel Type" value={specs.fuelType} />
                <SpecRow label="MPG City" value={specs.mpgCity ? `${specs.mpgCity} mpg` : undefined} />
                <SpecRow label="MPG Highway" value={specs.mpgHighway ? `${specs.mpgHighway} mpg` : undefined} />
                <SpecRow label="MPG Combined" value={specs.mpgCombined ? `${specs.mpgCombined} mpg` : undefined} />
                <SpecRow label="Fuel Capacity" value={specs.fuelCapacity ? `${specs.fuelCapacity} L` : undefined} />
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Fuel specifications not available for this vehicle.</p>
              </div>
            )}
          </TabsContent>

          {/* Dimensions Tab */}
          <TabsContent value="dimensions" className="space-y-4 mt-4">
            {hasDimensionData ? (
              <>
                <SpecRow label="Length" value={specs.length ? `${specs.length} mm` : undefined} />
                <SpecRow label="Width" value={specs.width ? `${specs.width} mm` : undefined} />
                <SpecRow label="Height" value={specs.height ? `${specs.height} mm` : undefined} />
                <SpecRow label="Wheelbase" value={specs.wheelbase ? `${specs.wheelbase} mm` : undefined} />
                <SpecRow label="Curb Weight" value={specs.curbWeight ? `${specs.curbWeight} kg` : undefined} />
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Dimension specifications not available for this vehicle.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Data Source Note */}
        {specs.dataSource === 'ai-generated' && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This data was generated using AI and may contain minor inaccuracies. 
              We recommend verifying critical specifications with the manufacturer.
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}

// Helper component for displaying spec rows
interface SpecRowProps {
  label: string
  value: string | number | null | undefined
}

function SpecRow({ label, value }: SpecRowProps) {
  if (!value) return null
  
  return (
    <div className="flex justify-between py-2 border-b border-gray-100">
      <span className="font-medium text-gray-700">{label}</span>
      <span className="text-gray-900">{value}</span>
    </div>
  )
}
