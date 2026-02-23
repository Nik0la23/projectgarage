// NHTSA Complaints & Recalls API integration
// Free government API — no key required
// Complaints: https://api.nhtsa.gov/complaints/complaintsByVehicle
// Recalls:    https://api.nhtsa.gov/recalls/recallsByVehicle

import type { ForumSource } from '@/features/car-lookup/types'

const NHTSA_API_BASE = 'https://api.nhtsa.gov'
const REQUEST_TIMEOUT_MS = 10000

interface NHTSAComplaint {
  odiNumber: number
  manufacturer: string
  crash: boolean
  fire: boolean
  numberOfInjuries: number
  numberOfDeaths: number
  dateComplaintFiled: string
  dateOfIncident: string
  component: string
  summary: string
}

interface NHTSARecall {
  NHTSACampaignNumber: string
  ReportReceivedDate: string
  Component: string
  Summary: string
  Consequence: string
  Remedy: string
  Notes?: string
}

interface NHTSAComplaintsResponse {
  count: number
  results: NHTSAComplaint[]
}

interface NHTSARecallsResponse {
  Count: number
  results: NHTSARecall[]  // api.nhtsa.gov returns lowercase 'results', uppercase 'Count'
}

export interface NHTSAData {
  sources: ForumSource[]
  // Structured summary passed separately to AI for statistical context
  summary: string
}

// NHTSA api.nhtsa.gov requires title-case make/model (e.g. "Audi", not "AUDI")
function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Fetch NHTSA complaints and recalls for a vehicle
export async function fetchNHTSAComplaints(
  make: string,
  model: string,
  year: number
): Promise<NHTSAData> {
  // Normalise case — api.nhtsa.gov returns 400 for all-uppercase makes like "AUDI"
  const normMake = toTitleCase(make)
  const normModel = toTitleCase(model)

  console.log(`[NHTSA] Fetching complaints & recalls for ${year} ${normMake} ${normModel}`)

  const [complaintsResult, recallsResult] = await Promise.allSettled([
    fetchComplaints(normMake, normModel, year),
    fetchRecalls(normMake, normModel, year),
  ])

  const complaints = complaintsResult.status === 'fulfilled' ? complaintsResult.value : { count: 0, results: [] }
  const recalls = recallsResult.status === 'fulfilled' ? recallsResult.value : { Count: 0, results: [] }

  if (complaintsResult.status === 'rejected') {
    console.warn('[NHTSA] Complaints fetch failed:', complaintsResult.reason)
  }
  if (recallsResult.status === 'rejected') {
    console.warn('[NHTSA] Recalls fetch failed:', recallsResult.reason)
  }

  const recallCount = recalls.Count ?? 0
  console.log(`[NHTSA] ${complaints.count} complaints, ${recallCount} recalls`)

  const sources = buildSources(complaints, recalls, make, model, year)
  const summary = buildSummary(complaints, recalls, make, model, year)

  return { sources, summary }
}

