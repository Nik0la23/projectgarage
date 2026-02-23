// Groq AI analyzer for car reliability insights
// Analyzes aggregated data from Reddit, Brave web articles, and NHTSA official complaints

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
  webArticles: ForumSource[]  // Brave results: authority sites + Reddit + general web
  nhtsaComplaints: ForumSource[]
  nhtsaSummary: string  // Pre-built statistical summary from NHTSA source
}

// Analyze car reliability using Groq AI
export async function analyzeCarReliability(
  input: AnalysisInput
): Promise<CarAnalysisResult> {
  const { make, model, year, webArticles, nhtsaComplaints, nhtsaSummary } = input

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new Error('GROQ_API_KEY not configured')
  }

  // Format all sources into a single prompt block
  const formattedSources = formatSourcesForAI(webArticles, nhtsaComplaints, nhtsaSummary)

  // Check estimated token count (rough estimate: chars / 4)
  const estimatedTokens = formattedSources.length / 4
  if (estimatedTokens > 25000) {
    console.warn(`[Groq] Large input: ~${Math.round(estimatedTokens)} tokens (may be truncated)`)
  }

  const systemPrompt = `You are an expert automotive analyst. Your job is to provide accurate, well-structured reliability and ownership assessments based on real data sources.

CRITICAL RULES FOR RELIABILITY ASSESSMENT:
1. Scale matters — a vehicle model may have hundreds of thousands of units in service. 5 complaints is not a widespread problem; 500 complaints might be.
2. Only list something as a "commonProblems" entry if it appears in at LEAST 2 independent sources OR shows up in 3+ NHTSA complaints for the same component.
3. A single Reddit post or one NHTSA complaint is an isolated incident, not a fleet-wide issue. Do NOT report it as a common problem.
4. Official NHTSA recalls are mandatory safety campaigns — always report these regardless of volume; they are the highest-severity signal.
5. Assign each problem a frequency label based on evidence weight:
   - "isolated reports": mentioned by 1-2 people, no pattern across sources
   - "recurring pattern": mentioned independently by 3-5 sources or owners
   - "widespread concern": appears consistently across multiple source types (Reddit + NHTSA + Web) or has a high NHTSA complaint count
6. The reliabilityScore (1-10) must reflect the overall ownership experience at scale — not just whether any problems exist. A car with minor issues reported by very few owners out of many thousands should still score 7-9.
7. If the data shows mostly positive owner experiences with few complaints, say so clearly. Do not manufacture problems.

Return ONLY valid JSON, no other text.`

  const userPrompt = `Analyze the ${year} ${make} ${model} based on the following data sources:

${formattedSources}

Return a JSON object with this exact structure:

{
  "commonProblems": [
    {
      "issue": "Clear, specific description of the problem (e.g., 'Engine oil consumption above 1 quart per 1000 miles')",
      "frequency": "isolated reports | recurring pattern | widespread concern",
      "sources": ["NHTSA (X complaints)", "Reddit", "Web Articles"]
    }
  ],
  "reliabilityScore": <integer 1-10, where 1=extremely unreliable with major systemic issues, 10=exceptional reliability with virtually no reported problems>,
  "whatOwnersLove": [
    "Specific positive — e.g., 'Turbocharged 2.0L engine delivers strong 0-60 times around 6.5 seconds'"
  ],
  "whatOwnersHate": [
    "Specific negative — e.g., 'Infotainment system slow to respond and prone to freezing on cold starts'"
  ],
  "standoutFeatures": [
    "Specific feature — e.g., 'Virtual Cockpit digital instrument cluster with configurable 12-inch display'"
  ],
  "expertVsOwner": "1-2 sentences: how do professional reviewer opinions differ from day-to-day owner experience?",
  "overallVerdict": "2-3 sentences giving a balanced buying recommendation. Mention reliability in context of scale (e.g., 'complaints represent a small fraction of the fleet'). Be direct about whether this car is worth buying."
}

Rules for commonProblems:
- If no qualifying problems exist, return an empty array []
- Always include official recalls as entries with frequency "widespread concern" (recalls affect all units)
- Do NOT include speculative or vague problems

Rules for reliabilityScore:
- 9-10: Excellent. Very few complaints, no systemic issues, positive owner sentiment dominates
- 7-8: Good. Minor issues reported by a small percentage of owners, nothing structural
- 5-6: Average. Some recurring issues affecting a noticeable portion of owners
- 3-4: Below average. Multiple documented problems, significant owner frustration
- 1-2: Poor. Systemic, serious issues affecting a large portion of the fleet`

  console.log(`[Groq] Analyzing ${year} ${make} ${model}...`)

  try {
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
        temperature: 0.2,  // Very low — we want factual, consistent output
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

    let analysisData: Partial<CarAnalysisResult>
    try {
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      analysisData = JSON.parse(cleanContent)
    } catch (parseError) {
      console.error('[Groq] Failed to parse AI response:', content)
      throw new Error('Invalid JSON from AI')
    }

    const result: CarAnalysisResult = {
      commonProblems: analysisData.commonProblems || [],
      whatOwnersLove: analysisData.whatOwnersLove || [],
      whatOwnersHate: analysisData.whatOwnersHate || [],
      standoutFeatures: analysisData.standoutFeatures || [],
      reliabilityScore: analysisData.reliabilityScore || 5,
      expertVsOwner: analysisData.expertVsOwner || 'No comparison available',
      overallVerdict: analysisData.overallVerdict || 'Insufficient data for verdict',
      sourceCounts: {
        reddit: 0,
        edmunds: 0,
        webArticles: webArticles.length,
        nhtsaComplaints: nhtsaComplaints.length,
        total: webArticles.length + nhtsaComplaints.length,
      },
      rawSources: {
        reddit: [],
        edmunds: [],
        webArticles: webArticles,
        nhtsa: nhtsaComplaints,
      },
      rawAnalysis: content,
      dataSource: 'ai-generated',
      analyzedAt: new Date().toISOString(),
    }

    console.log(`[Groq] Analysis complete — Reliability Score: ${result.reliabilityScore}/10, Problems: ${result.commonProblems.length}`)

    return result
  } catch (error) {
    console.error('[Groq] Analysis failed:', error instanceof Error ? error.message : 'Unknown error')
    throw error
  }
}

