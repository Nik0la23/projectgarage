# ProjectGarage - Product Roadmap

> **Project Goal:** Simplify car buying with instant technical data, AI-driven analysis, and smart recommendations.

> **Business Model:** Lead generation (dealership referrals) + minimal ads (future)

---

## Version Overview

| Version | Focus | Status | Target |
|---------|-------|--------|--------|
| V1 | Core Lookup & Foundation | 🚧 In Progress | MVP |
| V2 | AI Car Finder & Comparison | ⏳ Planned | - |
| V3 | AI Analysis & Insights | ⏳ Planned | - |
| V4 | User Accounts & Persistence | ⏳ Planned | - |
| V5+ | Monetization & Scale | 💭 Future | - |

---

## Data Strategy: Hybrid API Approach

### The Problem
- Free APIs have outdated data (CarQuery stops ~2020-2022)
- Paid APIs cost $100+/year
- Users want info on NEW cars (2024-2026)

### The Solution: 3-Tier Data Fallback

```
User searches for a car
        ↓
┌───────────────────────────────────────┐
│  TIER 1: NHTSA vPIC API (Free)        │
│  - Validates make/model/year exists   │
│  - VIN decoding                       │
│  - Safety recalls                     │
│  - Always current (2025/2026 data)    │
└───────────────────────────────────────┘
        ↓
┌───────────────────────────────────────┐
│  TIER 2: CarQuery API (Free)          │
│  - Detailed specs (HP, torque, MPG)   │
│  - Engine, transmission, dimensions   │
│  - Best for: 1995-2022 vehicles       │
└───────────────────────────────────────┘
        ↓ (if no specs found)
┌───────────────────────────────────────┐
│  TIER 3: Claude AI Fallback           │
│  - Generate specs from training data  │
│  - Labeled as "AI-Generated"          │
│  - Best for: 2023+ new vehicles       │
└───────────────────────────────────────┘
```

### Data Source Labels (Show to User)
- ✓ **Verified** — From official API (NHTSA/CarQuery)
- ⚡ **AI-Generated** — From Claude AI (may have minor inaccuracies)

### Future Upgrade Path
When monetizing → Replace AI-generated data with paid API (CarAPI.app $99/yr)

---

## API Reference

### NHTSA vPIC API
- **Cost:** Free, no API key required
- **Rate Limit:** Soft limit, be respectful
- **Coverage:** US vehicles 1981+, always current
- **Best For:** Make/model validation, VIN decode, recalls

```
# Get all makes
https://vpic.nhtsa.dot.gov/api/vehicles/GetAllMakes?format=json

# Get models for make + year
https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/bmw/modelyear/2025?format=json

# Decode VIN
https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/WBADT43483G023456?format=json
```

### CarQuery API
- **Cost:** Free, no API key required
- **Rate Limit:** 500 results per query
- **Coverage:** Global vehicles, ~1940s-2022
- **Best For:** Detailed specifications

```
# Get years range
https://www.carqueryapi.com/api/0.3/?callback=?&cmd=getYears

# Get makes for year
https://www.carqueryapi.com/api/0.3/?callback=?&cmd=getMakes&year=2020

# Get models
https://www.carqueryapi.com/api/0.3/?callback=?&cmd=getModels&make=bmw&year=2020

# Get full specs (trims)
https://www.carqueryapi.com/api/0.3/?callback=?&cmd=getTrims&make=bmw&model=M3&year=2020
```

### Claude AI (Anthropic API)
- **Cost:** Pay per token (needed for V2+ anyway)
- **Use For:** Specs fallback for 2023+ cars, AI analysis features
- **Note:** Label output as "AI-Generated"

---

## V1 - Core Lookup & Foundation *(MVP)*

**Goal:** Single car lookup with comprehensive technical data. Deploy to Vercel.

### Features

- [ ] **Single Car Lookup**
  - Search by make/model/year (dropdowns)
  - Display basic info (name, year, body type)
  - Display specs with source labels (Verified vs AI-Generated)

- [ ] **Technical Specifications Display**
  - Basic: Engine, HP, transmission, drivetrain
  - Fuel: MPG city/highway, fuel type, tank size
  - Dimensions: Length, width, height, weight
  - Performance: 0-60, top speed (if available)

- [ ] **UI Foundation**
  - Clean, responsive design (Tailwind + shadcn/ui)
  - Car search with cascading dropdowns (Year → Make → Model → Trim)
  - Specs panel with tabs (Overview / Engine / Dimensions)
  - Mobile-friendly layout
  - Loading skeletons, error states

