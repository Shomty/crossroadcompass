# GitHub Copilot + Claude Instructions: Today's Guidance Feature

## How to Use This Document

This is a **step-by-step implementation guide** for GitHub Copilot with Claude.

**Workflow:**
1. Open this file in VS Code alongside your project
2. For each task, copy the commented instructions into the target file
3. Let GitHub Copilot auto-complete the implementation
4. Review and adjust with Claude's help via chat
5. Move to the next task

---

## 📋 Pre-Implementation Setup

### Install Dependencies
```bash
npm install @anthropic-ai/sdk @heroicons/react zod
```

### Add Environment Variables
Add to `.env.local`:
```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
CRON_SECRET=your_random_secret_for_cron_auth
```

Add to `.env.example`:
```
ANTHROPIC_API_KEY=
CRON_SECRET=
```

---

## 🏗️ TASK 1: Type Definitions

### File: `types/index.ts`
**Action:** Add these type definitions to your existing types file

```typescript
// ============================================================================
// DAILY GUIDANCE TYPES
// ============================================================================
// These types support the personalized daily insight feature
// - InsightType: categorizes different guidance content (daily, weekly, monthly)
// - DailyInsightData: input data for generating personalized insights
// - GeneratedInsight: database record structure for insights
// - InsightGenerationPrompt: structure for Claude API prompts

export type InsightType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'HD_TIP';

// Data structure for generating a personalized daily insight
export interface DailyInsightData {
  userId: string;
  date: string; // YYYY-MM-DD format
  moonHouse: number; // 1-12, which Vedic house Moon is transiting from user's Lagna
  activeTransits: string[]; // Array of active transit descriptions
  hdType: HDType; // User's Human Design Type
  hdAuthority: HDAuthority; // User's Human Design Authority
  currentDasha: string; // Current Vedic mahadasha planet name
}

// Database record structure for generated insights
export interface GeneratedInsight {
  id: string;
  userId: string;
  type: InsightType;
  content: string; // The actual insight text (3-4 sentences)
  generatedAt: Date;
  deliveredAt?: Date; // When email was sent or dashboard viewed
  openedAt?: Date; // When user actually read it
  accuracyRating?: number; // 1-5 star rating from user
}

// Structure for Claude API prompt generation
export interface InsightGenerationPrompt {
  systemPrompt: string; // Content rules, tone, banned phrases
  userPrompt: string; // Today's specific chart data and context
  maxTokens: number;
  temperature: number;
}

// GitHub Copilot: implement the DailyInsightData interface
// GitHub Copilot: implement the GeneratedInsight interface
// GitHub Copilot: implement the InsightGenerationPrompt interface
```

**Validation:**
- Run `npm run type-check` or `tsc --noEmit`
- All types should compile without errors

---

## 🗄️ TASK 2: Database Query Helpers

### File: `lib/content/insightQueries.ts` (NEW)
**Action:** Create this new file with database query functions

