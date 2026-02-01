// POST /api/ai/generate-trims - Generate trim options using Groq AI

import { NextRequest, NextResponse } from 'next/server'
import type { TrimOption } from '@/types'

interface GenerateTrimsRequest {
  make: string
  model: string
  year: number
}

interface GroqResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

interface AITrimData {
  trimName: string
  engineSize?: string
  engineCylinders?: string
  engineType?: string
  fuelType?: string
  transmissionType?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateTrimsRequest = await request.json()
    const { make, model, year } = body
    
    if (!make || !model || !year) {
      return NextResponse.json(
        { error: 'Make, model, and year are required' },
        { status: 400 }
      )
    }
    
    const apiKey = process.env.GROQ_API_KEY
    
    if (!apiKey) {
      console.warn('GROQ_API_KEY not configured, returning empty trims')
      return NextResponse.json([])
    }
    
    // Build the car description
    const carDescription = `${year} ${make} ${model}`
    
    // Create prompt for Groq - optimized for realistic trim data
    const prompt = `List the most common trim levels for a ${carDescription}.

For each trim, provide:
- Trim name (e.g., "Base", "SE", "Limited", "Sport")
- Engine size in liters (e.g., "2.0", "3.5")
- Engine cylinders (e.g., "4", "6", "8")
- Engine type (e.g., "Inline", "V", "Flat")
- Fuel type (e.g., "petrol", "diesel", "electric", "hybrid")
- Transmission type (e.g., "manual", "automatic", "CVT", "dual-clutch")

Return ONLY a valid JSON array in this exact format, no other text:
[
  {
    "trimName": "Base",
    "engineSize": "2.0",
    "engineCylinders": "4",
    "engineType": "Inline",
    "fuelType": "petrol",
    "transmissionType": "manual"
  }
]

Be realistic and base the trims on typical manufacturer offerings. Include 2-5 trims maximum.`

    // Call Groq API
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
            content: 'You are a car specifications expert. Always return valid JSON only, no markdown or other text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1024,
      }),
    })
    
    if (!groqResponse.ok) {
      const errorText = await groqResponse.text()
      console.error('Groq API error:', errorText)
      throw new Error(`Groq API failed: ${groqResponse.status}`)
    }
    
    const groqData: GroqResponse = await groqResponse.json()
    const content = groqData.choices[0]?.message?.content
    
    if (!content) {
      throw new Error('No content in Groq response')
    }
    
    // Parse the JSON response
    let aiTrims: AITrimData[]
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      aiTrims = JSON.parse(cleanContent)
    } catch (parseError) {
      console.error('Failed to parse AI response:', content)
      throw new Error('Invalid JSON from AI')
    }
    
    // Convert AI trim data to TrimOption format with display names
    const trims: TrimOption[] = aiTrims.map((trim, index) => {
      const parts: string[] = []
      
      // Add trim name
      if (trim.trimName) {
        parts.push(trim.trimName)
      }
      
      // Add engine size and cylinders
      if (trim.engineSize && trim.engineCylinders) {
        const engineDesc = trim.engineType 
          ? `${trim.engineSize}L ${trim.engineCylinders}-cyl ${trim.engineType}`
          : `${trim.engineSize}L ${trim.engineCylinders}-cyl`
        parts.push(engineDesc)
      } else if (trim.engineSize) {
        parts.push(`${trim.engineSize}L`)
      }
      
      // Add fuel type and transmission in parentheses
      const details: string[] = []
      if (trim.fuelType) {
        details.push(trim.fuelType.toLowerCase())
      }
      if (trim.transmissionType) {
        details.push(trim.transmissionType.toLowerCase())
      }
      
      // Combine everything
      let displayName = parts.join(' ')
      if (details.length > 0) {
        displayName += ` (${details.join(', ')})`
      }
      
      return {
        trimId: `ai-${index}`,
        trimName: trim.trimName,
        displayName: displayName || trim.trimName,
        dataSource: 'ai-generated',
      }
    })
    
    return NextResponse.json(trims, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600', // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error('Error generating AI trims:', error)
    return NextResponse.json(
      { error: 'Failed to generate trim options' },
      { status: 500 }
    )
  }
}
