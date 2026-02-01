# ProjectGarage V1 - Technical Specifications

**Version:** 1.0.0  
**Status:** ✅ Production Ready  
**Date:** February 1, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Core Features](#core-features)
4. [Architecture](#architecture)
5. [Data Strategy](#data-strategy)
6. [API Endpoints](#api-endpoints)
7. [Key Implementation Details](#key-implementation-details)
8. [Performance & Caching](#performance--caching)
9. [Setup & Deployment](#setup--deployment)

---

## Overview

ProjectGarage is a Next.js-based car buying assistant that helps users find detailed technical specifications for any car by selecting Make → Model → Year → Trim. The app uses a hybrid 3-tier API strategy combining verified data sources with AI-generated fallbacks.

**Live URL:** http://localhost:3000 (Development)

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

### APIs & Data Sources
- **NHTSA vPIC API** - Vehicle make/model validation (free, official)
- **CarQuery API** - Detailed specifications 1995-2022 (free, JSONP)
- **Groq AI** - AI-generated specs fallback (Llama 3.3 70B)

### State & Storage
- **React Hooks** - useState, useEffect for state management
- **LocalStorage** - Search history persistence (client-side)

### Deployment
- **Vercel** - Hosting platform (free tier)

---

## Core Features

### 1. ✅ Smart Cascading Search

**Flow:** Make → Model → Year → Trim (Optional)

- **Step 1: Make** - Select from 75 legitimate car manufacturers
  - Filtered from 12,000+ NHTSA entries
  - Excludes motorcycles, trailers, custom shops
  - Alphabetically sorted

- **Step 2: Model** - Dynamic model loading
  - Fetches all models for selected make
  - Uses current year for comprehensive list
  - Sorted alphabetically

- **Step 3: Year** - Dynamic year filtering (NEW)
  - Shows only years when model was available
  - Prevents invalid selections
  - Example: Tesla Model 3 shows 2017-2027 (not 1995-2027)

- **Step 4: Trim** - Optional trim selection
  - Detailed display: "ST-Line 2.0L 4-cyl (diesel, manual)"
  - Includes engine size, cylinders, fuel type, transmission
  - Supports AI-generated trims for new models

**Key Benefits:**
- No invalid make/model/year combinations
- Faster selection with filtered options
- Clear visual feedback and loading states

---

### 2. ✅ Car Manufacturer Filtering

Only displays **75 legitimate car manufacturers**, filtered using a whitelist approach:

**Included:**
- American: Ford, Chevrolet, Tesla, Rivian, Lucid, etc.
- European: BMW, Mercedes-Benz, Audi, Volkswagen, Volvo, etc.
- Asian: Toyota, Honda, Nissan, Hyundai, Kia, etc.
- Luxury/Exotic: Ferrari, Lamborghini, Aston Martin, McLaren, etc.
- Historic: Plymouth, Pontiac, Saab, Mercury, etc.

**Excluded:**
- Motorcycles (Harley-Davidson, Kawasaki)
- Commercial vehicles (Peterbilt, Kenworth)
- Trailers and RVs
- Aftermarket/Custom shops

**Implementation:** Whitelist Set in `src/features/car-lookup/services/nhtsa-api.ts`

---

### 3. ✅ Technical Specifications Display

**Tabbed Interface:**
- **Overview** - Make, model, year, trim, engine, transmission
- **Engine** - Displacement, cylinders, horsepower, torque, configuration
- **Fuel** - Type, economy (city/highway/combined MPG), tank size
- **Dimensions** - Length, width, height, wheelbase, weight, cargo capacity

**Data Source Badges:**
- ✅ **Verified** - CarQuery API data (1995-2022)
- ⚠️ **AI-Generated** - Groq AI data (2023+, labeled clearly)

**Features:**
- All tabs always clickable
- Shows "not available" if data missing
- Clean, modern UI
- Responsive layout

---

### 4. ✅ Trim Selection with Enhanced Display

**Format:** `[Trim Name] [Engine] ([Fuel], [Transmission])`

**Examples:**
```
✓ ST-Line Edition 2.0 EcoBlue (diesel, manual)
✓ Limited 3.5L 6-cyl V (petrol, automatic)
✓ Performance 0.0L 0-cyl Electric Motor (electric, single-speed automatic) [AI]
```

**Features:**
- Detailed engine information
- Fuel type and transmission type
- AI-generated trims labeled with [AI] suffix
- Warning message for AI-generated data

---

### 5. ✅ AI Fallback System

**When Activated:**
- Car year is 2023 or newer
- CarQuery API has no data
- Newer models not in historical databases

**Groq AI Configuration:**
- **Model:** Llama-3.3-70b-versatile
- **Temperature:** 0.3 (focused on factual accuracy)
- **Max Tokens:** 1024
- **Response Time:** 500-3000ms (first call), <10ms (cached)

**AI-Generated Content:**
1. **Car Specifications** - Full specs for 2023+ vehicles
2. **Trim Options** - Common trims with engine/transmission details

**User Communication:**
- Clear [AI] labels in dropdowns
- ⚠️ Warning message: "AI-generated trim options - verify specifications"
- Amber color for visual distinction
- Maintains transparency

---

### 6. ✅ Dynamic Year Filtering

**How It Works:**
- Queries NHTSA API for each year (1995 → current+1)
- Returns only years where the model exists
- Batch processing: 10 years at a time

**Examples:**
- Tesla Model 3: 11 years (2017-2027)
- BMW M3: 28 years (1995-2027, with gaps)
- Ford F-150: 33 years (1995-2027, continuous)

**Performance:**
- First load: 2-6 seconds
- Cached: <10ms
- Cache duration: 1 week

---

### 7. ✅ Search History (LocalStorage)

**Features:**
- Stores recent searches in browser
- Quick access to previous lookups
- Persists across sessions
- Client-side only (privacy-friendly)

---

## Architecture

### Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── makes/route.ts        # GET /api/makes
│   │   ├── models/route.ts       # GET /api/models?make=X&year=Y
│   │   ├── years/route.ts        # GET /api/years?make=X&model=Y
│   │   ├── trims/route.ts        # GET /api/trims?make=X&year=Y&model=Z
│   │   ├── car/specs/route.ts    # GET /api/car/specs?make=X&year=Y&model=Z&trim=W
│   │   └── ai/
│   │       ├── generate-specs/route.ts    # POST /api/ai/generate-specs
│   │       └── generate-trims/route.ts    # POST /api/ai/generate-trims
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
│
├── features/                     # Feature modules
│   └── car-lookup/
│       ├── components/
│       │   ├── CarSearchForm.tsx       # Cascading dropdowns
│       │   └── CarSpecsPanel.tsx       # Specs display
│       ├── services/
│       │   ├── nhtsa-api.ts            # NHTSA API integration
│       │   ├── carquery-api.ts         # CarQuery API integration
│       │   └── ai-fallback.ts          # Groq AI integration
│       ├── hooks/
│       │   ├── use-car-data.ts         # Data fetching hook
│       │   └── use-search-history.ts   # LocalStorage hook
│       ├── types.ts                     # Feature types
│       └── index.ts                     # Public exports
│
├── components/                   # Shared UI (shadcn/ui)
│   └── ui/
│       ├── button.tsx
│       ├── card.tsx
│       ├── tabs.tsx
│       ├── badge.tsx
│       └── input.tsx
│
├── lib/
│   ├── utils.ts                  # Utility functions
│   └── storage.ts                # LocalStorage utilities
│
└── types/
    ├── car.ts                    # Car-related types
    └── index.ts                  # Type exports
```

### Design Patterns

1. **Atomic UI + Feature Modules**
   - UI components in `shared/ui` (atomic design)
   - Business logic in `features/` (domain-driven)

2. **Server Components by Default**
   - Only use 'use client' when necessary
   - API routes for data fetching
   - Client components for interactivity

3. **Type Safety**
   - Strict TypeScript mode
   - Shared types in `src/types/`
   - No `any` types

---

## Data Strategy

### 3-Tier Hybrid API

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
│  - Free, JSONP-based API                       │
│  - Source: "verified"                          │
└─────────────────────────────────────────────────┘
                    ↓ (if no data)
┌─────────────────────────────────────────────────┐
│  TIER 3: Groq AI (Intelligent Fallback)        │
│  - AI-generated specifications                 │
│  - New cars (2023+)                            │
│  - Llama-3.3-70b-versatile                     │
│  - Source: "ai-generated"                      │
│  - Clearly labeled for transparency            │
└─────────────────────────────────────────────────┘
```

### Data Flow Example

**Scenario 1: 2020 BMW M3 (Verified)**
```
1. User selects: BMW → M3 → 2020 → Coupe
2. NHTSA validates: ✓ BMW M3 exists in 2020
3. CarQuery provides: ✓ Full specs available
4. Result: Verified data displayed
```

**Scenario 2: 2024 Tesla Model 3 (AI)**
```
1. User selects: Tesla → Model 3 → 2024 → Long Range
2. NHTSA validates: ✓ Tesla Model 3 exists in 2024
3. CarQuery provides: ✗ No data (year too new)
4. Groq AI generates: ✓ Realistic specs
5. Result: AI-generated data with [AI] labels
```

---

## API Endpoints

### 1. GET /api/makes

**Purpose:** Fetch all available car manufacturers

**Response:**
```json
[
  { "makeId": 440, "makeName": "BMW" },
  { "makeId": 441, "makeName": "FORD" }
]
```

**Cache:** 24 hours

---

### 2. GET /api/models

**Params:** `?make=BMW&year=2025`

**Purpose:** Fetch models for a make and year

**Response:**
```json
[
  { "modelId": 1234, "modelName": "M3" },
  { "modelId": 1235, "modelName": "X5" }
]
```

**Cache:** 1 hour

---

### 3. GET /api/years

**Params:** `?make=BMW&model=M3`

**Purpose:** Fetch available years for a make and model

**Response:**
```json
[2027, 2026, 2025, 2024, 2023, 2022, 2021, 2018, 2017, 2016]
```

**Cache:** 1 week (years don't change often)

---

### 4. GET /api/trims

**Params:** `?make=BMW&year=2020&model=M3`

**Purpose:** Fetch available trims for a make, year, and model

**Response:**
```json
[
  {
    "trimId": "50805",
    "trimName": "Convertible",
    "displayName": "Convertible 4.0L 8-cyl (petrol, manual)",
    "dataSource": "verified"
  }
]
```

**Cache:** 24 hours (verified), 1 hour (AI)

---

### 5. GET /api/car/specs

**Params:** `?make=BMW&year=2020&model=M3&trim=Convertible`

**Purpose:** Fetch full car specifications

**Response:**
```json
{
  "make": "BMW",
  "model": "M3",
  "year": 2020,
  "trim": "Convertible",
  "engine": {
    "displacement": "4.0L",
    "cylinders": 8,
    "horsepower": 414,
    "configuration": "V8"
  },
  "fuel": {
    "type": "Petrol",
    "cityMPG": 14,
    "highwayMPG": 20
  },
  "dataSource": "verified",
  "sourceApi": "carquery"
}
```

**Cache:** 1 hour

---

### 6. POST /api/ai/generate-specs

**Purpose:** Generate AI specifications for new/missing cars

**Body:**
```json
{
  "make": "Tesla",
  "model": "Model 3",
  "year": 2024,
  "trim": "Long Range"
}
```

**Response:** Same as `/api/car/specs` but with `dataSource: "ai-generated"`

---

### 7. POST /api/ai/generate-trims

**Purpose:** Generate AI trim options for new/missing models

**Body:**
```json
{
  "make": "Tesla",
  "model": "Model 3",
  "year": 2024
}
```

**Response:**
```json
[
  {
    "trimId": "ai-0",
    "trimName": "Rear-Wheel Drive",
    "displayName": "Rear-Wheel Drive 0.0L 0-cyl Electric Motor (electric, single-speed automatic)",
    "dataSource": "ai-generated"
  }
]
```

---

## Key Implementation Details

### 1. Car Manufacturers Whitelist

**Location:** `src/features/car-lookup/services/nhtsa-api.ts`

```typescript
const CAR_MANUFACTURERS = new Set([
  'FORD', 'CHEVROLET', 'BMW', 'MERCEDES-BENZ',
  'TOYOTA', 'HONDA', 'TESLA', 'RIVIAN', // ...75 total
])

function isCarManufacturer(makeName: string): boolean {
  return CAR_MANUFACTURERS.has(makeName.toUpperCase().trim())
}
```

**Approach:** Whitelist (not blacklist) for reliability

---

### 2. Dynamic Year Fetching

**Location:** `src/features/car-lookup/services/nhtsa-api.ts`

```typescript
export async function fetchYearsForMakeModel(
  make: string,
  model: string
): Promise<number[]> {
  // Check each year from 1995 to current+1
  // Return only years where model exists
  // Batch processing: 10 years at a time
}
```

**Performance:** 2-6 seconds first load, <10ms cached

---

### 3. AI Prompt Engineering

**Specs Generation:**
```
You are a car specifications expert.
Provide detailed technical specifications for a {year} {make} {model}.

Return ONLY valid JSON with:
- engine (displacement, cylinders, horsepower, torque)
- fuel (type, cityMPG, highwayMPG)
- dimensions (length, width, height, weight)

Be realistic and base on manufacturer patterns.
```

**Trims Generation:**
```
List common trim levels for a {year} {make} {model}.

For each trim provide:
- Trim name, Engine size/type, Fuel type, Transmission

Return as JSON array. Be realistic. Include 2-5 trims maximum.
```

---

### 4. CarQuery JSONP Integration

**Location:** `src/features/car-lookup/services/carquery-api.ts`

```typescript
// CarQuery only supports JSONP, not REST
const response = await fetch(
  `https://www.carqueryapi.com/api/0.3/?callback=?&cmd=getTrims&make=${make}&model=${model}&year=${year}`
)

const text = await response.text()
const jsonText = text.replace(/^.*?\(/, '').replace(/\);?\s*$/, '')
const data = JSON.parse(jsonText)
```

**Challenge:** JSONP handling in modern fetch API  
**Solution:** Manual parsing of callback wrapper

---

### 5. React Hook Data Flow

**Location:** `src/features/car-lookup/hooks/use-car-data.ts`

```typescript
export function useCarData({ make, year, model, trim }) {
  // State for all data
  const [makes, setMakes] = useState([])
  const [models, setModels] = useState([])
  const [years, setYears] = useState([])
  const [trims, setTrims] = useState([])
  const [specs, setSpecs] = useState(null)
  
  // Fetch makes once on mount
  useEffect(() => { /* fetch makes */ }, [])
  
  // Fetch models when make changes
  useEffect(() => { /* fetch models */ }, [make])
  
  // Fetch years when make and model change
  useEffect(() => { /* fetch years */ }, [make, model])
  
  // Fetch trims when make, model, and year change
  useEffect(() => { /* fetch trims */ }, [make, model, year])
  
  // Fetch specs when make, model, year selected (trim optional)
  useEffect(() => { /* fetch specs */ }, [make, model, year, trim])
  
  return { makes, models, years, trims, specs, loading, error }
}
```

**Pattern:** Cascading data fetching with dependency management

---

## Performance & Caching

### Caching Strategy

| Endpoint | Cache Duration | Reasoning |
|----------|----------------|-----------|
| `/api/makes` | 24 hours | Manufacturers rarely change |
| `/api/models` | 1 hour | Model lists fairly static |
| `/api/years` | 1 week | Production years don't change |
| `/api/trims` (verified) | 24 hours | Historical data is stable |
| `/api/trims` (AI) | 1 hour | AI may improve over time |
| `/api/car/specs` (verified) | 1 hour | Good balance |
| `/api/car/specs` (AI) | 1 hour | AI may improve |

### Response Times

**First Load (Uncached):**
- Makes: 400-600ms
- Models: 400-600ms
- Years: 2-6 seconds (batch processing)
- Trims: 400-600ms (verified), 500-3000ms (AI)
- Specs: 400-600ms (verified), 500-3000ms (AI)

**Subsequent Loads (Cached):**
- All endpoints: <10ms

### Optimization Techniques

1. **Aggressive HTTP Caching**
   - `Cache-Control` headers on all responses
   - `stale-while-revalidate` for smooth UX

2. **Batch Processing**
   - Years API processes 10 years at a time
   - Prevents API rate limiting

3. **Smart State Management**
   - Reset dependent states on parent change
   - Prevent unnecessary API calls

4. **Loading Indicators**
   - Skeleton states during fetch
   - Clear "Loading..." messages

---

## Setup & Deployment

### Local Development

**Prerequisites:**
- Node.js 18+ and npm
- Git

**Installation:**
```bash
# Clone the repository
git clone <repository-url>
cd projectgarage

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Add Groq API key to .env.local
# GROQ_API_KEY=your_key_here

# Run development server
npm run dev

# Open http://localhost:3000
```

### Environment Variables

**Required:**
```bash
GROQ_API_KEY=gsk_xxx...  # Get from https://console.groq.com
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # For server-side fetch
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
   - `NEXT_PUBLIC_BASE_URL` (auto-set by Vercel)
4. Deploy

**Vercel Config:** Automatic (uses `next.config.ts`)

---

## File Naming Conventions

- **Directories:** `kebab-case`
- **Components:** `PascalCase.tsx`
- **Hooks:** `use-camel-case.ts`
- **Types:** `PascalCaseSuffix` (e.g., `ButtonProps`, `CarSpecs`)
- **API Routes:** `route.ts` (Next.js convention)

---

## TypeScript Types

### Core Types

**Location:** `src/types/car.ts`

```typescript
// Main car spec interface
export interface CarSpecs {
  make: string
  model: string
  year: number
  trim?: string
  engine?: {
    displacement?: string
    cylinders?: number
    horsepower?: number
    torque?: number
    configuration?: string
  }
  fuel?: {
    type?: string
    cityMPG?: number
    highwayMPG?: number
    combinedMPG?: number
    tankSize?: number
  }
  dimensions?: {
    length?: number
    width?: number
    height?: number
    wheelbase?: number
    weight?: number
    cargoCapacity?: number
  }
  dataSource: 'verified' | 'ai-generated'
  sourceApi: 'nhtsa' | 'carquery' | 'groq'
}

// Dropdown option interfaces
export interface MakeOption {
  makeId: number
  makeName: string
}

export interface ModelOption {
  modelId: number
  modelName: string
}

export interface TrimOption {
  trimId?: string
  trimName: string
  displayName?: string
  dataSource?: 'verified' | 'ai-generated'
  specs?: Partial<CarSpecs>
}
```

---

## Testing

### Manual Testing Checklist

**Search Flow:**
- ✅ Select make → models load
- ✅ Select model → years load (filtered)
- ✅ Select year → trims load
- ✅ Select trim → specs update
- ✅ Reset button clears all fields

**Data Sources:**
- ✅ 1995-2022 cars show verified data
- ✅ 2023+ cars show AI-generated data
- ✅ AI data clearly labeled with [AI]
- ✅ Warning message for AI data

**Edge Cases:**
- ✅ No trims available → message shown
- ✅ No years available → message shown
- ✅ API errors → error message shown
- ✅ Loading states → spinners visible

**Caching:**
- ✅ Second load much faster
- ✅ Changes to upstream data reflected after cache expiry

---

## Known Limitations

1. **NHTSA API Rate Limits**
   - Not officially documented
   - Batch processing helps avoid issues

2. **CarQuery Coverage**
   - Best for 1995-2022
   - Sparse data for 2023+
   - Some models missing

3. **AI Accuracy**
   - May not include all trim options
   - Specs are estimates, not guarantees
   - Users advised to verify

4. **Dynamic Years Performance**
   - First load: 2-6 seconds
   - Mitigated by aggressive caching

5. **JSONP Dependency**
   - CarQuery API only supports JSONP
   - Requires manual parsing

---

## Future Roadmap (V2+)

**Planned features not in V1:**

- [ ] Compare multiple cars side-by-side
- [ ] Save favorite cars
- [ ] Share car specifications via URL
- [ ] Print/PDF export
- [ ] Car images integration
- [ ] User reviews and ratings
- [ ] Pricing information (MSRP, used values)
- [ ] VIN decoder integration
- [ ] Advanced search filters
- [ ] Mobile app (React Native)

**See `src/ROADMAP.md` for complete feature roadmap.**

---

## Credits & Attribution

**Data Sources:**
- **NHTSA vPIC API** - National Highway Traffic Safety Administration
- **CarQuery API** - Community-maintained car specifications database
- **Groq** - AI inference platform (Llama models by Meta)

**UI Components:**
- **shadcn/ui** - Beautifully designed components
- **Tailwind CSS** - Utility-first CSS framework

**Built with:**
- **Next.js** by Vercel
- **React** by Meta
- **TypeScript** by Microsoft

---

## License

[Your License Here]

---

## Contact & Support

- **GitHub:** [Your GitHub]
- **Email:** [Your Email]
- **Documentation:** See README.md

---

**End of V1 Specifications Document**

*Last Updated: February 1, 2026*