```typescript
// ============================================================================
// INSIGHT DATABASE QUERIES
// ============================================================================
// This module handles all database operations for insights
// - getTodayInsight: fetch today's insight for a user
// - getRecentInsights: prevent repetition by checking last 30 days
// - saveInsight: store generated insight
// - markInsightDelivered: track when email sent or dashboard viewed
// - markInsightOpened: track when user actually read it

import { prisma } from '@/lib/db';
import type { GeneratedInsight, InsightType } from '@/types';

/**
 * Get today's daily insight for a user
 * Returns null if no insight exists for today
 * Used by: Dashboard page, Today API route
 */
export async function getTodayInsight(
  userId: string
): Promise<GeneratedInsight | null> {
  // GitHub Copilot: fetch the most recent DAILY insight for this user
  // GitHub Copilot: filter by today's date (00:00 to 23:59)
  // GitHub Copilot: return null if not found
}

/**
 * Get last N insights for a user to prevent repetition
 * Default: last 30 days
 * Used by: Content generation to check for duplicate phrasing
 */
export async function getRecentInsights(
  userId: string,
  days: number = 30
): Promise<GeneratedInsight[]> {
  // GitHub Copilot: fetch all DAILY insights from last N days
  // GitHub Copilot: order by generatedAt descending
}

/**
 * Save a newly generated insight to the database
 * Used by: Cron job after Claude API generates content
 */
export async function saveInsight(
  userId: string,
  type: InsightType,
  content: string
): Promise<GeneratedInsight> {
  // GitHub Copilot: create new insight record
  // GitHub Copilot: set generatedAt to now
  // GitHub Copilot: return the created record
}

/**
 * Mark insight as delivered (email sent or dashboard viewed)
 * Used by: Email service, Dashboard API
 */
export async function markInsightDelivered(
  insightId: string
): Promise<void> {
  // GitHub Copilot: update deliveredAt to now
}

/**
 * Mark insight as opened (user actually read it)
 * Used by: Dashboard when user views the insight card
 */
export async function markInsightOpened(
  insightId: string
): Promise<void> {
  // GitHub Copilot: update openedAt to now
}

// GitHub Copilot: implement getTodayInsight using Prisma
// GitHub Copilot: implement getRecentInsights using Prisma
// GitHub Copilot: implement saveInsight using Prisma
// GitHub Copilot: implement markInsightDelivered using Prisma
// GitHub Copilot: implement markInsightOpened using Prisma
```

**Validation:**
- File compiles with no TypeScript errors
- Prisma client imports correctly
- All functions have proper return types

---

## 🌙 TASK 3: Transit Calculator

### File: `lib/astro/transitCalculator.ts` (NEW)
**Action:** Create this new file with placeholder transit calculations

```typescript
// ============================================================================
// TRANSIT CALCULATOR
// ============================================================================
// This module calculates current astrological transits
// MVP: Uses placeholder calculations (marked with DECISION NEEDED)
// Production: Will integrate with Vedic API or Swiss Ephemeris
//
// DECISION NEEDED: Requires Vedic API endpoint for real-time transit data
// DECISION NEEDED: Requires Swiss Ephemeris integration for Moon position

import type { BirthProfile } from '@prisma/client';

/**
 * Calculate which house the Moon is transiting today
 * relative to the user's natal Lagna (Ascendant)
 * 
 * MVP PLACEHOLDER: Cycles through houses based on date
 * Moon changes house approximately every 2.5 days
 * 
 * DECISION NEEDED: Replace with actual Vedic API call or ephemeris calculation
 */
export function calculateMoonHouseToday(
  birthProfile: BirthProfile
): number {
  // GitHub Copilot: calculate day of year
  // GitHub Copilot: Moon completes zodiac in ~27 days
  // GitHub Copilot: 12 houses = ~2.25 days per house
  // GitHub Copilot: return house number 1-12
  
  // PLACEHOLDER IMPLEMENTATION
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  
  // Moon cycle approximation
  const approximateHouse = Math.floor((dayOfYear % 27) / 2.25) + 1;
  
  return Math.min(12, Math.max(1, approximateHouse));
}

/**
 * Get current active transits affecting the user's chart
 * 
 * MVP PLACEHOLDER: Returns generic transit descriptions
 * 
 * DECISION NEEDED: Replace with Vedic API call for current planetary positions
 */
export async function getCurrentTransits(
  birthProfile: BirthProfile
): Promise<string[]> {
  // GitHub Copilot: in production, this will call Vedic API
  // GitHub Copilot: for MVP, return placeholder transits
  
  return [
    'Saturn transiting through Aquarius',
    'Jupiter in Aries',
    'Rahu-Ketu axis in Aries-Libra'
  ];
}

/**
 * Determine if today is an "action-favored" or "patience-favored" day
 * based on Moon house position
 * 
 * Logic:
 * - ACTION houses: 1, 3, 5, 9, 11 (angular/trine - initiation energy)
 * - PATIENCE houses: 2, 4, 8, 12 (consolidation - depth/reflection)
 * - MAINTENANCE houses: 6, 7, 10 (duty/relationships/career structures)
 */
export function getTodayEnergyMode(
  moonHouse: number
): 'ACTION' | 'PATIENCE' | 'MAINTENANCE' {
  // GitHub Copilot: define action houses array
  // GitHub Copilot: define patience houses array
  // GitHub Copilot: define maintenance houses array
  // GitHub Copilot: return appropriate mode based on moonHouse
  
  const actionHouses = [1, 3, 5, 9, 11];
  const patienceHouses = [2, 4, 8, 12];
  
  if (actionHouses.includes(moonHouse)) return 'ACTION';
  if (patienceHouses.includes(moonHouse)) return 'PATIENCE';
  return 'MAINTENANCE';
}

// GitHub Copilot: implement calculateMoonHouseToday
// GitHub Copilot: implement getCurrentTransits
// GitHub Copilot: implement getTodayEnergyMode
```

