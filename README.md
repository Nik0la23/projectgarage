# ProjectGarage 🚗

> Your intelligent car buying assistant - Find detailed technical specifications for any car instantly.

## Overview

ProjectGarage is a Next.js 15 web application that helps users find comprehensive technical specifications for any car. Using a hybrid 3-tier API strategy, it provides accurate data from official sources and AI-generated specs for newer vehicles.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **Icons:** Lucide React
- **Deployment:** Vercel (free tier)

## Data Strategy: 3-Tier Hybrid API

```
┌───────────────────────────────────────┐
│  TIER 1: NHTSA vPIC API (Free)        │
│  - Validates make/model/year exists   │
│  - Always current (2025/2026 data)    │
└───────────────────────────────────────┘
        ↓
┌───────────────────────────────────────┐
│  TIER 2: CarQuery API (Free)          │
│  - Detailed specs (HP, MPG, etc.)     │
│  - Best for: 1995-2022 vehicles       │
└───────────────────────────────────────┘
        ↓ (if no specs found)
┌───────────────────────────────────────┐
│  TIER 3: Groq AI Fallback (Llama 3.3) │
│  - Generate specs for 2023+ cars      │
│  - Labeled as "AI-Generated"          │
└───────────────────────────────────────┘
```

## Project Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── years/
│   │   ├── makes/
│   │   ├── models/
│   │   ├── car/specs/
│   │   └── ai/generate-specs/
│   ├── layout.tsx
│   └── page.tsx
├── features/              # Feature modules
│   └── car-lookup/
│       ├── components/    # CarSearchForm, CarSpecsPanel
│       ├── hooks/         # useCarData, useSearchHistory
│       ├── services/      # API integrations
│       └── types.ts
├── shared/
│   └── ui/               # Atomic design components
├── components/           # shadcn/ui components
│   └── ui/
├── lib/                  # Utilities
│   ├── utils.ts
│   └── storage.ts        # localStorage helpers
└── types/               # Shared TypeScript types
    └── car.ts
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd projectgarage
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Set up environment variables:
```bash
cp .env.example .env.local
```

Add your Groq API key if you want AI-generated specs for 2023+ vehicles:
```
GROQ_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Documentation

📄 **[V1 Technical Specifications](./V1_SPECIFICATIONS.md)** - Complete V1 feature documentation, architecture, and implementation details

📋 **[Future Roadmap](./src/ROADMAP.md)** - Planned features for V2 and beyond

## Features (V1 - MVP)

✅ **Single Car Lookup**
- Cascading dropdowns (Make → Model → Year → Trim)
- **75 legitimate car manufacturers** (filtered from 12,000+ NHTSA entries)
- **Dynamic year filtering** - shows only years when model was available
- Real-time data fetching
- Auto-submit when all fields selected

✅ **Smart Filtering**
- Only shows actual car manufacturers
- Excludes motorcycles, trailers, custom shops
- See `CAR_MANUFACTURERS_FILTER.md` for details

✅ **Technical Specifications Display**
- Tabbed interface (Overview / Engine / Fuel / Dimensions)
- Verified data badge (CarQuery) or AI-generated (Groq)
- Comprehensive specs: engine, fuel, dimensions, performance

✅ **Search History**
- localStorage-based history
- Persistent across sessions
- Quick access to recent searches

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/years` | GET | Get available years (1995-current+1) |
| `/api/makes?year=2024` | GET | Get makes for a specific year |
| `/api/models?year=2024&make=bmw` | GET | Get models for make and year |
| `/api/car/specs?year=2024&make=bmw&model=m3` | GET | Get full specifications |
| `/api/ai/generate-specs` | POST | Generate AI specs (fallback) |

## Development

### Project Rules

This project follows strict architectural conventions defined in `.cursor/rules/`:

- **Hybrid Architecture:** Atomic UI + Feature-based business logic
- **Feature Isolation:** Each feature is self-contained
- **Server Components First:** Only use `'use client'` when necessary
- **TypeScript Strict:** No `any` types allowed
- **Naming Conventions:** kebab-case dirs, PascalCase components

See `.cursor/rules/cursor_rules/global.mdc` for complete guidelines.

### Adding a New Feature

1. Create feature directory: `src/features/feature-name/`
2. Add subdirectories: `components/`, `hooks/`, `services/`, `types.ts`
3. Create `index.ts` for public API exports
4. Follow naming conventions and import rules

## Deployment

This project is configured for Vercel deployment:

```bash
npm run build
```

Deploy to Vercel:
```bash
vercel
```

### Vercel Free Tier Limits
- 10s function execution time
- 1024MB memory
- 100GB bandwidth/month

## Roadmap

See [ROADMAP.md](./src/ROADMAP.md) for the complete product roadmap including:

- **V2:** AI Car Finder & Multi-car Comparison
- **V3:** AI Analysis & Worth Buying Score
- **V4:** User Accounts & Cloud Sync
- **V5+:** Monetization & Scale

## Contributing

This is a personal project, but suggestions and feedback are welcome!

## License

MIT

---

**Current Version:** V1 (MVP)  
**Last Updated:** February 2026
