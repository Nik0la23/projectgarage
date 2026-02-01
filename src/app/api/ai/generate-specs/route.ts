// POST /api/ai/generate-specs - Generate car specs using Groq AI

import { NextRequest, NextResponse } from 'next/server'
import type { CarSpecs } from '@/types'

interface GenerateSpecsRequest {
  make: string
  model: string
  year: number
  trim?: string
}

interface GroqResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateSpecsRequest = await request.json()
    const { make, model, year, trim } = body
    
    if (!make || !model || !year) {
      return NextResponse.json(
        { error: 'Make, model, and year are required' },
        { status: 400 }
      )
    }
    
    const apiKey = process.env.GROQ_API_KEY
    
    if (!apiKey) {
      console.warn('GROQ_API_KEY not configured, returning placeholder specs')
      
      // Return basic placeholder specs
      const placeholderSpecs: CarSpecs = {
        make,
        model,
        year,
        trim,
        dataSource: 'ai-generated',
        sourceApi: 'groq',
        bodyType: 'Information not available',
      }
      
      return NextResponse.json(placeholderSpecs)
    }
    
    // Build the car description
    const carDescription = `${year} ${make} ${model}${trim ? ` ${trim}` : ''}`
    
    // Create prompt for Groq
    const prompt = `You are a car specifications expert. Provide detailed technical specifications for a ${carDescription}.

Return ONLY a valid JSON object with these fields (use null for unknown values):
{
  "engine": "engine size and configuration (e.g., '2.0L 4-cyl Turbo')",
  "horsepower": number (hp),
  "torque": number (lb-ft),
  "transmission": "transmission type",
  "drivetrain": "drivetrain type (FWD/RWD/AWD)",
  "fuelType": "fuel type",
  "mpgCity": number,
  "mpgHighway": number,
  "mpgCombined": number,
  "fuelCapacity": number (gallons),
  "length": number (mm),
  "width": number (mm),
  "height": number (mm),
  "wheelbase": number (mm),
  "curbWeight": number (lbs),
  "zeroToSixty": number (seconds),
  "topSpeed": number (mph),
  "bodyType": "body type"
}

Provide accurate, real-world specifications. If you're unsure about a value, use null.`

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
            content: 'You are a car specifications expert. Always return valid JSON only, no other text.'
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
    let aiSpecs: Partial<CarSpecs>
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      aiSpecs = JSON.parse(cleanContent)
    } catch (parseError) {
      console.error('Failed to parse AI response:', content)
      throw new Error('Invalid JSON from AI')
    }
    
    // Build final specs object with metadata
    const specs: CarSpecs = {
      make,
      model,
      year,
      trim,
      ...aiSpecs,
      dataSource: 'ai-generated',
      sourceApi: 'groq',
    }
    
    return NextResponse.json(specs, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('Error generating AI specs:', error)
    return NextResponse.json(
      { error: 'Failed to generate specifications' },
      { status: 500 }
    )
  }
}