**Validation:**
- Functions return correct types
- moonHouse always returns 1-12
- energyMode logic matches Vedic house classifications

---

## 🤖 TASK 4: Prompt Builder

### File: `lib/content/promptBuilder.ts` (NEW)
**Action:** Create this new file with Claude prompt generation logic

```typescript
// ============================================================================
// DAILY INSIGHT PROMPT BUILDER
// ============================================================================
// This module builds prompts for Claude API to generate daily insights
// Key features:
// - Enforces content rules (no prediction language, 3-4 sentences)
// - Validates against banned phrases
// - Personalizes based on user's chart and psychological profile
// - Provides energy-mode specific guidance (action vs patience)

import type { DailyInsightData, InsightGenerationPrompt } from '@/types';
import { getTodayEnergyMode } from '@/lib/astro/transitCalculator';

// CRITICAL: These phrases must NEVER appear in generated content
// Based on PRD Section 6.1: no prediction language, no mystical framing
const BANNED_PHRASES = [
  'you will',
  'this will cause',
  'this means you will',
  'the universe is',
  'divine timing',
  'meant to be',
  'your destiny',
  'spiritual awakening',
  'everything happens for a reason'
];

/**
 * Build the system prompt that sets content rules and tone
 * This prompt enforces:
 * - 3-4 sentence maximum
 * - Conditional language only (tends to, may, often)
 * - Warm but tactical tone (not mystical)
 * - Chart-specific guidance (not generic)
 */
function buildSystemPrompt(): string {
  // GitHub Copilot: create system prompt with content rules
  // GitHub Copilot: list banned phrases
  // GitHub Copilot: define tone as "warm but tactical"
  // GitHub Copilot: specify 3-part structure: pattern, calibration, action
  // GitHub Copilot: include user psychological context (depth-processor)
  
  return `You are a tactical astrology guidance system for Crossroads Compass.

CRITICAL RULES:
1. Maximum 3-4 sentences. No more.
2. NEVER use: "you will", "this will cause", "this means you will"
3. ALWAYS use: "tends to", "may notice", "often a time when"
4. Tone: warm but tactical. Not mystical. Not generic.
5. Structure: (1) Pattern recognition, (2) Behavioral calibration, (3) Tactical instruction
6. End with concrete action for TODAY

USER PSYCHOLOGY:
- Depth-processor (sees patterns, manages complexity)
- Resource/security anxiety
- Oscillates between impulsive action and structural patience
- Strong intuition, weak linear communication
- Needs timing calibration: when to act vs observe