// Format all sources into a readable block for the AI prompt
function formatSourcesForAI(
  webArticles: ForumSource[],
  nhtsaComplaints: ForumSource[],
  nhtsaSummary: string
): string {
  const sections: string[] = []

  // NHTSA statistical summary first — gives the AI the scale context before reading individual posts
  if (nhtsaSummary) {
    sections.push(nhtsaSummary)
  }

  // Individual NHTSA complaint entries
  if (nhtsaComplaints.length > 0) {
    sections.push(`--- Top NHTSA Complaints & Recalls ---\n`)
    nhtsaComplaints.forEach((item, index) => {
      sections.push(
        `[NHTSA Entry ${index + 1}]\n` +
        `Title: ${item.title}\n` +
        `Detail: ${truncateText(item.body, 400)}\n` +
        `---\n`
      )
    })
  }

  // Web articles — mix of authority reviews (Car and Driver, Motor Trend, KBB, etc.)
  // and the most relevant Reddit/forum posts as ranked by Brave Search
  if (webArticles.length > 0) {
    sections.push(`\n=== WEB SOURCES (${webArticles.length} results — reviews, owner forums, articles) ===\n`)
    webArticles.forEach((article, index) => {
      sections.push(
        `[Source ${index + 1}]\n` +
        `Title: ${article.title}\n` +
        `Snippet: ${truncateText(article.body, 400)}\n` +
        `URL: ${article.url}\n` +
        `---\n`
      )
    })
  }

  return sections.join('\n')
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
