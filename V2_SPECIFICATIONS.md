# ProjectGarage V2 - Technical Specifications

**Version:** 2.0.0  
**Status:** ✅ Production Ready  
**Date:** February 3, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [What's New in V2](#whats-new-in-v2)
3. [Tech Stack](#tech-stack)
4. [Core Features](#core-features)
5. [Architecture](#architecture)
6. [Data Strategy](#data-strategy)
7. [API Endpoints](#api-endpoints)
8. [Key Implementation Details](#key-implementation-details)
9. [Performance & Caching](#performance--caching)
10. [Setup & Deployment](#setup--deployment)

---

## Overview

ProjectGarage is a Next.js-based car buying assistant that helps users find detailed technical specifications, reliability insights, and comparison data for any car. V2 adds multi-car comparison, AI-powered reliability analysis, and YouTube video integration.

**Live URL:** https://projectgarage.vercel.app

---

## What's New in V2

### 🆕 Major Features Added

1. **Car Comparison Tool** (`/compare`)
   - Compare 2-3 cars side-by-side
   - Automatic winner highlighting in specs table
   - AI-powered comparison insights (5 winner categories)
   - Individual forum analysis and videos per car
   - URL pre-population support

2. **Reliability Analysis** (Forum Aggregation + AI)
   - Reddit discussions from 6 car subreddits
   - Brave Search web articles
   - Groq AI-powered analysis
   - Reliability scoring (1-10)
   - Common problems with source citations
   - What owners love/hate
   - 7-day caching for performance

3. **YouTube Video Integration**
   - Top 6 review videos per car
   - Sorted by view count
   - Video metadata (views, likes, duration)
   - Direct links to YouTube
   - 24-hour caching

4. **Source Links Transparency**
   - Top 5 article/forum links displayed
   - Clickable external links
   - Source type badges (Reddit, Edmunds, Articles)
   - Upvote counts and star ratings

5. **Enhanced UX**
   - Reset search button (clears entire screen)
   - Compare with Others button on car details
   - Collapsible reliability panel
   - Empty states and loading animations

### 🔧 Improvements

- Better Reddit filtering (must contain make AND model)
- Fixed YouTube video display limit (max 6)
- Suspense boundary for comparison page
- Improved error handling across all features

---

## Tech Stack

### Core Framework
- **Next.js 15** - App Router only (no Pages Router)
- **React 19** - Server and Client Components
- **TypeScript** - Strict mode enabled
- **Node.js** - Runtime environment

### Styling & UI
- **Tailwind CSS v4** - Utility-first styling
- **shadcn/ui** - Pre-built components (Button, Card, Tabs, Badge, Input)
- **Lucide React** - Icon library
- **CVA** - Class variance authority for component variants

### APIs & Data Sources
- **NHTSA vPIC API** - Vehicle make/model validation (free, official)
- **CarQuery API** - Detailed specifications 1995-2022 (free, JSONP)
- **Groq AI** - AI-generated specs and analysis (Llama 3.3 70B)
- **Reddit RSS API** - Forum discussions (free, public)
- **Brave Search API** - Web articles (optional, requires API key)
- **YouTube Data API v3** - Video reviews (free tier, 10k units/day)

### State & Storage
- **React Hooks** - useState, useEffect, custom hooks
- **LocalStorage** - Search history persistence (client-side)
- **In-Memory Cache** - 7-day forum analysis cache

### Deployment
- **Vercel** - Hosting platform (free tier)
- **GitHub** - Version control and CI/CD

---

## Core Features

### 1. ✅ Smart Cascading Search

**Flow:** Make → Model → Year → Trim (Optional)

- **Step 1: Make** - Select from 75 legitimate car manufacturers
- **Step 2: Model** - Dynamic model loading for selected make
- **Step 3: Year** - Dynamic year filtering (only years when model existed)
- **Step 4: Trim** - Optional trim selection with detailed engine info

**New in V2:**
- Reset search button clears entire screen
- Compare with Others button after car selection

---

### 2. ✅ Technical Specifications Display

**Tabbed Interface:**
- **Overview** - Make, model, year, trim, engine, transmission
- **Engine** - Displacement, cylinders, horsepower, torque, configuration
- **Fuel** - Type, economy (city/highway/combined MPG), tank size
- **Dimensions** - Length, width, height, wheelbase, weight, cargo capacity

**Data Source Badges:**
- ✓ **Verified** - CarQuery/NHTSA data (1995-2022)
- ⚡ **AI-Generated** - Groq AI data (2023+, labeled clearly)

---

### 3. 🆕 Reliability Analysis Panel

**Data Sources:**
- **Reddit** - 20 posts from 6 car-related subreddits
- **Brave Search** - 10 web articles (optional, requires API key)
- **Edmunds** - Reviews (optional, disabled by default)

**AI Analysis Features:**
- **Reliability Score** - 1-10 rating with color-coded progress bar
- **Common Problems** - Issues with source citations
- **What Owners Love** - Positive aspects (green checkmarks)
- **What Owners Hate** - Negative aspects (red X marks)
- **Standout Features** - Cool tech and design highlights
- **Expert vs Owner** - Comparison of professional vs real owner opinions
- **Overall Verdict** - 2-3 sentence buying recommendation

**UI Features:**
- Collapsible panel (button → full analysis)
- Loading animation with progress message
- Source count badges
- 7-day caching (instant on repeat visits)

---

### 4. 🆕 YouTube Video Reviews

**Features:**
- Top 6 review videos per car
- Sorted by view count (most popular first)
- Video metadata display:
  - Duration badge
  - View count
  - Like count
  - Channel name
- Thumbnail with play button overlay on hover
- Direct links to YouTube (opens in new tab)
- Empty state when no videos found

**Smart Filtering:**
- Medium-length videos only (4-20 minutes)
- Excludes shorts and very long content
- English language preference
- Relevance-based sorting

**Performance:**
- 24-hour caching
- Lazy loading below the fold

---

### 5. 🆕 Source Links Transparency

**Location:** Individual Car Analysis section (comparison page) and Reliability Panel

**Features:**
- Top 5 most relevant articles/forum discussions
- Sorted by score (upvotes/ratings)
- Source type badges:
  - 🟠 Reddit (orange)
  - 🔵 Edmunds (blue)
  - 🟢 Articles (green)
- Clickable external links
- Metadata display (upvotes, star ratings)
- Hover effects

**Benefits:**
- Full transparency
- User verification
- Build trust
- Fact-checking capability

---

### 6. 🆕 Car Comparison Tool

**URL:** `/compare`

**Features:**

**Car Selection:**
- Select 2-3 cars using cascading dropdowns
- Car cards with remove button
- Duplicate validation
- Max 3 cars limit
- URL pre-population (`?car1=...`)

**Specs Comparison Table:**
- Side-by-side specifications
- 13 key metrics compared:
  - Engine, Horsepower, Torque
  - 0-60 mph, Top Speed
  - MPG City, MPG Highway
  - Fuel Tank, Weight, Cargo Volume
  - Transmission, Drivetrain, Fuel Type
- Automatic winner highlighting:
  - Green background + checkmark for best value
  - Logic varies (higher is better for HP, lower for 0-60)
- Data source badges per car
- Responsive horizontal scroll on mobile

**AI Comparison Analysis:**
- **Winner Cards** (5 categories):
  - 🏆 Overall Winner
  - ⚡ Best Performance
  - ⛽ Best Fuel Economy
  - 🛡️ Most Reliable
  - 💰 Best Value
- **Strengths** - 3 per car with green checkmarks
- **Weaknesses** - 2 per car with red X marks
- **Best For** - Use case recommendations
- **Summary** - Overall comparison text

**Individual Car Details:**
- Tabbed interface (one tab per car)
- Full reliability analysis per car
- Top 5 article/forum links per car
- YouTube video reviews per car
- Forum analysis data

**Navigation:**
- Compare Cars button in main header
- Compare with Others button on car details
- Start New Comparison button
- Back to Search link

---

## Architecture

### Project Structure

```
src/
├── app/                              # Next.js App Router
│   ├── api/                          # API routes
│   │   ├── makes/route.ts            # GET /api/makes
│   │   ├── models/route.ts           # GET /api/models
│   │   ├── years/route.ts            # GET /api/years
│   │   ├── trims/route.ts            # GET /api/trims
│   │   ├── car/
│   │   │   └── specs/route.ts        # GET /api/car/specs
│   │   ├── car-analysis/route.ts     # POST/GET /api/car-analysis (NEW)
│   │   ├── compare/route.ts          # POST /api/compare (NEW)
│   │   ├── youtube/
│   │   │   └── search/route.ts       # GET /api/youtube/search (NEW)
│   │   └── ai/
│   │       ├── generate-specs/route.ts
│   │       └── generate-trims/route.ts
│   ├── compare/                      # (NEW)
│   │   └── page.tsx                  # Comparison page route
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Home page (updated)
│   └── globals.css                   # Global styles
│
├── features/                         # Feature modules
│   ├── car-lookup/
│   │   ├── components/
│   │   │   ├── CarSearchForm.tsx     # Cascading dropdowns (updated)
│   │   │   ├── CarSpecsPanel.tsx     # Specs display
│   │   │   ├── CarReliabilityPanel.tsx  # Reliability UI (NEW)
│   │   │   └── CarYouTubePanel.tsx   # YouTube videos (NEW)
│   │   ├── services/
│   │   │   ├── nhtsa-api.ts          # NHTSA API integration
│   │   │   ├── carquery-api.ts       # CarQuery API integration
│   │   │   ├── ai-fallback.ts        # Groq AI specs
│   │   │   ├── youtube-api.ts        # YouTube integration (NEW)
│   │   │   └── forum-analysis/       # (NEW)
│   │   │       ├── forum-aggregator.ts
│   │   │       ├── groq-analyzer.ts
│   │   │       ├── cache-manager.ts
│   │   │       ├── rate-limiter.ts
│   │   │       └── sources/
│   │   │           ├── reddit.ts
│   │   │           ├── reddit-rss.ts
│   │   │           ├── brave.ts
│   │   │           └── edmunds.ts
│   │   ├── hooks/
│   │   │   ├── use-car-data.ts       # Data fetching hook
│   │   │   ├── use-car-analysis.ts   # Analysis hook (NEW)
│   │   │   ├── use-youtube-videos.ts # YouTube hook (NEW)
│   │   │   └── use-search-history.ts # LocalStorage hook
│   │   ├── types.ts                  # Feature types (extended)
│   │   └── index.ts                  # Public exports
│   │
│   └── car-comparison/               # (NEW)
│       ├── components/
│       │   ├── ComparisonPage.tsx    # Main comparison page
│       │   ├── CarSelector.tsx       # Car selection UI
│       │   ├── SpecsComparisonTable.tsx
│       │   ├── ComparisonAnalysis.tsx
│       │   └── IndividualCarAnalysis.tsx
│       ├── services/
│       │   └── comparison-analyzer.ts # AI comparison logic
│       ├── hooks/
│       │   └── use-comparison.ts     # Comparison state
│       ├── types.ts                  # Comparison types
│       └── index.ts                  # Public exports
│
├── components/                       # Shared UI (shadcn/ui)
│   └── ui/
│       ├── button.tsx
│       ├── card.tsx
│       ├── tabs.tsx
│       ├── badge.tsx
│       ├── input.tsx
│       └── skeleton.tsx
│
├── lib/
│   ├── utils.ts                      # Utility functions
│   └── storage.ts                    # LocalStorage utilities
│
└── types/
    ├── car.ts                        # Car-related types
    └── index.ts                      # Type exports
```

### Design Patterns

1. **Atomic UI + Feature Modules**
   - UI components in `components/ui` (atomic design)
   - Business logic in `features/` (domain-driven)
   - Feature isolation with public APIs

2. **Service Layer Reuse**
   - car-comparison imports services from car-lookup
   - No duplication of API logic
   - Shared types across features

3. **Parallel Data Fetching**
   - Promise.allSettled for resilience
   - Multiple cars fetched concurrently
   - Graceful degradation on failures

---

## Data Strategy

### 4-Tier Hybrid API (Extended)

```
┌─────────────────────────────────────────────────┐
│  TIER 1: NHTSA vPIC API (Always Current)       │
│  - Make/model validation                       │
│  - Vehicle identification                      │
│  - Free, official government API               │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  TIER 2: CarQuery API (Verified Data)          │
│  - Detailed specifications                     │
│  - Years: 1995-2022 (best coverage)            │
│  - Source: "verified"                          │
└─────────────────────────────────────────────────┘
                    ↓ (if no data)
┌─────────────────────────────────────────────────┐
│  TIER 3: Reddit + Brave (Forum Analysis)       │ (NEW)
│  - Reddit RSS feeds (20 posts)                 │
│  - Brave Search (10 articles)                  │
│  - Owner experiences and reviews               │
│  - 7-day caching                               │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  TIER 4: Groq AI (Intelligent Processing)      │
│  - AI-generated specifications (2023+)         │
│  - Reliability analysis & insights             │
│  - Comparison analysis (NEW)                   │
│  - Llama-3.3-70b-versatile                     │
│  - Source: "ai-generated"                      │
└─────────────────────────────────────────────────┘
```

---

## API Endpoints

### New in V2

#### 1. POST /api/compare

**Purpose:** Compare 2-3 cars with comprehensive analysis

**Request Body:**
```json
{
  "cars": [
    { "make": "Honda", "model": "Civic", "year": 2020 },
    { "make": "Toyota", "model": "Corolla", "year": 2020 }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "cars": [...],
    "specs": [CarSpecs, CarSpecs],
    "analyses": [CarAnalysisResult, CarAnalysisResult],
    "videos": [[YouTubeVideo[], YouTubeVideo[]]],
    "comparisonAnalysis": {
      "winner": {
        "overall": "2020 Honda Civic",
        "speed": "2020 Honda Civic",
        "fuelEfficiency": "2020 Toyota Corolla",
        "reliability": "2020 Toyota Corolla",
        "value": "2020 Toyota Corolla"
      },
      "strengths": {
        "2020 Honda Civic": ["Sporty handling", "Great technology", "Fun to drive"]
      },
      "weaknesses": {
        "2020 Honda Civic": ["Firm ride", "CVT transmission"]
      },
      "bestFor": {
        "2020 Honda Civic": "Best for drivers who want a fun commuter"
      },
      "summary": "Overall comparison text..."
    }
  }
}
```

**Validation:**
- 2-3 cars required
- Each car must have make, model, year

**Cache:** 1 hour

---

#### 2. POST/GET /api/car-analysis

**Purpose:** Analyze car reliability from forums and articles

**GET Request:**
```
GET /api/car-analysis?make=Honda&model=Civic&year=2020
```

**POST Request:**
```json
{
  "make": "Honda",
  "model": "Civic",
  "year": 2020
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reliabilityScore": 8,
    "commonProblems": [
      {
        "issue": "Transmission issues on high mileage",
        "sources": ["Reddit", "Web Articles"]
      }
    ],
    "whatOwnersLove": [
      "Excellent fuel economy",
      "Reliable engine",
      "Low maintenance costs"
    ],
    "whatOwnersHate": [
      "Stiff suspension",
      "CVT feels sluggish"
    ],
    "standoutFeatures": [
      "Honda Sensing safety suite",
      "Apple CarPlay integration",
      "Spacious interior"
    ],
    "expertVsOwner": "Experts praise handling; owners value reliability",
    "overallVerdict": "The 2020 Honda Civic is highly recommended...",
    "sourceCounts": {
      "reddit": 20,
      "edmunds": 0,
      "webArticles": 10,
      "total": 30
    },
    "rawSources": {
      "reddit": [
        {
          "title": "2020 Civic reliability?",
          "body": "Full post text...",
          "sourceType": "reddit",
          "score": 156,
          "url": "https://www.reddit.com/r/cars/..."
        }
      ],
      "webArticles": [...],
      "edmunds": [...]
    },
    "dataSource": "ai-generated",
    "analyzedAt": "2026-02-03T20:00:00.000Z"
  }
}
```

**Validation:**
- Year must be 1990 - current+1
- Make, model, year all required

**Cache:** 1 hour (stale-while-revalidate for 24h)

---

#### 3. GET /api/youtube/search

**Purpose:** Search YouTube for car review videos

**Request:**
```
GET /api/youtube/search?make=Honda&model=Civic&year=2020&maxResults=6
```

**Query Parameters:**
- `make` (required) - Car make
- `model` (required) - Car model
- `year` (required) - Car year
- `maxResults` (optional) - Number of videos (default: 6, max: 50)

**Response:**
```json
{
  "success": true,
  "data": {
    "videos": [
      {
        "videoId": "abc123",
        "title": "2020 Honda Civic Review - Best Compact Sedan?",
        "description": "In-depth review...",
        "thumbnail": "https://i.ytimg.com/vi/abc123/hqdefault.jpg",
        "channelTitle": "TheStraightPipes",
        "publishedAt": "2020-01-15T10:00:00Z",
        "viewCount": 1500000,
        "likeCount": 25000,
        "duration": "PT15M30S"
      }
    ],
    "totalResults": 4500
  }
}
```

**Cache:** 24 hours

**API Quota:** 101 units per search (100 for search, 1 for video details)

---

### V1 Endpoints (Unchanged)

All V1 endpoints remain functional:
- `GET /api/makes`
- `GET /api/models`
- `GET /api/years`
- `GET /api/trims`
- `GET /api/car/specs`
- `POST /api/ai/generate-specs`
- `POST /api/ai/generate-trims`

See V1_SPECIFICATIONS.md for details.

---

## Key Implementation Details

### 1. Comparison Hook State Management

**Location:** `src/features/car-comparison/hooks/use-comparison.ts`

```typescript
export function useComparison() {
  const [cars, setCars] = useState<ComparisonCar[]>([])
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Validation
  const addCar = (car) => {
    if (cars.length >= 3) {
      setError('Maximum 3 cars can be compared')
      return
    }
    // Check duplicates...
  }

  // Fetch comparison
  const fetchComparison = async () => {
    const response = await fetch('/api/compare', {
      method: 'POST',
      body: JSON.stringify({ cars }),
    })
    // Handle response...
  }

  return { cars, comparisonData, loading, error, addCar, removeCar, fetchComparison, reset }
}
```

**Features:**
- Max 3 cars validation
- Duplicate detection
- Auto-clear comparison data when cars change
- Reset functionality

---

### 2. Forum Analysis Architecture

**Orchestrator:** `forum-aggregator.ts`

**Flow:**
```typescript
export async function analyzeCarReliability(make, model, year) {
  // 1. Check 7-day cache
  const cached = getCachedAnalysis(make, model, year)
  if (cached) return cached

  // 2. Fetch from sources in parallel
  const [reddit, brave, edmunds] = await Promise.allSettled([
    fetchRedditDiscussionsRSS(),  // RSS fallback (works on Vercel)
    fetchBraveArticles(),          // Optional
    fetchEdmundsReviews(),         // Disabled by default
  ])

  // 3. Analyze with Groq AI
  const analysis = await analyzeCarReliability({
    make, model, year,
    redditPosts, edmundsReviews, webArticles
  })

  // 4. Save to cache
  saveCachedAnalysis(make, model, year, analysis)

  return analysis
}
```

**Key Features:**
- Cache-first architecture (instant on cache hit)
- Graceful degradation (works with 1+ sources)
- Rate limiting (1 req/sec per source)
- Reddit filtering (must contain make AND model)

---

### 3. AI Comparison Analyzer

**Location:** `src/features/car-comparison/services/comparison-analyzer.ts`

**Groq Configuration:**
```typescript
{
  model: 'llama-3.3-70b-versatile',
  temperature: 0.3,
  max_tokens: 2000,
  response_format: { type: 'json_object' }
}
```

**Prompt Structure:**
```typescript
const systemPrompt = "You are an automotive expert providing unbiased car comparisons..."

const userPrompt = `
Compare these cars:

Car 1: 2020 Honda Civic
Specs: { engine: "1.5L Turbo", horsepower: 174, ... }
Reliability: 8/10

Car 2: 2020 Toyota Corolla
Specs: { engine: "2.0L", horsepower: 169, ... }
Reliability: 9/10

Return JSON with winners, strengths, weaknesses, bestFor, summary
`
```

**Output:** Structured JSON with comparison insights

---

### 4. Winner Highlighting Logic

**Location:** `src/features/car-comparison/components/SpecsComparisonTable.tsx`

```typescript
const COMPARISON_CATEGORIES = [
  { name: 'Horsepower', key: 'horsepower', unit: 'hp', higherIsBetter: true },
  { name: '0-60 mph', key: 'zeroToSixty', unit: 's', higherIsBetter: false },
  // ...more categories
]

function findWinner(specs: CarSpecs[], category: ComparisonCategory): number {
  const values = specs.map(s => s[category.key] as number)
  const validValues = values.filter(v => v !== null)
  
  if (validValues.length < 2) return -1
  
  if (category.higherIsBetter) {
    return values.indexOf(Math.max(...validValues))
  } else {
    return values.indexOf(Math.min(...validValues))
  }
}
```

**Styling:**
- Winner cell: Green background (`bg-green-50`)
- Winner indicator: Green checkmark icon
- Non-winners: Default styling

---

### 5. Reddit Filtering Improvement

**Problem:** Reddit search returned irrelevant cars (e.g., A3 when searching for A6)

**Solution:** Post-processing filter requiring both make AND model:

```typescript
// Verify post actually mentions the specific car
const combinedText = `${title} ${selftext}`.toLowerCase()
const makePattern = make.toLowerCase()
const modelPattern = model.toLowerCase()

// Must contain both make AND model
if (!combinedText.includes(makePattern) || !combinedText.includes(modelPattern)) {
  continue  // Skip this post
}
```

**Applied to:**
- `reddit.ts` - JSON API
- `reddit-rss.ts` - RSS fallback

**Impact:** More accurate, relevant results

---

### 6. YouTube Video Limit Enforcement

**Problem:** Sometimes displayed 20+ videos instead of 6

**Solution:** UI-level enforcement in component:

```typescript
{videos.slice(0, 6).map((video) => (
  // Video card rendering
))}
```

**Why:** Defensive programming + cache might have different maxResults

---

### 7. Reset Search Functionality

**Implementation:**

1. `CarSearchForm` - Added `onReset?: () => void` prop
2. `page.tsx` - Added `handleReset()` that clears `selectedCar`
3. Callback chain: Button → Form → Parent → Clear all panels

**Result:** Entire screen clears to initial state

---

## Performance & Caching

### Caching Strategy (V2)

| Endpoint | Cache Duration | Reasoning |
|----------|----------------|-----------|
| `/api/makes` | 24 hours | Manufacturers rarely change |
| `/api/models` | 1 hour | Model lists fairly static |
| `/api/years` | 1 week | Production years don't change |
| `/api/trims` | 24 hours (verified), 1 hour (AI) | Historical vs AI data |
| `/api/car/specs` | 1 hour | Good balance |
| `/api/car-analysis` | 1 hour (stale 24h) | Forum data changes slowly |
| `/api/youtube/search` | 24 hours (stale 12h) | Video popularity stable |
| `/api/compare` | 1 hour (stale 24h) | Comparison data |

### In-Memory Cache

**Forum Analysis Cache:**
- Duration: 7 days
- Storage: Server memory
- Key format: `{make}-{model}-{year}`
- Invalidation: Time-based expiry
- Benefits: Instant response, reduced API calls

### Response Times

**Single Car Lookup:**
| Operation | First Load | Cached |
|-----------|-----------|--------|
| Makes | 400-600ms | <10ms |
| Models | 400-600ms | <10ms |
| Years | 2-6 seconds | <10ms |
| Trims | 400-600ms (verified), 500-3000ms (AI) | <10ms |
| Specs | 400-600ms (verified), 500-3000ms (AI) | <10ms |
| Forum Analysis | 6-13 seconds | 4ms |
| YouTube Videos | 1-2 seconds | <100ms |

**Comparison (2 cars):**
| Operation | Time |
|-----------|------|
| Total comparison | 10-20 seconds (first time) |
| Cached comparison | <1 second |
| Parallel specs fetch | 1-2 seconds |
| Parallel analyses | 12-26 seconds |
| Parallel videos | 2-4 seconds |
| AI comparison | 1-3 seconds |

---

## Core Features (Detailed)

### Comparison Feature Deep Dive

#### CarSelector Component

**Features:**
- Displays 0-3 selected cars as cards
- Each card shows: Year, Make, Model, Trim (optional)
- Remove button (X) on each card
- Add Car form with cascading dropdowns
- Uses `useCarData` hook from car-lookup
- Validation: No duplicates, max 3 cars

**Grid Layout:**
- Mobile: 1 column
- Desktop: 3 columns

---

#### SpecsComparisonTable Component

**Compared Specifications:**
1. Engine
2. Horsepower (higher is better)
3. Torque (higher is better)
4. 0-60 mph (lower is better)
5. Top Speed (higher is better)
6. Transmission
7. Drivetrain
8. Fuel Type
9. MPG City (higher is better)
10. MPG Highway (higher is better)
11. Fuel Tank (higher is better)
12. Weight (lower is better)
13. Cargo Volume (higher is better)

**Winner Logic:**
- Numeric values only
- Requires 2+ valid values
- Green highlight + checkmark for winner
- N/A for missing data

**Responsive:**
- Full table on desktop
- Horizontal scroll on mobile
- Minimum column width: 150px

---

#### ComparisonAnalysis Component

**Winner Cards (5):**
1. 🏆 Overall Winner
2. ⚡ Best Performance
3. ⛽ Best Fuel Economy
4. 🛡️ Most Reliable
5. 💰 Best Value

**Sections:**
- **Summary** - 2-3 sentence overview (blue card)
- **Strengths** - Grid of cards, 3 per car (green checkmarks)
- **Weaknesses** - Grid of cards, 2 per car (red X marks)
- **Best For** - Use case cards per car (gradient background)
- **Disclaimer** - AI-generated notice

**Layout:**
- Winner cards: 1 col mobile, 5 cols desktop
- Strengths/Weaknesses: 1 col mobile, 2 cols desktop
- Best For: 1 col mobile, 3 cols desktop

---

#### IndividualCarAnalysis Component

**Structure:**
- Tabs (one per car)
- Tab label: "Year Make Model"

**Per Tab Content:**

1. **Reliability & Owner Feedback**
   - Reliability score with badge
   - Common problems list
   - What owners love (green)
   - What owners hate (red)
   - Overall verdict

2. **Top Articles & Forum Discussions** (NEW)
   - Top 5 most relevant sources
   - Source type badges
   - Upvote/rating counts
   - External link icons
   - Clickable links

3. **Video Reviews**
   - 6 video thumbnails (2 col grid)
   - Play button overlay on hover
   - Video metadata (views, channel)
   - Links to YouTube

---

### Reliability Analysis Deep Dive

#### Data Collection

**Reddit (Primary Source):**
- 6 subreddits: r/cars, r/whatcarshouldIbuy, r/askcarsales, r/mechanicadvice, r/cartalk, r/UsedCars
- RSS feeds (works on Vercel, avoids IP blocking)
- 20 top posts by relevance
- Filtered: Must contain both make AND model
- Rate limited: 1 req/second

**Brave Search (Optional):**
- Web articles about reliability
- 10 articles per search
- Requires BRAVE_API_KEY
- Rate limited: 1 req/second

**Edmunds (Optional, Disabled):**
- Consumer reviews
- Feature-flagged: ENABLE_EDMUNDS_SCRAPING=false
- Conservative rate limiting
- Disabled by default for safety

#### AI Analysis

**Groq Configuration:**
```typescript
model: 'llama-3.3-70b-versatile'
temperature: 0.3  // Factual
max_tokens: 2000
response_format: { type: 'json_object' }
```

**Prompt Engineering:**
- System: "Expert automotive analyst"
- User: Formatted sources with instructions
- Output: Structured JSON with citations

**Processing:**
- Token estimation (warns if > 25k)
- Markdown cleanup
- JSON validation
- Error recovery

---

## Setup & Deployment

### Environment Variables

**Required:**
```bash
# Groq AI (Required for AI features)
GROQ_API_KEY=gsk_xxx...

# YouTube (Required for video reviews)
YOUTUBE_API_KEY=AIzaSyXXX...

# Next.js base URL (for server-side fetch)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Optional:**
```bash
# Brave Search (Improves forum analysis)
BRAVE_API_KEY=BSAxxxx...

# Edmunds scraping (Disabled by default, use with caution)
ENABLE_EDMUNDS_SCRAPING=false
```

### Getting API Keys

1. **Groq API Key**
   - Visit: https://console.groq.com/
   - Sign up/Login
   - Create new API key
   - Free tier available

2. **YouTube API Key**
   - Visit: https://console.cloud.google.com/
   - Create project
   - Enable YouTube Data API v3
   - Create credentials → API Key
   - Free tier: 10k units/day (~99 searches)

3. **Brave Search API Key** (Optional)
   - Visit: https://brave.com/search/api/
   - Sign up for API access
   - Get API key
   - Free tier available

### Local Development

```bash
# Clone repository
git clone <repository-url>
cd projectgarage

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Add your API keys to .env.local
# GROQ_API_KEY=...
# YOUTUBE_API_KEY=...

# Run development server
npm run dev

# Open http://localhost:3000
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Add environment variables:
   - `GROQ_API_KEY`
   - `YOUTUBE_API_KEY`
   - `BRAVE_API_KEY` (optional)
4. Deploy

**Auto-deployment:** Enabled on main branch

---

## TypeScript Types

### Comparison Types

**Location:** `src/features/car-comparison/types.ts`

```typescript
export interface ComparisonCar extends Car {
  // Reuses Car type from shared types
}

export interface ComparisonData {
  cars: ComparisonCar[]
  specs: (CarSpecs | null)[]
  analyses: (CarAnalysisResult | null)[]
  videos: YouTubeVideo[][]
  comparisonAnalysis: ComparisonAnalysisResult | null
}

export interface ComparisonAnalysisResult {
  winner: {
    overall: string
    speed: string
    fuelEfficiency: string
    reliability: string
    value: string
  }
  strengths: { [carName: string]: string[] }
  weaknesses: { [carName: string]: string[] }
  bestFor: { [carName: string]: string }
  summary: string
}

export interface ComparisonCategory {
  name: string
  key: keyof CarSpecs
  unit?: string
  higherIsBetter: boolean
}
```

### Forum Analysis Types

**Location:** `src/features/car-lookup/types.ts`

```typescript
export interface ForumSource {
  title: string
  body: string
  sourceType: 'reddit' | 'edmunds' | 'web-article'
  score?: number        // Reddit upvotes
  rating?: number       // Edmunds star rating (1-5)
  url: string
}

export interface CarAnalysisResult {
  commonProblems: Array<{ issue: string; sources: string[] }>
  whatOwnersLove: string[]
  whatOwnersHate: string[]
  standoutFeatures: string[]
  reliabilityScore: number  // 1-10
  expertVsOwner: string
  overallVerdict: string
  sourceCounts: {
    reddit: number
    edmunds: number
    webArticles: number
    total: number
  }
  rawSources?: {
    reddit: ForumSource[]
    edmunds: ForumSource[]
    webArticles: ForumSource[]
  }
  rawAnalysis?: string
  dataSource: 'ai-generated'
  analyzedAt: string
}
```

### YouTube Types

```typescript
export interface YouTubeVideo {
  videoId: string
  title: string
  description: string
  thumbnail: string
  channelTitle: string
  publishedAt: string
  viewCount?: number
  likeCount?: number
  duration?: string  // ISO 8601 format (PT15M30S)
}

export interface YouTubeSearchResult {
  videos: YouTubeVideo[]
  totalResults: number
}
```

---

## Testing

### Manual Testing Checklist

**Single Car Lookup (V1):**
- ✅ Select make → models load
- ✅ Select model → years load (filtered)
- ✅ Select year → trims load
- ✅ Select trim → specs update
- ✅ Reset button clears all fields and panels
- ✅ Reliability analysis button appears
- ✅ YouTube videos display below

**Reliability Analysis:**
- ✅ Click button → panel expands
- ✅ Loading animation shows
- ✅ Analysis results display (6-13 seconds first time)
- ✅ Second click is instant (cached)
- ✅ Source links are clickable
- ✅ Collapse button works

**Car Comparison:**
- ✅ Navigate to /compare
- ✅ Add 2 cars successfully
- ✅ Add 3rd car successfully
- ✅ Cannot add 4th car (shows error)
- ✅ Cannot add duplicate (shows error)
- ✅ Compare button appears with 2+ cars
- ✅ Specs table shows with green highlights
- ✅ AI comparison analysis displays
- ✅ Individual tabs show per-car data
- ✅ Top 5 source links appear per car
- ✅ YouTube videos display per car
- ✅ Start New Comparison resets
- ✅ URL pre-population works (?car1=...)

**Navigation:**
- ✅ Compare Cars button in header
- ✅ Compare with Others button when car selected
- ✅ Back to Search link on comparison page

**Responsive:**
- ✅ Mobile: All layouts stack properly
- ✅ Specs table: Horizontal scroll on mobile
- ✅ Video grid: 1 col mobile, 2 cols desktop
- ✅ Winner cards: 1 col mobile, 5 cols desktop

**Edge Cases:**
- ✅ Missing specs data → shows N/A
- ✅ Failed analysis → shows error with retry
- ✅ No YouTube videos → shows empty state
- ✅ API quota exceeded → graceful error messages

---

## Known Limitations

### V1 Limitations (Unchanged)

1. **NHTSA API Rate Limits** - Not documented, batch processing helps
2. **CarQuery Coverage** - Best for 1995-2022, sparse for 2023+
3. **AI Accuracy** - Estimates for new cars, users advised to verify
4. **JSONP Dependency** - CarQuery only supports JSONP

### V2 New Limitations

1. **Forum Analysis**
   - Reddit may block datacenter IPs (mitigated with RSS)
   - Limited to English discussions
   - Data quality depends on post availability
   - 7-day cache means new discussions appear delayed

2. **YouTube Integration**
   - Free tier: 99 searches per day (10k units quota)
   - Videos may not exist for obscure cars
   - Search accuracy depends on YouTube algorithm
   - Quota resets at midnight Pacific Time

3. **Comparison Feature**
   - Max 3 cars (performance/UX balance)
   - No persistent comparisons (localStorage in V3)
   - AI comparison quality depends on available data
   - Long loading time for 3 cars (20-30 seconds first time)

4. **Cache Staleness**
   - Forum analysis cached 7 days (may miss recent discussions)
   - YouTube cached 24 hours (new videos appear delayed)
   - No manual cache invalidation

---

## Dependencies Added in V2

```json
{
  "dependencies": {
    "cheerio": "^1.0.0",           // HTML parsing for Edmunds
    "p-queue": "^8.0.1",           // Rate limiting queues
    "date-fns": "^3.0.0"           // Cache expiry handling
  }
}
```

---

## API Quota Management

### YouTube Data API v3

**Free Tier:**
- 10,000 units per day
- Search: 100 units
- Video details: 1 unit
- Total per comparison: 101 units per search
- **Daily capacity:** ~99 car searches

**Monitoring:**
- Check: https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas
- Set alerts for 80% usage
- Quota resets: Midnight Pacific Time

**If exceeded:**
- Graceful error message shown to users
- Rest of app continues working
- Can request quota increase (free)

### Groq API

**Free Tier:**
- Generous limits (exact numbers not published)
- Fast inference (500-3000ms)
- Llama 3.3 70B model

**Usage per request:**
- Specs generation: ~500 tokens
- Reliability analysis: ~2000 tokens
- Comparison analysis: ~2000 tokens

### Reddit RSS

**Limits:**
- No authentication required
- Soft rate limits (respect with 1 req/sec)
- RSS more permissive than JSON API

### Brave Search

**Free Tier:**
- 2,000 queries per month
- 1 query per second rate limit
- Optional (not required for core functionality)

---

## Production Issues Fixed

### Issue 1: Reddit IP Blocking

**Problem:** Reddit blocked Vercel IPs (403 Blocked)

**Solution:** Switched to RSS feeds instead of JSON API

**Files Changed:**
- Created `reddit-rss.ts` with RSS parser
- Updated `forum-aggregator.ts` to use RSS

**Result:** ✅ Working on production

### Issue 2: TypeScript Build Error

**Problem:** Implicit any type in SpecsComparisonTable

**Solution:** Added explicit type annotation `number | null`

**Result:** ✅ Build passes

### Issue 3: Next.js Suspense Boundary

**Problem:** useSearchParams requires Suspense wrapper

**Solution:** Wrapped ComparisonPage in Suspense boundary

**Result:** ✅ Page renders correctly

---

## Future Roadmap (V3+)

**Planned features not in V2:**

### V3 - Enhanced Features
- [ ] Save favorite comparisons (localStorage)
- [ ] Share comparison via URL
- [ ] Print/export comparison as PDF
- [ ] Historical reliability trends
- [ ] More comparison metrics (safety ratings, warranty)
- [ ] Video transcript analysis (AI summarize reviews)
- [ ] Price information integration

### V4 - User Accounts
- [ ] Database migration (Supabase)
- [ ] User authentication
- [ ] Saved cars and comparisons
- [ ] Cross-device sync
- [ ] User preferences

### V5 - Monetization
- [ ] Dealership lead generation
- [ ] Minimal advertising
- [ ] Premium features
- [ ] API access for B2B

**See `src/ROADMAP.md` for complete feature roadmap.**

---

## Credits & Attribution

**Data Sources:**
- **NHTSA vPIC API** - National Highway Traffic Safety Administration
- **CarQuery API** - Community-maintained specifications database
- **Groq** - AI inference platform (Llama models by Meta)
- **Reddit** - User discussions via RSS feeds
- **Brave Search** - Web search API
- **YouTube Data API v3** - Video content by Google

**UI Components:**
- **shadcn/ui** - Component library
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library

**Built with:**
- **Next.js** by Vercel
- **React** by Meta
- **TypeScript** by Microsoft

---

## File Summary

### New Files in V2 (22 total)

**Feature: car-comparison**
1. `src/features/car-comparison/types.ts`
2. `src/features/car-comparison/hooks/use-comparison.ts`
3. `src/features/car-comparison/services/comparison-analyzer.ts`
4. `src/features/car-comparison/components/CarSelector.tsx`
5. `src/features/car-comparison/components/SpecsComparisonTable.tsx`
6. `src/features/car-comparison/components/ComparisonAnalysis.tsx`
7. `src/features/car-comparison/components/IndividualCarAnalysis.tsx`
8. `src/features/car-comparison/components/ComparisonPage.tsx`
9. `src/features/car-comparison/index.ts`

**Feature: car-lookup extensions**
10. `src/features/car-lookup/components/CarReliabilityPanel.tsx`
11. `src/features/car-lookup/components/CarYouTubePanel.tsx`
12. `src/features/car-lookup/hooks/use-car-analysis.ts`
13. `src/features/car-lookup/hooks/use-youtube-videos.ts`
14. `src/features/car-lookup/services/youtube-api.ts`
15. `src/features/car-lookup/services/forum-analysis/forum-aggregator.ts`
16. `src/features/car-lookup/services/forum-analysis/groq-analyzer.ts`
17. `src/features/car-lookup/services/forum-analysis/cache-manager.ts`
18. `src/features/car-lookup/services/forum-analysis/rate-limiter.ts`
19. `src/features/car-lookup/services/forum-analysis/sources/reddit.ts`
20. `src/features/car-lookup/services/forum-analysis/sources/reddit-rss.ts`
21. `src/features/car-lookup/services/forum-analysis/sources/brave.ts`
22. `src/features/car-lookup/services/forum-analysis/sources/edmunds.ts`

**Routes**
23. `src/app/compare/page.tsx`
24. `src/app/api/compare/route.ts`
25. `src/app/api/car-analysis/route.ts`
26. `src/app/api/youtube/search/route.ts`

### Modified Files

1. `src/app/page.tsx` - Added navigation and reset functionality
2. `src/features/car-lookup/components/CarSearchForm.tsx` - Added reset callback
3. `src/features/car-lookup/types.ts` - Extended with analysis and YouTube types

---

## Migration Guide (V1 → V2)

### Environment Variables

**Add to `.env.local`:**
```bash
GROQ_API_KEY=your_groq_key        # Required
YOUTUBE_API_KEY=your_youtube_key  # Required
BRAVE_API_KEY=your_brave_key      # Optional
```

### Dependencies

**Install new packages:**
```bash
npm install cheerio p-queue date-fns
```

### Database

- No database changes (still using localStorage + in-memory cache)
- V4 will migrate to Supabase

### Breaking Changes

- None! V2 is fully backward compatible
- All V1 features continue to work
- New features are additive

---

## License

[Your License Here]

---

## Contact & Support

- **GitHub:** https://github.com/Nik0la23/projectgarage
- **Live Demo:** https://projectgarage.vercel.app
- **Documentation:** See README.md

---

## Performance Benchmarks

### Page Load Times

| Page | First Load | Cached |
|------|-----------|--------|
| Home (/) | 1-2 seconds | <500ms |
| Comparison (/compare) | 1-2 seconds | <500ms |

### Feature Performance

| Feature | First Load | Cached |
|---------|-----------|--------|
| Car specs | 400-600ms | <10ms |
| Reliability analysis | 6-13 seconds | 4ms |
| YouTube videos | 1-2 seconds | <100ms |
| 2-car comparison | 10-20 seconds | <1 second |
| 3-car comparison | 20-30 seconds | <1 second |

### API Costs (Per Month)

**Assuming 1,000 monthly users:**
- NHTSA API: $0 (free)
- CarQuery API: $0 (free)
- Groq AI: $0-5 (free tier covers most usage)
- YouTube API: $0 (within 10k daily quota)
- Brave Search: $0 (optional, free tier)

**Total:** $0-5/month

---

## Success Metrics

### V2 Goals Achieved

✅ **Multi-car comparison** - 2-3 cars side-by-side
✅ **AI-powered insights** - Winner detection, strengths/weaknesses
✅ **Reliability data** - Real owner experiences from forums
✅ **Video integration** - Review videos from YouTube
✅ **Source transparency** - Links to original content
✅ **Performance** - Aggressive caching, parallel fetching
✅ **UX improvements** - Reset, navigation, empty states
✅ **Production ready** - Deployed and working on Vercel

### Code Quality

✅ TypeScript strict mode compliant
✅ No linter errors
✅ Production build passes
✅ Follows project conventions
✅ Comprehensive error handling
✅ Mobile responsive
✅ Accessibility considerations

---

**End of V2 Specifications Document**

*Last Updated: February 3, 2026*