BANNED PHRASES (never use):
${BANNED_PHRASES.map(p => `- "${p}"`).join('\n')}`;
}

/**
 * Build the user prompt with today's specific chart data
 * Includes:
 * - Moon house position and meaning
 * - Energy mode (action/patience/maintenance)
 * - HD type and authority
 * - Current dasha
 * - Guidance for today's energy mode
 */
function buildUserPrompt(data: DailyInsightData): string {
  const energyMode = getTodayEnergyMode(data.moonHouse);
  
  // GitHub Copilot: define house meanings (1-12)
  // GitHub Copilot: define energy guidance for ACTION/PATIENCE/MAINTENANCE
  // GitHub Copilot: build user prompt with chart data
  // GitHub Copilot: include specific guidance for today's energy mode
  
  const houseMeanings: Record<number, string> = {
    1: "self and identity",
    2: "resources and values",
    3: "communication and immediate action",
    4: "home and emotional foundation",
    5: "creativity and speculation",
    6: "service and obstacles",
    7: "partnerships and public interactions",
    8: "transformation and shared resources",
    9: "higher learning and expansion",
    10: "career and public status",
    11: "gains and social networks",
    12: "loss, isolation, and spiritual depth"
  };

  // GitHub Copilot: create energy guidance for each mode
  const energyGuidance: Record<string, string> = {
    ACTION: `Today favors moving from analysis to execution. Guide them to act on prepared plans. Warning: watch for premature impulse - act on what's PREPARED, not what's IMPULSIVE.`,
    PATIENCE: `Today favors observation and planning. Guide them to deepen analysis rather than execute. Emphasize structural patience over action.`,
    MAINTENANCE: `Today focuses on existing structures. Guide them to strengthen relationships, communicate carefully, honor obligations.`
  };

  return `Generate daily insight for:

CHART:
- Lagna: Leo
- Moon in house ${data.moonHouse} (${houseMeanings[data.moonHouse]})
- Energy mode: ${energyMode}
- HD Type: ${data.hdType}
- HD Authority: ${data.hdAuthority}
- Current Dasha: ${data.currentDasha}
- Transits: ${data.activeTransits.join(', ')}

TODAY'S GUIDANCE:
${energyGuidance[energyMode]}

STRUCTURE:
1. Name today's energy pattern using Moon house
2. Tell them: act or observe today?
3. Give ONE specific action for today

3-4 sentences. End with actionable guidance.`;
}

/**
 * Build complete prompt for Claude API
 */
export function buildDailyInsightPrompt(
  data: DailyInsightData
): InsightGenerationPrompt {
  // GitHub Copilot: combine system and user prompts
  // GitHub Copilot: set max tokens to 500
  // GitHub Copilot: set temperature to 0.7
  
  return {
    systemPrompt: buildSystemPrompt(),
    userPrompt: buildUserPrompt(data),
    maxTokens: 500,
    temperature: 0.7
  };
}

/**
 * Validate generated content doesn't contain banned phrases
 */
export function validateInsightContent(content: string): {
  valid: boolean;
  violations: string[];
} {
  // GitHub Copilot: check content for banned phrases
  // GitHub Copilot: return validation result with violations list
  
  const violations: string[] = [];
  const lowerContent = content.toLowerCase();
  
  for (const phrase of BANNED_PHRASES) {
    if (lowerContent.includes(phrase.toLowerCase())) {
      violations.push(phrase);
    }
  }
  
  return {
    valid: violations.length === 0,
    violations
  };
}

// GitHub Copilot: implement buildSystemPrompt
// GitHub Copilot: implement buildUserPrompt
// GitHub Copilot: implement buildDailyInsightPrompt
// GitHub Copilot: implement validateInsightContent
```

**Validation:**
- All house meanings are accurate to Vedic astrology
- Energy mode logic matches transit calculator
- Banned phrases list is complete

---

## 🔮 TASK 5: Claude API Integration

### File: `lib/content/generateInsight.ts` (NEW)
**Action:** Create this new file with Claude API calls

