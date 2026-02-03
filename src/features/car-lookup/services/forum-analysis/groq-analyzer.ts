// Groq AI analyzer for car reliability insights
// Analyzes aggregated forum/article data and provides structured insights

import type { ForumSource, CarAnalysisResult } from '@/features/car-lookup/types'

interface GroqResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

interface AnalysisInput {
  make: string
  model: string
  year: number
  redditPosts: ForumSource[]
  edmundsReviews: ForumSource[]
  webArticles: ForumSource[]
}

// Analyze car reliability using Groq AI
export async function analyzeCarReliability(
  input: AnalysisInput
): Promise<CarAnalysisResult> {
  const { make, model, year, redditPosts, edmundsReviews, webArticles } = input

  // Check if Groq API key is configured
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    throw new Error('GROQ_API_KEY not configured')
  }

  // Format sources for AI analysis
  const formattedSources = formatSourcesForAI(redditPosts, edmundsReviews, webArticles)

  // Check estimated token count (rough estimate: chars / 4)
  const estimatedTokens = formattedSources.length / 4
  if (estimatedTokens > 25000) {
    console.warn(`[Groq] Large input: ~${Math.round(estimatedTokens)} tokens (may be truncated)`)
  }

  // Build prompts
  const systemPrompt = `You are an expert automotive analyst specializing in car reliability, features, and owner satisfaction.

Your task is to analyze discussions from car owners and automotive experts to provide accurate, data-driven insights about both reliability AND what makes this car special.

Key principles:
- Always cite specific sources when mentioning problems or praise
- Distinguish between owner opinions and expert reviews
- Be specific about issues (not vague like "some reliability problems")
- Base reliability score on sentiment, frequency of issues, and severity
- Highlight standout features, technology, and design elements that make the car appealing
- Include both practical reliability aspects AND exciting features/technology
- If data is limited, acknowledge this in your verdict

Return ONLY valid JSON, no other text.`

  const userPrompt = `Analyze this ${year} ${make} ${model} based on the following sources:

${formattedSources}

Provide a comprehensive analysis covering BOTH reliability AND standout features in JSON format:

{
  "commonProblems": [
    {"issue": "specific problem description", "sources": ["Reddit", "Edmunds", "Web Articles"]}
  ],
  "reliabilityScore": 1-10 (integer, where 1=very unreliable, 10=very reliable),
  "whatOwnersLove": ["specific positive point 1", "specific positive point 2"],
  "whatOwnersHate": ["specific negative point 1", "specific negative point 2"],
  "standoutFeatures": ["cool feature/tech 1", "cool feature/tech 2", "cool feature/tech 3"],
  "expertVsOwner": "brief comparison of expert opinions vs owner experiences",
  "overallVerdict": "2-3 sentence summary of whether this car is worth buying and why"
}

IMPORTANT for standoutFeatures:
- Include technology features (infotainment, safety tech, driver aids)
- Include design highlights (interior quality, exterior styling)
- Include performance characteristics (handling, power, efficiency)
- Include comfort and convenience features (seats, space, amenities)
- Be specific (e.g., "Adaptive cruise control with lane centering" not just "good tech")

Be specific and actionable. If no significant problems found, say so.`

  console.log(`[Groq] Analyzing ${year} ${make} ${model}...`)

  try {
    // Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // Updated model (mixtral-8x7b-32768 decommissioned)
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3, // Lower temperature for more factual responses
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Groq] API error:', errorText)
      throw new Error(`Groq API failed: ${response.status}`)
    }

    const data: GroqResponse = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error('No content in Groq response')
    }

    // Parse the JSON response
    let analysisData: Partial<CarAnalysisResult>
    try {
      // Remove markdown code blocks if present
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      
      analysisData = JSON.parse(cleanContent)
    } catch (parseError) {
      console.error('[Groq] Failed to parse AI response:', content)
      throw new Error('Invalid JSON from AI')
    }

    // Build final result with metadata
    const result: CarAnalysisResult = {
      commonProblems: analysisData.commonProblems || [],
      whatOwnersLove: analysisData.whatOwnersLove || [],
      whatOwnersHate: analysisData.whatOwnersHate || [],
      standoutFeatures: analysisData.standoutFeatures || [],
      reliabilityScore: analysisData.reliabilityScore || 5,
      expertVsOwner: analysisData.expertVsOwner || 'No comparison available',
      overallVerdict: analysisData.overallVerdict || 'Insufficient data for verdict',
      sourceCounts: {
        reddit: redditPosts.length,
        edmunds: edmundsReviews.length,
        webArticles: webArticles.length,
        total: redditPosts.length + edmundsReviews.length + webArticles.length,
      },
      rawSources: {
        reddit: redditPosts,
        edmunds: edmundsReviews,
        webArticles: webArticles,
      },
      rawAnalysis: content, // Store for debugging
      dataSource: 'ai-generated',
      analyzedAt: new Date().toISOString(),
    }

    console.log(`[Groq] Analysis complete - Reliability Score: ${result.reliabilityScore}/10`)

    return result
  } catch (error) {
    console.error('[Groq] Analysis failed:', error instanceof Error ? error.message : 'Unknown error')
    throw error
  }
}

// Format sources into a readable format for AI
function formatSourcesForAI(
  redditPosts: ForumSource[],
  edmundsReviews: ForumSource[],
  webArticles: ForumSource[]
): string {
  const sections: string[] = []

  // Reddit section
  if (redditPosts.length > 0) {
    sections.push(`=== REDDIT DISCUSSIONS (${redditPosts.length} posts) ===\n`)
    
    redditPosts.forEach((post, index) => {
      sections.push(
        `[Reddit Post ${index + 1} - ${post.score || 0} upvotes]\n` +
        `Title: ${post.title}\n` +
        `Body: ${truncateText(post.body, 500)}\n` +
        `---\n`
      )
    })
  }

  // Edmunds section
  if (edmundsReviews.length > 0) {
    sections.push(`\n=== EDMUNDS REVIEWS (${edmundsReviews.length} reviews) ===\n`)
    
    edmundsReviews.forEach((review, index) => {
      sections.push(
        `[Edmunds Review ${index + 1}${review.rating ? ` - ${review.rating}/5 stars` : ''}]\n` +
        `Title: ${review.title}\n` +
        `Body: ${truncateText(review.body, 500)}\n` +
        `---\n`
      )
    })
  }

  // Web articles section
  if (webArticles.length > 0) {
    sections.push(`\n=== WEB ARTICLES (${webArticles.length} articles) ===\n`)
    
    webArticles.forEach((article, index) => {
      sections.push(
        `[Article ${index + 1}]\n` +
        `Title: ${article.title}\n` +
        `Snippet: ${truncateText(article.body, 300)}\n` +
        `Source: ${article.url}\n` +
        `---\n`
      )
    })
  }

  return sections.join('\n')
}

// Truncate text to a maximum length
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }
  return text.substring(0, maxLength) + '...'
}