- [ ] **Data Layer**
  - NHTSA API integration (validation, VIN)
  - CarQuery API integration (specs)
  - Claude AI fallback (new cars)
  - localStorage for search history
  - Recently viewed cars list

- [ ] **Infrastructure**
  - Next.js 15 App Router
  - TypeScript strict mode
  - Vercel deployment (free tier)
  - Environment variables configured

### Technical Checklist

- [ ] Project scaffolding with hybrid architecture
- [ ] Shared UI components (atoms/molecules/organisms)
- [ ] `car-lookup` feature module
  - [ ] `services/nhtsa-api.ts`
  - [ ] `services/carquery-api.ts`
  - [ ] `services/ai-fallback.ts`
  - [ ] `hooks/use-car-data.ts`
  - [ ] `components/CarSearchForm.tsx`
  - [ ] `components/CarSpecsPanel.tsx`
- [ ] API routes
  - [ ] `GET /api/makes?year=2025`
  - [ ] `GET /api/models?make=bmw&year=2025`
  - [ ] `GET /api/car/[make]/[model]/[year]`
- [ ] localStorage hook for history
- [ ] Loading & error states
- [ ] SEO metadata
- [ ] Vercel deployment

### V1 Scope Boundaries

**IN Scope:**
- Single car lookup (not comparison)
- Make/Model/Year search
- Technical specifications display
- Search history (localStorage)

**OUT of Scope (V2+):**
- Multi-car comparison
- AI car finder/recommendations
- YouTube videos
- Forum summaries
- User accounts

---

## V2 - AI Car Finder & Comparison

**Goal:** Help users who don't know what they want. Enable side-by-side comparison.

### Features

- [ ] **AI Car Finder**
  - User input form:
    - Budget/price range (slider)
    - Fuel type preference (gas/diesel/hybrid/electric)
    - Body type (sedan, SUV, truck, etc.)
    - Passenger capacity
    - Cargo needs
    - Fuel economy priority
    - Free-text field: "Describe your situation"
  - AI analysis of requirements (Claude API)
  - Return 3-5 car recommendations with reasoning
  - "Why this car?" explanation for each suggestion

- [ ] **Multi-Car Comparison**
  - Select 2-4 cars to compare
  - Side-by-side specs table
  - Highlight differences (better/worse indicators)
  - Save comparison to history

- [ ] **YouTube Integration**
  - Fetch relevant review videos for selected car
  - Display top 3-5 videos with thumbnails
  - YouTube Data API v3 integration

- [ ] **Forum/Article Summaries**
  - Aggregate content from car forums & review sites
  - AI-generated summary of common opinions
  - Sentiment analysis (positive/negative themes)
  - Sources: Reddit, car forums, review sites

### Technical Additions

- [ ] `car-finder` feature module
- [ ] `car-comparison` feature module
- [ ] Claude API integration (Anthropic)
- [ ] YouTube Data API integration
- [ ] Web scraping/aggregation service (or API)
- [ ] Comparison state management
- [ ] Enhanced localStorage (saved comparisons)

### AI Prompt Engineering

```
Example user input:
"I have 3 kids, a big dog, and $400/month budget for gas. 
I need something reliable for a 45-minute highway commute."

AI should analyze:
- Family size → 3-row SUV or minivan
- Dog → cargo space, easy cleaning interior
- Gas budget → calculate MPG requirements
- Commute → comfort, reliability, highway efficiency
```

---

## V3 - AI Analysis & Insights

**Goal:** Provide actionable buying intelligence with AI-powered scoring.

### Features

- [ ] **Worth Buying Score (0-100)**
  - Factors:
    - Price vs. market average
    - Reliability ratings (historical data)
    - Depreciation curve
    - Maintenance costs
    - Insurance estimates
    - Fuel costs over 5 years
  - Visual indicator (gauge/progress bar)
  - Breakdown of score components

- [ ] **Compatibility Score (0-100)** *(if user provided requirements)*
  - How well car matches stated needs
  - Gap analysis ("This car lacks X that you wanted")
  - Trade-off explanations

- [ ] **AI-Generated Summary**
  - Common problems (from forum data)
  - Standout features ("Tie Breakers")
  - Best model years to buy
  - Years/trims to avoid
  - Ownership cost estimate

