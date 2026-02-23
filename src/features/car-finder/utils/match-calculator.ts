// Pure utility for calculating how well a car's specs match car finder preferences

import type { CarFinderFilters, MatchScoreBreakdown } from '../types'
import type { CarSpecs } from '@/types'

function normalize(str?: string | null): string {
  return (str || '').toLowerCase().trim()
}

function matchCarType(bodyType: string | undefined, preferredType: string): boolean {
  const body = normalize(bodyType)
  const pref = normalize(preferredType)

  const mappings: Record<string, string[]> = {
    sedan:       ['sedan', 'saloon', 'fastback'],
    suv:         ['suv', 'crossover', 'sport utility', 'sport-utility', 'cuv'],
    truck:       ['truck', 'pickup truck', 'pickup'],
    coupe:       ['coupe', '2-door'],
    hatchback:   ['hatchback', 'hatch'],
    convertible: ['convertible', 'cabriolet', 'roadster', 'spyder'],
    minivan:     ['minivan', 'van', 'mpv'],
    wagon:       ['wagon', 'estate', 'touring', 'sport wagon'],
  }

  const variants = mappings[pref] || [pref]
  return variants.some(v => body.includes(v))
}

function matchFuelType(specFuel: string | undefined, preferredFuel: string): boolean {
  const fuel = normalize(specFuel)
  const pref = normalize(preferredFuel)

  const mappings: Record<string, string[]> = {
    gasoline:          ['gasoline', 'gas', 'petrol', 'regular', 'premium', 'unleaded', 'flex'],
    diesel:            ['diesel', 'tdi', 'cdi'],
    hybrid:            ['hybrid', 'hev', 'self-charging'],
    electric:          ['electric', 'bev', 'fully electric'],
    'plug-in hybrid':  ['plug-in', 'phev', 'plug in hybrid'],
  }

  const variants = mappings[pref] || [pref]
  return variants.some(v => fuel.includes(v))
}

function matchTransmission(specTrans: string | undefined, preferredTrans: string): boolean {
  const trans = normalize(specTrans)
  const pref = normalize(preferredTrans)

  if (pref === 'automatic') {
    return trans.includes('auto') || trans.includes('cvt') || trans.includes('dct') || trans.includes('dsg')
  }
  if (pref === 'manual') {
    return trans.includes('manual') || trans.includes(' mt') || trans.endsWith('mt')
  }
  return trans.includes(pref)
}

function matchDrivetrain(specDrive: string | undefined, preferredDrive: string): boolean {
  const drive = normalize(specDrive)
  const pref = normalize(preferredDrive)

  const mappings: Record<string, string[]> = {
    fwd:  ['fwd', 'front-wheel', 'front wheel'],
    rwd:  ['rwd', 'rear-wheel', 'rear wheel'],
    awd:  ['awd', 'all-wheel', 'all wheel', '4wd', 'four wheel'],
    '4wd': ['4wd', '4x4', 'four wheel', 'awd'],
  }

  const variants = mappings[pref] || [pref]
  return variants.some(v => drive.includes(v))
}

/**
 * Calculate a match score (0-100) between a car's specs and the user's saved filters.
 * Returns null if no preferences are set or if there's nothing to compare.
 */
export function calculateMatchScore(specs: CarSpecs, filters: CarFinderFilters): MatchScoreBreakdown | null {
  const hasAnyFilter = Object.values(filters).some(v => v !== undefined)
  if (!hasAnyFilter) return null

  const breakdown: MatchScoreBreakdown = { total: 0 }

  let totalPossible = 0
  let totalEarned = 0

  // Car type / body type (25 pts)
  if (filters.carType) {
    totalPossible += 25
    const matched = matchCarType(specs.bodyType, filters.carType)
    breakdown.bodyType = { score: matched ? 25 : 0, matched }
    if (matched) totalEarned += 25
  }

  // Fuel type (25 pts)
  if (filters.fuelType) {
    totalPossible += 25
    const matched = matchFuelType(specs.fuelType, filters.fuelType)
    breakdown.fuelType = { score: matched ? 25 : 0, matched }
    if (matched) totalEarned += 25
  }

  // Transmission (20 pts)
  if (filters.transmission) {
    totalPossible += 20
    const matched = matchTransmission(specs.transmission, filters.transmission)
    breakdown.transmission = { score: matched ? 20 : 0, matched }
    if (matched) totalEarned += 20
  }

  // Drivetrain (20 pts)
  if (filters.drivetrain) {
    totalPossible += 20
    const matched = matchDrivetrain(specs.drivetrain, filters.drivetrain)
    breakdown.drivetrain = { score: matched ? 20 : 0, matched }
    if (matched) totalEarned += 20
  }

  // Seats (10 pts) — only if specs has seats data
  if (filters.seats && specs.seats) {
    totalPossible += 10
    const matched = specs.seats >= filters.seats
    breakdown.seats = { score: matched ? 10 : 0, matched }
    if (matched) totalEarned += 10
  }

  if (totalPossible === 0) return null

  breakdown.total = Math.round((totalEarned / totalPossible) * 100)
  return breakdown
}
