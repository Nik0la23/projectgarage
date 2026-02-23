// Rate limiting system for external API calls
// Prevents API abuse and simulates human-like behavior

import PQueue from 'p-queue'

// Reddit queue: 1 request per second
export const redditQueue = new PQueue({
  interval: 1000,
  intervalCap: 1,
})

// Brave Search queue: 1 request per second
export const braveQueue = new PQueue({
  interval: 1000,
  intervalCap: 1,
})

// Random human-like delay between 1-3 seconds
export function randomDelay(): Promise<void> {
  const baseDelay = 1000 // 1 second base
  const jitter = Math.random() * 2000 // 0-2 seconds random jitter
  const totalDelay = baseDelay + jitter
  
  return new Promise((resolve) => setTimeout(resolve, totalDelay))
}

// User agents for rotation (simulate different browsers)
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
]

// Get a random user agent
export function getRandomUserAgent(): string {
  const randomIndex = Math.floor(Math.random() * USER_AGENTS.length)
  return USER_AGENTS[randomIndex]!
}

// Common headers for web scraping that look human
export function getHumanLikeHeaders(referer?: string): Record<string, string> {
  return {
    'User-Agent': getRandomUserAgent(),
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    ...(referer && { 'Referer': referer }),
  }
}

// Log rate limiter stats (for debugging)
export function logQueueStats() {
  console.log('Rate Limiter Stats:', {
    reddit: { pending: redditQueue.pending, size: redditQueue.size },
    brave: { pending: braveQueue.pending, size: braveQueue.size },
  })
}
