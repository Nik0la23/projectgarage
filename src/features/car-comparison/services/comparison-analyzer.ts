// AI Comparison Analyzer - Uses Groq API to generate car comparison insights

import type { ComparisonCar, ComparisonAnalysisResult } from '../types'
import type { CarSpecs } from '@/types/car'
import type { CarAnalysisResult } from '@/features/car-lookup/types'

interface GroqResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

/**
 * Generate AI-powered comparison analysis for multiple cars
 * @param cars - Array of cars to compare
 * @param specs - Array of car specs (null if fetch failed)
 * @param analyses - Array of reliability analyses (null if fetch failed)
 * @returns Comparison analysis with winners, strengths, weaknesses, and summary
 */
export async function generateComparisonAnalysis(
  cars: ComparisonCar[],
  specs: (CarSpecs | null)[],
  analyses: (CarAnalysisResult | null)[]
): Promise<ComparisonAnalysisResult> {
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    console.warn('[Groq] API key not configured - returning empty comparison analysis')
    return createEmptyAnalysis(cars)
  }

  try {
    // Build system prompt
    const systemPrompt = 'You are an automotive expert providing unbiased car comparisons. Analyze the provided data and return structured JSON with your comparison insights.'

    // Build user prompt with car data
    const carDataText = cars.map((car, i) => {
      const carName = `${car.year} ${car.make} ${car.model}${car.trim ? ` ${car.trim}` : ''}`
      const carSpecs = specs[i]
      const carAnalysis = analyses[i]

      return `
Car ${i + 1}: ${carName}

Specifications:
${carSpecs ? JSON.stringify({
  engine: carSpecs.engine,
  horsepower: carSpecs.horsepower,
  torque: carSpecs.torque,
  transmission: carSpecs.transmission,
  drivetrain: carSpecs.drivetrain,
  fuelType: carSpecs.fuelType,
  mpgCity: carSpecs.mpgCity,
  mpgHighway: carSpecs.mpgHighway,
  zeroToSixty: carSpecs.zeroToSixty,
  topSpeed: carSpecs.topSpeed,
  curbWeight: carSpecs.curbWeight,
  fuelCapacity: carSpecs.fuelCapacity,
}, null, 2) : 'Specs not available'}

Reliability Score: ${carAnalysis?.reliabilityScore ? `${carAnalysis.reliabilityScore}/10` : 'N/A'}
Common Problems: ${carAnalysis?.commonProblems ? carAnalysis.commonProblems.map(p => p.issue).join(', ') : 'N/A'}
`
    }).join('\n---\n')

    const userPrompt = `
Compare these ${cars.length} cars and provide a comprehensive analysis.

${carDataText}

Return a JSON object with this EXACT structure:
{
  "winner": {
    "overall": "full car name including year",
    "speed": "full car name",
    "fuelEfficiency": "full car name",
    "reliability": "full car name",
    "value": "full car name"
  },
  "strengths": {
    "full car name 1": ["strength1", "strength2", "strength3"],
    "full car name 2": ["strength1", "strength2", "strength3"]
  },
  "weaknesses": {
    "full car name 1": ["weakness1", "weakness2"],
    "full car name 2": ["weakness1", "weakness2"]
  },
  "bestFor": {
    "full car name 1": "Best for [use case]",
    "full car name 2": "Best for [use case]"
  },
  "summary": "2-3 sentence overall comparison summary"
}

Important: Use the FULL car names (e.g., "2020 Honda Civic LX") consistently across all fields.
`

    console.log('[Groq] Generating comparison analysis...')

    // Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Groq] API request failed:', errorText)
      throw new Error(`Groq API failed: ${response.status}`)
    }

    const data: GroqResponse = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error('No response from Groq API')
    }

    // Clean markdown code blocks if present
    const cleanedContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    // Parse JSON response
    const analysis: ComparisonAnalysisResult = JSON.parse(cleanedContent)

    console.log('[Groq] Comparison analysis generated successfully')
    return analysis

  } catch (error) {
    console.error('[Groq] Error generating comparison analysis:', error)
    return createEmptyAnalysis(cars)
  }
}

/**
 * Create empty analysis structure as fallback
 */
function createEmptyAnalysis(cars: ComparisonCar[]): ComparisonAnalysisResult {
  const carNames = cars.map(car => `${car.year} ${car.make} ${car.model}${car.trim ? ` ${car.trim}` : ''}`)
  
  const strengths: { [key: string]: string[] } = {}
  const weaknesses: { [key: string]: string[] } = {}
  const bestFor: { [key: string]: string } = {}
  
  carNames.forEach(name => {
    strengths[name] = ['Analysis unavailable', 'Please try again later', '']
    weaknesses[name] = ['Analysis unavailable', '']
    bestFor[name] = 'Analysis unavailable'
  })

  return {
    winner: {
      overall: carNames[0] || 'N/A',
      speed: carNames[0] || 'N/A',
      fuelEfficiency: carNames[0] || 'N/A',
      reliability: carNames[0] || 'N/A',
      value: carNames[0] || 'N/A',
    },
    strengths,
    weaknesses,
    bestFor,
    summary: 'Comparison analysis is currently unavailable. Please check that the Groq API key is configured correctly.',
  }
}
