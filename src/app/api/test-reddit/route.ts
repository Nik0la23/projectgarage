// Diagnostic endpoint to test Reddit API from Vercel
import { NextResponse } from 'next/server'

export async function GET() {
  const results: any[] = []
  
  // Test 1: Basic fetch to Reddit
  try {
    const url = 'https://www.reddit.com/r/cars/search.json?q=Honda%20Civic&limit=2&restrict_sr=1'
    results.push({ test: 'Basic fetch', url })
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ProjectGarage/1.0; +https://projectgarage.vercel.app)',
        'Accept': 'application/json',
      },
      cache: 'no-store',
    })
    
    results.push({
      test: 'Response received',
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    })
    
    if (response.ok) {
      const data = await response.json()
      results.push({
        test: 'JSON parsed',
        hasData: !!data,
        hasChildren: !!data?.data?.children,
        childrenLength: data?.data?.children?.length || 0,
        sample: data?.data?.children?.[0] ? {
          title: data.data.children[0].data.title,
          score: data.data.children[0].data.score
        } : null
      })
    } else {
      const text = await response.text()
      results.push({
        test: 'Error response',
        body: text.slice(0, 500)
      })
    }
  } catch (error) {
    results.push({
      test: 'Fetch error',
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : String(error)
    })
  }
  
  return NextResponse.json({ results }, { status: 200 })
}
