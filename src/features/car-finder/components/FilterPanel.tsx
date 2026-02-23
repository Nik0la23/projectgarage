'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { CarFinderFilters } from '../types'

const CAR_TYPES = [
  { label: 'Any', value: undefined },
  { label: 'Sedan', value: 'sedan' },
  { label: 'SUV', value: 'suv' },
  { label: 'Truck', value: 'truck' },
  { label: 'Coupe', value: 'coupe' },
  { label: 'Hatchback', value: 'hatchback' },
  { label: 'Convertible', value: 'convertible' },
  { label: 'Minivan', value: 'minivan' },
  { label: 'Wagon', value: 'wagon' },
]

const FUEL_TYPES = [
  { label: 'Any', value: undefined },
  { label: 'Gasoline', value: 'gasoline' },
  { label: 'Hybrid', value: 'hybrid' },
  { label: 'Electric', value: 'electric' },
  { label: 'Diesel', value: 'diesel' },
  { label: 'Plug-in Hybrid', value: 'plug-in hybrid' },
]

const SEAT_OPTIONS = [
  { label: 'Any', value: undefined },
  { label: '2', value: 2 },
  { label: '4', value: 4 },
  { label: '5', value: 5 },
  { label: '7', value: 7 },
  { label: '8+', value: 8 },
]

const TRANSMISSION_OPTIONS = [
  { label: 'Any', value: undefined },
  { label: 'Automatic', value: 'automatic' },
  { label: 'Manual', value: 'manual' },
]

const DRIVETRAIN_OPTIONS = [
  { label: 'Any', value: undefined },
  { label: 'FWD', value: 'fwd' },
  { label: 'RWD', value: 'rwd' },
  { label: 'AWD', value: 'awd' },
  { label: '4WD', value: '4wd' },
]

const CONDITION_OPTIONS = [
  { label: 'Any', value: undefined },
  { label: 'New', value: 'new' },
  { label: 'Used', value: 'used' },
]

const BUDGET_MIN = 5000
const BUDGET_MAX = 150000
const BUDGET_STEP = 5000

interface FilterPanelProps {
  filters: CarFinderFilters
  onChange: <K extends keyof CarFinderFilters>(key: K, value: CarFinderFilters[K] | undefined) => void
}

export function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const [showMore, setShowMore] = useState(false)

  const budgetDisplay = filters.budgetMax
    ? `Up to $${filters.budgetMax.toLocaleString()}`
    : 'No limit'

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Structured Filters</h3>
        <p className="text-xs text-gray-400 mt-0.5">Fill any or skip all — filters are optional</p>
      </div>

      {/* Car Type */}
      <FilterSection label="Car Type">
        <select
          value={filters.carType || ''}
          onChange={e => onChange('carType', e.target.value || undefined)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {CAR_TYPES.map(t => (
            <option key={t.label} value={t.value || ''}>{t.label}</option>
          ))}
        </select>
      </FilterSection>

      {/* Budget Slider */}
      <FilterSection label={`Budget — ${budgetDisplay}`}>
        <input
          type="range"
          min={BUDGET_MIN}
          max={BUDGET_MAX}
          step={BUDGET_STEP}
          value={filters.budgetMax ?? BUDGET_MAX}
          onChange={e => {
            const val = parseInt(e.target.value)
            onChange('budgetMax', val >= BUDGET_MAX ? undefined : val)
          }}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-600 bg-gray-200"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>$5k</span>
          <span>$75k</span>
          <span>$150k+</span>
        </div>
      </FilterSection>

      {/* Fuel Type */}
      <FilterSection label="Fuel Type">
        <div className="flex flex-wrap gap-1.5">
          {FUEL_TYPES.map(fuel => {
            const isActive = fuel.value === undefined
              ? !filters.fuelType
              : filters.fuelType === fuel.value
            return (
              <ToggleChip
                key={fuel.label}
                label={fuel.label}
                active={isActive}
                onClick={() => onChange('fuelType', isActive && fuel.value !== undefined ? undefined : fuel.value)}
              />
            )
          })}
        </div>
      </FilterSection>

      {/* Seats */}
      <FilterSection label="Seats">
        <div className="flex flex-wrap gap-1.5">
          {SEAT_OPTIONS.map(seat => {
            const isActive = seat.value === undefined
              ? !filters.seats
              : filters.seats === seat.value
            return (
              <ToggleChip
                key={seat.label}
                label={seat.label}
                active={isActive}
                onClick={() => onChange('seats', isActive && seat.value !== undefined ? undefined : seat.value)}
              />
            )
          })}
        </div>
      </FilterSection>

      {/* Transmission */}
      <FilterSection label="Transmission">
        <div className="flex gap-1.5">
          {TRANSMISSION_OPTIONS.map(trans => {
            const isActive = trans.value === undefined
              ? !filters.transmission
              : filters.transmission === trans.value
            return (
              <ToggleChip
                key={trans.label}
                label={trans.label}
                active={isActive}
                className="flex-1 justify-center"
                onClick={() => onChange('transmission', isActive && trans.value !== undefined ? undefined : trans.value)}
              />
            )
          })}
        </div>
      </FilterSection>

      {/* More Filters Toggle */}
      <button
        onClick={() => setShowMore(!showMore)}
        className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
      >
        {showMore ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        {showMore ? 'Fewer filters' : 'More filters'}
      </button>

      {/* Expanded More Filters */}
      {showMore && (
        <div className="space-y-4 pt-3 border-t border-gray-100">
          {/* Drivetrain */}
          <FilterSection label="Drivetrain">
            <div className="flex flex-wrap gap-1.5">
              {DRIVETRAIN_OPTIONS.map(drive => {
                const isActive = drive.value === undefined
                  ? !filters.drivetrain
                  : filters.drivetrain === drive.value
                return (
                  <ToggleChip
                    key={drive.label}
                    label={drive.label}
                    active={isActive}
                    onClick={() => onChange('drivetrain', isActive && drive.value !== undefined ? undefined : drive.value)}
                  />
                )
              })}
            </div>
          </FilterSection>

          {/* Condition */}
          <FilterSection label="Condition">
            <div className="flex gap-1.5">
              {CONDITION_OPTIONS.map(cond => {
                const isActive = cond.value === undefined
                  ? !filters.condition
                  : filters.condition === cond.value
                return (
                  <ToggleChip
                    key={cond.label}
                    label={cond.label}
                    active={isActive}
                    className="flex-1 justify-center"
                    onClick={() => onChange('condition', isActive && cond.value !== undefined ? undefined : cond.value)}
                  />
                )
              })}
            </div>
          </FilterSection>

          {/* Brand Preference */}
          <FilterSection label="Brand Preference (optional)">
            <input
              type="text"
              placeholder="e.g. Toyota, Honda, BMW..."
              value={filters.brandPreference || ''}
              onChange={e => onChange('brandPreference', e.target.value || undefined)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </FilterSection>
        </div>
      )}
    </div>
  )
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  )
}

interface ToggleChipProps {
  label: string
  active: boolean
  onClick: () => void
  className?: string
}

function ToggleChip({ label, active, onClick, className = '' }: ToggleChipProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
        active
          ? 'bg-blue-600 text-white border-blue-600'
          : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
      } ${className}`}
    >
      {label}
    </button>
  )
}
