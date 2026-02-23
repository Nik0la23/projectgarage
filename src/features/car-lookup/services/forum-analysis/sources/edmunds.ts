// Edmunds consumer reviews scraper (OPTIONAL - use with caution)
// This scraper is fragile and may break if Edmunds changes their HTML structure
// CRITICAL: Respects rate limits and includes anti-detection measures

import * as cheerio from 'cheerio'
import { randomDelay, getHumanLikeHeaders } from '../rate-limiter'
import PQueue from 'p-queue'
// Edmunds is no longer used in the pipeline (replaced by NHTSA + Brave multi-query)
const edmundsQueue = new PQueue({ interval: 3000, intervalCap: 1 })
import type { ForumSource } from '@/features/car-lookup/types'

// Track if Edmunds has blocked us or rate limited us
let edmundsBlocked = false
let edmundsRateLimited = false

// Fetch Edmunds consumer reviews for a specific car
export async function fetchEdmundsReviews(
  make: string,
  model: string,
  year: number
): Promise<ForumSource[]> {
  // Feature flag check - disabled by default for safety
  if (process.env.ENABLE_EDMUNDS_SCRAPING !== 'true') {
    console.log('[Edmunds] Scraping disabled via feature flag (ENABLE_EDMUNDS_SCRAPING=false)')
    return []
  }

  // If we've been blocked or rate limited, skip
  if (edmundsBlocked) {
    console.warn('[Edmunds] Skipping - previously blocked (403)')
    return []
  }

  if (edmundsRateLimited) {
    console.warn('[Edmunds] Skipping - previously rate limited (429)')
    return []
  }

  console.log(`[Edmunds] Scraping reviews for ${year} ${make} ${model}`)

  try {
    // Use rate limiter queue (1 req per 3 seconds minimum)
    const reviews = await edmundsQueue.add(async () => {
      // Add random delay before request (simulate human behavior)
      await randomDelay()
      return await scrapeEdmundsReviews(make, model, year)
    })

    console.log(`[Edmunds] Successfully scraped ${reviews.length} reviews`)
    return reviews
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    if (errorMessage.includes('RATE_LIMIT')) {
      edmundsRateLimited = true
      console.error('[Edmunds] Rate limited (429) - disabling Edmunds for this session')
    } else if (errorMessage.includes('BLOCKED')) {
      edmundsBlocked = true
      console.error('[Edmunds] Blocked (403) - disabling Edmunds for this session')
    } else {
      console.warn('[Edmunds] Scraping failed:', errorMessage)
    }

    // Return empty array on failure (graceful degradation)
    return []
  }
}

// Perform the actual scraping
async function scrapeEdmundsReviews(
  make: string,
  model: string,
  year: number
): Promise<ForumSource[]> {
  // Normalize make and model for URL (lowercase, replace spaces with hyphens)
  const normalizedMake = make.toLowerCase().replace(/\s+/g, '-')
  const normalizedModel = model.toLowerCase().replace(/\s+/g, '-')

  // Build Edmunds URL
  const url = `https://www.edmunds.com/${normalizedMake}/${normalizedModel}/${year}/consumer-reviews/`

  console.log(`[Edmunds] Fetching: ${url}`)

  // Make request with human-like headers
  const response = await fetch(url, {
    headers: getHumanLikeHeaders('https://www.google.com/'), // Simulate coming from Google
  })

  // Handle different response status codes
  if (response.status === 429) {
    throw new Error('RATE_LIMIT: Edmunds returned 429 Too Many Requests')
  }

  if (response.status === 403) {
    throw new Error('BLOCKED: Edmunds returned 403 Forbidden')
  }

  if (response.status === 404) {
    console.log('[Edmunds] No reviews found (404)')
    return []
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  // Parse HTML with Cheerio
  const html = await response.text()
  const $ = cheerio.load(html)
  const reviews: ForumSource[] = []

  // Try multiple selectors (Edmunds may change their structure)
  const selectors = [
    '.review-item',
    '.consumer-review',
    '[data-testid="consumer-review"]',
    '.review-card',
  ]

  let reviewElements: ReturnType<typeof $> | null = null

  // Find which selector works
  for (const selector of selectors) {
    const elements = $(selector)
    if (elements.length > 0) {
      reviewElements = elements
      console.log(`[Edmunds] Found reviews using selector: ${selector}`)
      break
    }
  }

  if (!reviewElements || reviewElements.length === 0) {
    console.warn('[Edmunds] No reviews found with any known selector')
    return []
  }

  // Extract review data
  reviewElements.each((index, element) => {
    // Limit to 10 reviews max
    if (index >= 10) return false

    const $element = $(element)

    // Try multiple selectors for title
    const title = 
      $element.find('.review-title').text().trim() ||
      $element.find('h3').first().text().trim() ||
      $element.find('[data-testid="review-title"]').text().trim() ||
      'Edmunds Review'

    // Try multiple selectors for body
    const body = 
      $element.find('.review-text').text().trim() ||
      $element.find('.review-body').text().trim() ||
      $element.find('p').first().text().trim() ||
      ''

    // Try to find rating (usually 1-5 stars)
    const ratingText = 
      $element.find('.rating').text().trim() ||
      $element.find('[data-testid="rating"]').text().trim() ||
      ''

    const rating = parseFloat(ratingText) || undefined

    // Skip reviews with no body text
    if (!body || body.length < 50) {
      return
    }

    reviews.push({
      title,
      body,
      sourceType: 'edmunds',
      rating,
      url,
    })
  })

  return reviews
}

// Reset block flags (useful for testing or after long periods)
export function resetEdmundsFlags() {
  edmundsBlocked = false
  edmundsRateLimited = false
  console.log('[Edmunds] Reset block and rate limit flags')
}