- [ ] **Enhanced Forum Analysis**
  - Deeper sentiment parsing
  - Categorized feedback (reliability, comfort, performance)
  - "What owners love" / "What owners hate"

### Technical Additions

- [ ] Scoring algorithm implementation
- [ ] ML model for price estimation (regression)
- [ ] ML model for deal quality (softmax classification)
- [ ] Enhanced Claude prompts for deeper analysis
- [ ] Score visualization components
- [ ] Caching layer for AI responses (cost optimization)

### ML Models

| Model | Purpose | Input | Output |
|-------|---------|-------|--------|
| Regression | Fair Price Estimate | Make, model, year, mileage, condition | Price ($) |
| Softmax | Deal Quality | Listed price, fair price, market data | Great/Good/Fair/Bad |

---

## V4 - User Accounts & Persistence

**Goal:** User authentication and cloud-synced data.

### Features

- [ ] **Authentication**
  - Google OAuth (primary)
  - Email/password (optional)
  - Guest mode preserved

- [ ] **User Dashboard**
  - Saved/favorite cars
  - Search history (synced)
  - Saved comparisons
  - Preference profile (auto-fill finder form)

- [ ] **Database Integration**
  - Supabase setup
  - User profiles table
  - Saved cars table
  - Search history table
  - Comparisons table

- [ ] **Data Migration**
  - Migrate localStorage data to cloud on signup
  - Sync across devices

### Technical Additions

- [ ] Supabase client setup
- [ ] Auth middleware (protected routes)
- [ ] Database schema design
- [ ] Row Level Security (RLS) policies
- [ ] User settings page
- [ ] Data export feature (GDPR compliance)

### Database Schema (Draft)

```sql
-- Users (handled by Supabase Auth)

-- Profiles
profiles (
  id uuid PRIMARY KEY REFERENCES auth.users,
  display_name text,
  preferences jsonb,
  created_at timestamp
)

-- Saved Cars
saved_cars (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles,
  car_data jsonb,
  notes text,
  saved_at timestamp
)

-- Comparisons
comparisons (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles,
  car_ids text[],
  comparison_data jsonb,
  created_at timestamp
)
```

---

## V5+ - Monetization & Scale *(Future)*

**Goal:** Generate revenue while maintaining user trust.

### Features (Tentative)

- [ ] **Dealership Leads**
  - "Find this car near me" button
  - Geolocation-based dealer suggestions
  - Lead capture form
  - Dealer partnership program
  - Revenue: Per-lead commission

- [ ] **Minimal Advertising**
  - Non-intrusive ad placements
  - Relevant automotive ads only
  - Premium ad-free tier option

- [ ] **Premium Features** *(potential)*
  - Unlimited comparisons
  - Price alerts
  - Extended history
  - Priority AI analysis

- [ ] **API Access** *(potential)*
  - B2B data API
  - Embed widgets for other sites

- [ ] **Data Upgrade**
  - Replace AI-generated specs with paid API data
  - CarAPI.app ($99/yr) or similar
  - Remove "AI-Generated" labels

### Infrastructure Scaling

- [ ] Move to Vercel Pro (if needed)
- [ ] Database optimization
- [ ] CDN for static assets
- [ ] Rate limiting
- [ ] Analytics dashboard (business metrics)

---

## Technical Debt & Improvements Log

*Track items to revisit after initial implementation*

| Item | Version Added | Priority | Notes |
|------|---------------|----------|-------|
| - | - | - | - |

---

## API Keys & Services Tracker

| Service | Purpose | Version Needed | Status | Cost |
|---------|---------|----------------|--------|------|
| NHTSA vPIC | Make/model validation, VIN | V1 | ✅ Ready | Free |
| CarQuery | Detailed specs (older cars) | V1 | ✅ Ready | Free |
| Anthropic Claude | AI fallback, analysis | V1 (fallback), V2+ | ⏳ Need key | Pay-per-use |
| YouTube Data API | Video search | V2 | ⏳ Not started | Free tier |
| Supabase | Database & Auth | V4 | ⏳ Not started | Free tier |
| Google OAuth | Authentication | V4 | ⏳ Not started | Free |
| CarAPI.app | Paid data upgrade | V5+ | ⏳ Future | $99/yr |

---

## Changelog

### [Unreleased]
- Initial roadmap created
- Added hybrid API strategy (NHTSA + CarQuery + Claude AI fallback)
- Renamed project to ProjectGarage

---

*Last Updated: January 2026*