```typescript
// ============================================================================
// INSIGHT GENERATION VIA CLAUDE API
// ============================================================================
// This module handles actual content generation
// - Calls Claude API with prompts from promptBuilder
// - Validates generated content against rules
// - Implements retry logic for transient failures
// - Logs errors without exposing to user

import Anthropic from '@anthropic-ai/sdk';
import { env } from '@/lib/env';
import type { DailyInsightData } from '@/types';
import { buildDailyInsightPrompt, validateInsightContent } from './promptBuilder';

const anthropic = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY
});

/**
 * Generate daily insight content using Claude API
 * Throws error if generation fails or content violates rules
 */
export async function generateDailyInsight(
  data: DailyInsightData
): Promise<string> {
  // GitHub Copilot: get prompt from buildDailyInsightPrompt
  // GitHub Copilot: call Claude API with messages.create
  // GitHub Copilot: use claude-sonnet-4-20250514 model
  // GitHub Copilot: extract text content from response
  // GitHub Copilot: validate content with validateInsightContent
  // GitHub Copilot: check sentence count (should be 3-4)
  // GitHub Copilot: throw error if validation fails
  // GitHub Copilot: return generated content
}

/**
 * Generate insight with retry logic for transient failures
 * Retries up to maxRetries times with exponential backoff
 */
export async function generateDailyInsightWithRetry(
  data: DailyInsightData,
  maxRetries: number = 2
): Promise<string> {
  // GitHub Copilot: implement retry loop
  // GitHub Copilot: call generateDailyInsight
  // GitHub Copilot: on error, wait with exponential backoff
  // GitHub Copilot: retry up to maxRetries times
  // GitHub Copilot: throw last error if all retries fail
}

// GitHub Copilot: implement generateDailyInsight using Anthropic SDK
// GitHub Copilot: implement generateDailyInsightWithRetry with exponential backoff
```

**Validation:**
- Anthropic SDK imports correctly
- API key is read from env
- Error messages are descriptive
- Retry logic has exponential backoff

---

## 🛣️ TASK 6: API Route - Get Today's Insight

### File: `app/api/insights/today/route.ts` (NEW)
**Action:** Create this new file with GET endpoint

```typescript
// ============================================================================
// API ROUTE: GET TODAY'S INSIGHT
// ============================================================================
// Endpoint: GET /api/insights/today
// Purpose: Fetch today's daily insight for authenticated user
// Returns: 200 with insight data, 404 if no insight exists, 401 if not authenticated

import { NextResponse } from 'next/server';
import { getRequiredSession } from '@/lib/auth/helpers';
import { getTodayInsight, markInsightOpened } from '@/lib/content/insightQueries';

export async function GET() {
  try {
    // GitHub Copilot: get authenticated user session
    // GitHub Copilot: fetch today's insight for user
    // GitHub Copilot: return 404 if no insight exists
    // GitHub Copilot: mark insight as opened if not already marked
    // GitHub Copilot: return insight data (id, content, generatedAt, accuracyRating)
  } catch (error) {
    // GitHub Copilot: log error server-side
    // GitHub Copilot: return 500 error response
  }
}

// GitHub Copilot: implement GET handler with auth check
// GitHub Copilot: implement 404 response if no insight
// GitHub Copilot: implement mark as opened logic
```

**Validation:**
- Returns 401 if not authenticated
- Returns 404 with helpful message if no insight
- Returns 200 with correct data structure
- Marks insight as opened

---

## ⭐ TASK 7: API Route - Rate Insight

### File: `app/api/insights/rate/route.ts` (NEW)
**Action:** Create this new file with POST and GET endpoints

```typescript
// ============================================================================
// API ROUTE: RATE INSIGHT ACCURACY
// ============================================================================
// POST /api/insights/rate - Rate from dashboard (authenticated)
// GET /api/insights/rate?insightId=X&rating=Y - Rate from email link (no auth)
// Purpose: Collect user feedback on insight accuracy (1-5 stars)

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getRequiredSession } from '@/lib/auth/helpers';
import { prisma } from '@/lib/db';

const ratingSchema = z.object({
  insightId: z.string(),
  rating: z.number().min(1).max(5)
});

/**
 * POST handler - Rate from dashboard (requires auth)
 */
export async function POST(request: Request) {
  try {
    // GitHub Copilot: get authenticated session
    // GitHub Copilot: parse and validate request body with Zod
    // GitHub Copilot: verify insight belongs to this user
    // GitHub Copilot: return 403 if not user's insight
    // GitHub Copilot: update insight rating in database
    // GitHub Copilot: return success response
  } catch (error) {
    // GitHub Copilot: handle Zod validation errors
    // GitHub Copilot: return 400 for invalid data
    // GitHub Copilot: return 500 for other errors
  }
}

/**
 * GET handler - Rate from email link (no auth required)
 * The insightId acts as the authentication token
 */
export async function GET(request: Request) {
  try {
    // GitHub Copilot: parse insightId and rating from URL params
    // GitHub Copilot: validate rating is 1-5
    // GitHub Copilot: update insight rating in database
    // GitHub Copilot: return HTML thank you page
  } catch (error) {
    // GitHub Copilot: return error response
  }
}

// GitHub Copilot: implement POST handler with auth and validation
// GitHub Copilot: implement GET handler for email compatibility
// GitHub Copilot: create HTML thank you page for GET response
```