async function fetchComplaints(make: string, model: string, year: number): Promise<NHTSAComplaintsResponse> {
  const url = new URL(`${NHTSA_API_BASE}/complaints/complaintsByVehicle`)
  url.searchParams.set('make', make)
  url.searchParams.set('model', model)
  url.searchParams.set('modelYear', year.toString())

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(url.toString(), {
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`NHTSA complaints API error: ${response.status}`)
    }

    const data: NHTSAComplaintsResponse = await response.json()
    return data
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

async function fetchRecalls(make: string, model: string, year: number): Promise<NHTSARecallsResponse> {
  const url = new URL(`${NHTSA_API_BASE}/recalls/recallsByVehicle`)
  url.searchParams.set('make', make)
  url.searchParams.set('model', model)
  url.searchParams.set('modelYear', year.toString())

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(url.toString(), {
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`NHTSA recalls API error: ${response.status}`)
    }

    const data: NHTSARecallsResponse = await response.json()
    return data
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

function buildSources(
  complaints: NHTSAComplaintsResponse,
  recalls: NHTSARecallsResponse,
  make: string,
  model: string,
  year: number
): ForumSource[] {
  const sources: ForumSource[] = []

  // Add top 8 complaints (sorted by crash/fire/injuries first for severity)
  const sortedComplaints = [...complaints.results].sort((a, b) => {
    const aScore = (a.crash ? 3 : 0) + (a.fire ? 3 : 0) + a.numberOfInjuries + a.numberOfDeaths * 10
    const bScore = (b.crash ? 3 : 0) + (b.fire ? 3 : 0) + b.numberOfInjuries + b.numberOfDeaths * 10
    return bScore - aScore
  })

  for (const complaint of sortedComplaints.slice(0, 8)) {
    if (!complaint.summary || complaint.summary.length < 20) continue

    const flags: string[] = []
    if (complaint.crash) flags.push('CRASH')
    if (complaint.fire) flags.push('FIRE')
    if (complaint.numberOfInjuries > 0) flags.push(`${complaint.numberOfInjuries} INJURIES`)
    if (complaint.numberOfDeaths > 0) flags.push(`${complaint.numberOfDeaths} DEATHS`)

    const title = flags.length > 0
      ? `[${flags.join(', ')}] ${complaint.component} complaint`
      : `${complaint.component} complaint`

    sources.push({
      title,
      body: complaint.summary.slice(0, 600),
      sourceType: 'nhtsa-complaint',
      url: `https://www.nhtsa.gov/vehicle/${encodeURIComponent(make)}/${encodeURIComponent(model)}/${year}/complaints`,
    })
  }

  // Add all recalls (these are official safety campaigns — always include)
  for (const recall of (recalls.results ?? [])) {
    const body = [
      recall.Summary,
      recall.Consequence ? `Consequence: ${recall.Consequence}` : '',
      recall.Remedy ? `Remedy: ${recall.Remedy}` : '',
    ].filter(Boolean).join(' | ').slice(0, 600)

    sources.push({
      title: `RECALL ${recall.NHTSACampaignNumber}: ${recall.Component}`,
      body,
      sourceType: 'nhtsa-complaint',
      url: `https://www.nhtsa.gov/recalls?nhtsaId=${recall.NHTSACampaignNumber}`,
    })
  }

  return sources
}

function buildSummary(
  complaints: NHTSAComplaintsResponse,
  recalls: NHTSARecallsResponse,
  make: string,
  model: string,
  year: number
): string {
  const recallCount = recalls.Count ?? 0

  if (complaints.count === 0 && recallCount === 0) {
    return `=== NHTSA OFFICIAL DATA (${year} ${make} ${model}) ===\nNo complaints or recalls on record.\n`
  }

  const lines: string[] = [
    `=== NHTSA OFFICIAL DATA (${year} ${make} ${model}) ===`,
    `Total complaints on government record: ${complaints.count}`,
    `Total safety recalls: ${recallCount}`,
    '',
    '⚠️ IMPORTANT CONTEXT FOR RELIABILITY SCORING:',
    `These ${complaints.count} complaints represent owner-reported issues filed with the US government.`,
    'Hundreds of thousands of this model may be in service — use complaint volume proportionally.',
    '',
  ]

  // Component breakdown
  if (complaints.count > 0) {
    const componentCounts: Record<string, number> = {}
    for (const c of complaints.results) {
      const comp = c.component || 'UNKNOWN'
      componentCounts[comp] = (componentCounts[comp] || 0) + 1
    }
    const sorted = Object.entries(componentCounts).sort(([, a], [, b]) => b - a)
    lines.push('Complaints by component:')
    for (const [component, count] of sorted) {
      lines.push(`  ${component}: ${count} complaint${count > 1 ? 's' : ''}`)
    }
    lines.push('')
  }

  // Recalls summary
  if (recallCount > 0) {
    lines.push(`Safety Recalls (${recallCount} total — these are mandatory safety campaigns):`)
    for (const recall of (recalls.results ?? [])) {
      lines.push(`  • [${recall.NHTSACampaignNumber}] ${recall.Component}: ${recall.Summary?.slice(0, 150) ?? 'No summary'}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
