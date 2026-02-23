// POST /api/car-finder — AI-powered car recommendation endpoint

import { NextRequest, NextResponse } from 'next/server'
import type { CarFinderFilters, CarFinderResult } from '@/features/car-finder/types'

interface GroqResponse {
  choices: Array<{
    message: { content: string }
  }>
}

interface CarFinderRequestBody {
  filters?: CarFinderFilters
  lifestyle?: string
  refinement?: string
  previousResults?: CarFinderResult[]
}

function buildPrompt(
  filters: CarFinderFilters,
  lifestyle?: string,
  refinement?: string,
  previousResults?: CarFinderResult[]
): string {
  const filterLines = [
    filters.carType         && `- Vehicle type: ${filters.carType}`,
    filters.budgetMax       && `- Maximum budget: $${filters.budgetMax.toLocaleString()}`,
    filters.fuelType        && `- Fuel type preference: ${filters.fuelType}`,
    filters.seats           && `- Minimum seats needed: ${filters.seats}`,
    filters.transmission    && `- Transmission preference: ${filters.transmission}`,
    filters.drivetrain      && `- Drivetrain preference: ${filters.drivetrain}`,
    filters.condition       && `- Condition: ${filters.condition} only`,
    filters.brandPreference && `- Brand preference: ${filters.brandPreference}`,
  ].filter(Boolean).join('\n')

  const previousText = previousResults && previousResults.length > 0
    ? `\nPrevious recommendations were: ${previousResults.map(r => `${r.make} ${r.model}`).join(', ')}.`
    : ''

  return `You are an expert automotive consultant helping a car buyer find their perfect vehicle.

${filterLines ? `User's structured preferences:\n${filterLines}\n` : ''}${lifestyle ? `User's lifestyle description:\n"${lifestyle}"\n` : ''}${refinement ? `User refinement request: "${refinement}"${previousText}\n` : ''}
Based on this information, recommend 3-5 cars that genuinely suit the user's needs. Prioritize practical fit over brand popularity.

Return ONLY a valid JSON array — no markdown, no explanation, no text outside the array. Example format:

[
  {
    "make": "Honda",
    "model": "CR-V",
    "yearRange": "2020-2024",
    "category": "Compact SUV",
    "engineType": "1.5L Turbocharged 4-cylinder",
    "priceRange": "$28,000 - $38,000",
    "fuelEconomy": "28 city / 34 highway mpg",
    "seats": "5",
    "drivetrain": "FWD (AWD available)",
    "matchScore": 92,
    "whyItMatches": "The CR-V's generous cargo space and top safety ratings make it ideal for families with young children. Its hybrid variant cuts fuel costs for daily school runs and weekend trips."
  }
]

Rules:
- Only recommend real, currently available vehicles sold in the US
- matchScore (0-100): honest reflection of how well the car meets ALL stated needs
- whyItMatches: 2-3 sentences referencing specific things the user mentioned
- If a budget is set, recommend vehicles within that budget
- If a refinement is given, adjust previous recommendations accordingly
- Rank by matchScore descending
- Return 3-5 results`
}

export async function POST(request: NextRequest) {
  try {
    const body: CarFinderRequestBody = await request.json()
    const { filters = {}, lifestyle, refinement, previousResults } = body

    const hasFilters = Object.values(filters).some(v => v !== undefined)
    if (!hasFilters && !lifestyle) {
      return NextResponse.json(
        { success: false, error: 'Please provide at least one filter or a lifestyle description.' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'AI service is not configured. Please add GROQ_API_KEY to your environment.' },
        { status: 503 }
      )
    }

    const prompt = buildPrompt(filters, lifestyle, refinement, previousResults)

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a car recommendation expert. Always return valid JSON only, no markdown, no extra text.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.4,
        max_tokens: 2500,
      }),
    })

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text()
      console.error('[API/CarFinder] Groq API error:', errorText)
      throw new Error(`AI service failed: ${groqResponse.status}`)
    }

    const groqData: GroqResponse = await groqResponse.json()
    const content = groqData.choices[0]?.message?.content?.trim()
    if (!content) throw new Error('No response received from AI')

    // Extract JSON array (handles edge cases where model adds surrounding text)
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('AI returned an unexpected format. Please try again.')

    const rawResults = JSON.parse(jsonMatch[0]) as Omit<CarFinderResult, 'id'>[]

    const results: CarFinderResult[] = rawResults.map((r, idx) => ({
      ...r,
      id: `${String(r.make).toLowerCase().replace(/\s+/g, '-')}-${String(r.model).toLowerCase().replace(/\s+/g, '-')}-${idx}`,
      matchScore: Math.min(100, Math.max(0, Number(r.matchScore) || 70)),
    }))

    console.log(`[API/CarFinder] Returned ${results.length} recommendations`)

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error('[API/CarFinder] Error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