**Validation:**
- POST requires authentication
- POST validates with Zod schema
- GET works without auth (for email links)
- GET returns HTML page with thank you message

---

## 🎨 TASK 8: Dashboard UI Component

### File: `components/insights/DailyInsightCard.tsx` (NEW)
**Action:** Create this new file with React component

```typescript
// ============================================================================
// DAILY INSIGHT CARD COMPONENT
// ============================================================================
// Interactive dashboard card displaying today's personalized insight
// Features:
// - Fetches insight from API on mount
// - Shows loading skeleton while fetching
// - Shows error state if no insight available
// - Interactive 5-star rating widget
// - Persists rating to API

'use client';

import { useState, useEffect } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';

interface DailyInsightCardProps {
  className?: string;
}

interface InsightData {
  id: string;
  content: string;
  generatedAt: string;
  accuracyRating?: number;
}

export function DailyInsightCard({ className = '' }: DailyInsightCardProps) {
  // GitHub Copilot: define state for insight, loading, error, rating, hoveredStar
  const [insight, setInsight] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  useEffect(() => {
    // GitHub Copilot: fetch today's insight on mount
    fetchTodayInsight();
  }, []);

  async function fetchTodayInsight() {
    // GitHub Copilot: fetch from /api/insights/today
    // GitHub Copilot: handle 404 with friendly message
    // GitHub Copilot: set insight state and existing rating
    // GitHub Copilot: handle errors
    // GitHub Copilot: set loading to false
  }

  async function handleRating(value: number) {
    // GitHub Copilot: set rating optimistically
    // GitHub Copilot: POST to /api/insights/rate
    // GitHub Copilot: handle errors silently (rating is not critical)
  }

  // GitHub Copilot: render loading skeleton if loading
  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          {/* GitHub Copilot: create loading skeleton with gray rectangles */}
        </div>
      </div>
    );
  }

  // GitHub Copilot: render error state if error
  if (error) {
    return (
      <div className={`bg-amber-50 rounded-lg border border-amber-200 p-6 ${className}`}>
        {/* GitHub Copilot: show error message in amber styling */}
      </div>
    );
  }

  // GitHub Copilot: render insight card if insight exists
  if (!insight) return null;

  // GitHub Copilot: format date as "Monday, March 5"
  const formattedDate = new Date(insight.generatedAt).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* GitHub Copilot: header with title and date */}
      {/* GitHub Copilot: insight content paragraph */}
      {/* GitHub Copilot: rating widget with 5 stars */}
      {/* GitHub Copilot: stars change color on hover and click */}
      {/* GitHub Copilot: use StarIcon for filled, StarIconOutline for empty */}
    </div>
  );
}

// GitHub Copilot: implement fetchTodayInsight with fetch API
// GitHub Copilot: implement handleRating with POST to API
// GitHub Copilot: implement loading state with skeleton UI
// GitHub Copilot: implement error state with amber styling
// GitHub Copilot: implement star rating widget with hover effect
```

**Validation:**
- Component renders without errors
- Loading state shows skeleton
- Error state shows friendly message
- Star rating is interactive
- Rating persists on click

---

## 📊 TASK 9: Add to Dashboard Page

### File: `app/(dashboard)/page.tsx` (MODIFY)
**Action:** Add DailyInsightCard to existing dashboard

```typescript
// GitHub Copilot: import DailyInsightCard at the top of the file
import { DailyInsightCard } from '@/components/insights/DailyInsightCard';

// ... existing imports and code ...

export default async function DashboardPage() {
  // ... existing code ...

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Your personalized guidance for today</p>
      </div>

      {/* GitHub Copilot: add DailyInsightCard here as featured position */}
      <DailyInsightCard className="col-span-full" />

      {/* ... rest of existing dashboard content ... */}
    </div>
  );
}
```

