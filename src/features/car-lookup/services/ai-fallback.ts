// Groq AI fallback for generating specs when APIs don't have data
// Used primarily for 2023+ vehicles or when CarQuery has no data

import type { CarSpecs, TrimOption } from '@/types'

export interface AISpecsRequest {
  make: string
  model: string
  year: number
  trim?: string
}

export interface AITrimsRequest {
  make: string
  model: string
  year: number
}

// Generate AI-powered specs using Groq API
export async function generateAISpecs(
  request: AISpecsRequest
): Promise<CarSpecs> {
  try {
    // Call our API route that handles Groq integration
    // Use absolute URL for server-side fetch
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/ai/generate-specs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })
    
    if (!response.ok) {
      throw new Error(`AI specs generation failed: ${response.status}`)
    }
    
    const specs: CarSpecs = await response.json()
    
    // Ensure metadata is set correctly
    return {
      ...specs,
      dataSource: 'ai-generated',
      sourceApi: 'groq',
    }
  } catch (error) {
    console.error('Error generating AI specs:', error)
    throw error
  }
}

// Fallback to basic specs if AI generation fails
export function getFallbackSpecs(request: AISpecsRequest): CarSpecs {
  return {
    make: request.make,
    model: request.model,
    year: request.year,
    trim: request.trim,
    dataSource: 'ai-generated',
    sourceApi: 'groq',
  }
}

// Generate AI-powered trim options using Groq API
export async function generateAITrims(
  request: AITrimsRequest
): Promise<TrimOption[]> {
  try {
    // Call our API route that handles Groq integration
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/ai/generate-trims`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })
    
    if (!response.ok) {
      throw new Error(`AI trims generation failed: ${response.status}`)
    }
    
    const trims: TrimOption[] = await response.json()
    
    // Ensure metadata is set correctly
    return trims.map(trim => ({
      ...trim,
      dataSource: 'ai-generated',
    }))
  } catch (error) {
    console.error('Error generating AI trims:', error)
    throw error
  }
}

// Check if we should use AI fallback
export function shouldUseAIFallback(year: number): boolean {
  // Use AI for cars from 2023 onwards (when CarQuery data becomes sparse)
  return year >= 2023
}