**Validation:**
- Dashboard page renders with card at top
- Card is full-width and prominent
- Existing dashboard content still works

---

## ⏰ TASK 10: Cron Job for Daily Generation

### File: `app/api/cron/generate-daily-insights/route.ts` (NEW)
**Action:** Create this new file with cron endpoint

```typescript
// ============================================================================
// CRON JOB: GENERATE DAILY INSIGHTS
// ============================================================================
// Endpoint: GET /api/cron/generate-daily-insights
// Schedule: Daily at 4:00 AM UTC (configured in vercel.json)
// Purpose: Generate insights for all CORE and VIP users
// Auth: Verifies CRON_SECRET header

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateDailyInsightWithRetry } from '@/lib/content/generateInsight';
import { saveInsight, getTodayInsight } from '@/lib/content/insightQueries';
import { calculateMoonHouseToday, getCurrentTransits } from '@/lib/astro/transitCalculator';
import type { DailyInsightData } from '@/types';

function verifyCronRequest(request: Request): boolean {
  // GitHub Copilot: check authorization header
  // GitHub Copilot: in production, verify against CRON_SECRET
  // GitHub Copilot: in development, allow all requests
  
  const authHeader = request.headers.get('authorization');
  
  if (process.env.NODE_ENV === 'production') {
    return authHeader === `Bearer ${process.env.CRON_SECRET}`;
  }
  
  return true;
}

export async function GET(request: Request) {
  // GitHub Copilot: verify cron auth
  // GitHub Copilot: return 401 if unauthorized
  
  try {
    // GitHub Copilot: fetch all CORE and VIP users with active subscriptions
    // GitHub Copilot: include birthProfile in query
    
    const results = {
      total: 0,
      generated: 0,
      skipped: 0,
      errors: 0
    };

    // GitHub Copilot: limit to 50 users per run for MVP
    // GitHub Copilot: loop through users
    for (const user of usersToProcess) {
      try {
        // GitHub Copilot: check if insight already exists for today
        // GitHub Copilot: skip if exists
        
        // GitHub Copilot: skip if no birth profile
        
        // GitHub Copilot: calculate Moon house for today
        // GitHub Copilot: get current transits
        
        // GitHub Copilot: build DailyInsightData object
        // TODO: Get real HD type/authority from user's chart
        // TODO: Get real current dasha from user's chart
        
        // GitHub Copilot: generate insight content with retry
        
        // GitHub Copilot: save to database
        
        // GitHub Copilot: increment generated counter
      } catch (error) {
        // GitHub Copilot: log error
        // GitHub Copilot: increment errors counter
        // GitHub Copilot: continue to next user
      }
    }

    // GitHub Copilot: log summary
    // GitHub Copilot: return success with results
  } catch (error) {
    // GitHub Copilot: log error
    // GitHub Copilot: return 500 error
  }
}

// GitHub Copilot: implement verifyCronRequest
// GitHub Copilot: implement user query with Prisma
// GitHub Copilot: implement generation loop with error handling
// GitHub Copilot: implement results tracking
```

**Validation:**
- Route requires proper authorization
- Processes users in batches (50 max)
- Handles errors gracefully per user
- Returns summary of results

---

## ⚙️ TASK 11: Vercel Cron Configuration

### File: `vercel.json` (CREATE OR MODIFY at project root)
**Action:** Add cron job configuration

```json
{
  "crons": [
    {
      "path": "/api/cron/generate-daily-insights",
      "schedule": "0 4 * * *"
    }
  ]
}
```

**Note:** Schedule explanation:
- `0 4 * * *` = Every day at 4:00 AM UTC
- This runs before users wake up in most timezones
- Insights are ready when they check their dashboard

---

## ✅ Testing Checklist

### Manual Tests to Run

1. **Type Check**
   ```bash
   npm run type-check
   # Should pass with no errors
   ```

2. **Create Test User**
   - Create user with CORE subscription
   - Create birth profile with valid data

3. **Trigger Cron Manually**
   ```bash
   curl http://localhost:3000/api/cron/generate-daily-insights
   # Check database for new insight record
   ```

4. **Test Dashboard**
   - Visit `/dashboard`
   - Verify DailyInsightCard appears
   - Verify insight content loads
   - Verify loading state appears briefly

5. **Test Rating**
   - Click star rating (1-5 stars)
   - Refresh page
   - Verify rating persists

6. **Test Email Rating Link**
   ```bash
   curl "http://localhost:3000/api/insights/rate?insightId=INSIGHT_ID&rating=5"
   # Should return HTML thank you page
   ```

### Edge Cases

- [ ] No insight available (shows placeholder message)
- [ ] FREE tier user (should show upgrade CTA - implement later)
- [ ] User with no birth profile (skipped in cron)
- [ ] API error during generation (retries work)
- [ ] Invalid rating value (rejected by validation)

---

## 🚀 Deployment Checklist

### Environment Variables in Vercel
```
ANTHROPIC_API_KEY=your_actual_api_key
CRON_SECRET=your_random_secret_string
```

### Pre-Deploy
- [ ] All TypeScript errors resolved
- [ ] Database migration run in production
- [ ] Environment variables set in Vercel
- [ ] `vercel.json` committed to repo

### Post-Deploy
- [ ] Test cron job runs at scheduled time
- [ ] Monitor error logs for first 24 hours
- [ ] Check insight generation success rate
- [ ] Verify dashboard loads without errors

---

## 📝 Known Limitations (By Design)

These are placeholders that need real integration later:

1. **Moon House Calculation** - Uses date approximation
   - Location: `lib/astro/transitCalculator.ts`
   - Need: Vedic API integration or Swiss Ephemeris

2. **Current Transits** - Returns placeholder data
   - Location: `lib/astro/transitCalculator.ts`
   - Need: Vedic API for real-time planetary positions

3. **HD Type/Authority** - Hardcoded in cron job
   - Location: `app/api/cron/generate-daily-insights/route.ts`
   - Need: Fetch from user's HD chart in database

4. **Current Dasha** - Placeholder value
   - Location: `app/api/cron/generate-daily-insights/route.ts`
   - Need: Dasha calculation from user's birth chart

All placeholders are marked with `DECISION NEEDED` or `TODO` comments.

---

## 🆘 Troubleshooting Guide

### "ANTHROPIC_API_KEY not found"
- Add to `.env.local`
- Restart dev server: `npm run dev`

### "Insight not appearing on dashboard"
- Check if cron job ran: query database for today's insight
- Run cron manually to test
- Check browser console for API errors

### "TypeScript errors in types/index.ts"
- Ensure all new types are exported
- Run `npm run type-check` to see specific errors

### "Cron job not running in production"
- Verify `vercel.json` is in project root
- Check Vercel dashboard → Project → Settings → Crons
- View cron execution logs in Vercel

### "Generated content has banned phrases"
- Check console for validation errors
- Content will be rejected and not saved
- Adjust prompt if pattern repeats

---

## 🎯 Success Criteria

Feature is complete when:
- ✅ Daily insights generate automatically at 4 AM UTC
- ✅ Dashboard displays today's insight for CORE/VIP users
- ✅ Insight content is 3-4 sentences and ends with action item
- ✅ No banned phrases appear in generated content
- ✅ Star rating widget works and persists
- ✅ Email rating links work without authentication
- ✅ Loading and error states display correctly
- ✅ All TypeScript checks pass

---

## 📚 Reference Documentation

- **Crossroads Compass PRD**: `/mnt/project/crossroads_compass_PRD.docx`
- **Task System**: `/mnt/project/TASKS.md`
- **Anthropic API Docs**: https://docs.anthropic.com
- **Vercel Crons**: https://vercel.com/docs/cron-jobs

---

**END OF INSTRUCTIONS**

Follow these tasks sequentially. Use GitHub Copilot to autocomplete implementations based on the commented instructions. Ask Claude via chat if you need clarification on any step.
