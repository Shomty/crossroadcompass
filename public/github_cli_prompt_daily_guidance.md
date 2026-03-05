# GitHub CLI + Claude Code Prompt: Today's Guidance Dashboard Feature

## Context for Claude Code

You are building a feature for **Crossroads Compass**, a Vedic astrology + Human Design SaaS platform for adults navigating life transitions. This prompt will guide you through implementing the **Daily Guidance** feature on the user dashboard.

---

## Project Context Files to Read First

Before starting, read these files in order:
1. `crossroads-compass.instructions.md` - Full product context, tech stack, content rules
2. `TASKS.md` - Task system and current build phase
3. `FRONTEND.md` - Design system (if it exists)

**Critical:** Follow the task system rules:
- Complete tasks atomically
- Add status comments to every file: `// STATUS: done | Task X.Y`
- Stop at DECISION NEEDED markers
- Never refactor previous tasks unless explicitly required

---

## Feature Requirements Summary

### What This Feature Does
Delivers a personalized 3-4 sentence daily insight to users each morning that:
- Names the current energy pattern affecting their specific chart
- Provides behavioral calibration (act today vs observe today)
- Ends with a tactical, actionable instruction
- Uses plain language with no mystical framing
- Never uses prediction language ("you will", "this will cause")

### User Profile Context
Primary user is a **depth-processor** with:
- Strong analytical capability but intuitive decision-making
- Resource/security anxiety as central theme
- Oscillation between impulsive action and structural patience
- Professional focus on crisis management, strategy, transformation work
- Communication paradox: strong insight, weak linear articulation

---

## Tech Stack Reference

```
Frontend: Next.js 14+, TypeScript (strict), Tailwind, React
Backend: Next.js API routes
Database: PostgreSQL + Prisma (relational business data only)
Cache: Upstash/Vercel KV (Redis) - for chart data and transits
Auth: NextAuth
APIs: 
  - Vedic Astrology REST API (http://144.76.78.183:9000/api/v1/)
  - openhumandesign-library (GitHub package)
```

---

## Tasks to Complete

### Phase 1: Data Layer (Tasks 8.2, 9.1, 9.3 dependencies)

#### Task 1.1: Create Insight Type Definitions
**File:** `/types/index.ts` (append to existing)

```typescript
// Add these types to the existing types file

export type InsightType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'HD_TIP';

export interface DailyInsightData {
  userId: string;
  date: string; // YYYY-MM-DD
  moonHouse: number; // 1-12, which house Moon is in today from user's Lagna
  activeTansits: string[]; // Array of active transit descriptions
  hdType: HDType;
  hdAuthority: HDAuthority;
  currentDasha: string; // Current mahadasha planet
}

export interface GeneratedInsight {
  id: string;
  userId: string;
  type: InsightType;
  content: string;
  generatedAt: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  accuracyRating?: number; // 1-5
}

export interface InsightGenerationPrompt {
  systemPrompt: string;
  userPrompt: string;
  maxTokens: number;
  temperature: number;
}
```

**Validation:**
- Run `npm run type-check` - must pass with no errors
- Status comment: `// STATUS: done | Task 1.1`

---

#### Task 1.2: Create Daily Insight Database Query Helpers
**File:** `/lib/content/insightQueries.ts` (new file)

```typescript
import { prisma } from '@/lib/db';
import type { GeneratedInsight } from '@/types';

/**
 * Get today's daily insight for a user
 * Returns null if no insight exists for today
 */
export async function getTodayInsight(
  userId: string
): Promise<GeneratedInsight | null> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  const insight = await prisma.insight.findFirst({
    where: {
      userId,
      type: 'DAILY',
      generatedAt: {
        gte: new Date(today),
        lt: new Date(new Date(today).getTime() + 86400000) // +24 hours
      }
    },
    orderBy: {
      generatedAt: 'desc'
    }
  });

  return insight as GeneratedInsight | null;
}

/**
 * Get last N insights for a user (to prevent repetition)
 */
export async function getRecentInsights(
  userId: string,
  days: number = 30
): Promise<GeneratedInsight[]> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const insights = await prisma.insight.findMany({
    where: {
      userId,
      type: 'DAILY',
      generatedAt: {
        gte: cutoffDate
      }
    },
    orderBy: {
      generatedAt: 'desc'
    }
  });

  return insights as GeneratedInsight[];
}

/**
 * Save a generated insight to the database
 */
export async function saveInsight(
  userId: string,
  type: InsightType,
  content: string
): Promise<GeneratedInsight> {
  const insight = await prisma.insight.create({
    data: {
      userId,
      type,
      content,
      generatedAt: new Date()
    }
  });

  return insight as GeneratedInsight;
}

/**
 * Mark insight as delivered (when email sent or dashboard viewed)
 */
export async function markInsightDelivered(
  insightId: string
): Promise<void> {
  await prisma.insight.update({
    where: { id: insightId },
    data: { deliveredAt: new Date() }
  });
}

/**
 * Mark insight as opened (when user views in dashboard)
 */
export async function markInsightOpened(
  insightId: string
): Promise<void> {
  await prisma.insight.update({
    where: { id: insightId },
    data: { openedAt: new Date() }
  });
}
```

**Validation:**
- File compiles with no TypeScript errors
- Prisma client is correctly imported
- Status comment: `// STATUS: done | Task 1.2`

---

#### Task 1.3: Create Transit Calculation Helper
**File:** `/lib/astro/transitCalculator.ts` (new file)

```typescript
import type { BirthProfile } from '@prisma/client';

/**
 * Calculate which house the Moon is transiting today
 * relative to the user's natal Lagna (Ascendant)
 * 
 * DECISION NEEDED: This requires either:
 * 1. Vedic API endpoint for current Moon position
 * 2. Swiss Ephemeris calculation
 * 
 * For MVP: Return a placeholder that cycles through houses
 * based on date (Moon changes house every ~2.5 days)
 */
export function calculateMoonHouseToday(
  birthProfile: BirthProfile
): number {
  // PLACEHOLDER IMPLEMENTATION
  // TODO: Replace with actual Vedic API call or ephemeris calculation
  
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  
  // Moon completes zodiac in ~27 days, 12 houses = ~2.25 days per house
  const approximateHouse = Math.floor((dayOfYear % 27) / 2.25) + 1;
  
  return Math.min(12, Math.max(1, approximateHouse));
}

/**
 * Get current active transits affecting the user's chart
 * 
 * DECISION NEEDED: Requires Vedic API integration
 * For MVP: Return placeholder transit descriptions
 */
export async function getCurrentTransits(
  birthProfile: BirthProfile
): Promise<string[]> {
  // PLACEHOLDER IMPLEMENTATION
  // TODO: Replace with Vedic API call for current planetary positions
  
  return [
    'Saturn transiting through Aquarius',
    'Jupiter in Aries',
    'Rahu-Ketu axis in Aries-Libra'
  ];
}

/**
 * Determine if today is an "action-favored" or "patience-favored" day
 * based on Moon house position
 */
export function getTodayEnergyMode(moonHouse: number): 'ACTION' | 'PATIENCE' | 'MAINTENANCE' {
  // Action houses: 1, 3, 5, 9, 11 (angular and trine houses for initiation)
  const actionHouses = [1, 3, 5, 9, 11];
  
  // Consolidation houses: 2, 4, 8, 12 (houses of depth and reflection)
  const patienceHouses = [2, 4, 8, 12];
  
  // Maintenance houses: 6, 7, 10 (duty, relationships, career structures)
  const maintenanceHouses = [6, 7, 10];
  
  if (actionHouses.includes(moonHouse)) return 'ACTION';
  if (patienceHouses.includes(moonHouse)) return 'PATIENCE';
  return 'MAINTENANCE';
}
```

**Validation:**
- Functions compile with no TypeScript errors
- Add DECISION NEEDED comment at top of file
- Status comment: `// STATUS: done | Task 1.3`

---

### Phase 2: Content Generation Layer

#### Task 2.1: Create Prompt Builder for Daily Insights
**File:** `/lib/content/promptBuilder.ts` (new file)

```typescript
import type { DailyInsightData, InsightGenerationPrompt } from '@/types';
import { getTodayEnergyMode } from '@/lib/astro/transitCalculator';

// CRITICAL: Banned phrases that must never appear in generated content
const BANNED_PHRASES = [
  'you will',
  'this will cause',
  'this means you will',
  'the universe is',
  'divine timing',
  'meant to be',
  'your destiny',
  'spiritual awakening'
];

/**
 * Build the system prompt that sets content rules and tone
 */
function buildSystemPrompt(): string {
  return `You are a tactical astrology guidance system for Crossroads Compass. Your role is to provide specific, actionable daily insights based on Vedic astrology and Human Design.

CRITICAL RULES:
1. Maximum 3-4 sentences. No more.
2. NEVER use prediction language: "you will", "this will cause", "this means you will"
3. ALWAYS use conditional language: "tends to", "may notice", "often a time when"
4. Tone: warm but tactical. Not mystical. Not generic. Grounded and specific.
5. Structure: (1) Pattern recognition, (2) Behavioral calibration, (3) Tactical instruction
6. Every insight must end with a concrete action the user can take TODAY
7. Define any astrological terms immediately in plain language
8. Focus on these life domains: resource management, partnerships, crisis navigation, communication

BANNED PHRASES (never use these):
${BANNED_PHRASES.map(phrase => `- "${phrase}"`).join('\n')}

USER CONTEXT:
This user is a depth-processor who:
- Manages complex systems and hidden information professionally
- Experiences resource/security anxiety
- Oscillates between impulsive action and structural patience
- Has strong intuition but struggles with linear communication
- Needs timing calibration (when to act vs when to observe)`;
}

/**
 * Build the user prompt with today's specific data
 */
function buildUserPrompt(data: DailyInsightData): string {
  const energyMode = getTodayEnergyMode(data.moonHouse);
  
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

  const energyGuidance: Record<string, string> = {
    ACTION: `This is an initiation-favored day. The user's strategic mind can move from analysis into execution. Guide them to take decisive action on something they've been planning. Warning: Watch for Mars-Rahu premature action impulse - remind them to act on what's PREPARED, not what's IMPULSIVE.`,
    
    PATIENCE: `This is a consolidation day. Today favors observation, planning, and depth-processing over execution. Guide them to use this energy for review, reinforcement, and strategic mapping rather than making major moves or decisions. Emphasize Saturn's structural patience.`,
    
    MAINTENANCE: `This is a systems maintenance day. Today focuses on relationships, duties, and existing structures rather than new initiatives. Guide them to strengthen what already exists, communicate carefully (Mercury debilitation risk), and honor existing obligations.`
  };

  return `Generate a daily insight for today with these specifics:

CHART DATA:
- User's Lagna (Ascendant): Leo
- Moon transiting house: ${data.moonHouse} (the house of ${houseMeanings[data.moonHouse]})
- Energy mode: ${energyMode}
- Human Design Type: ${data.hdType}
- Human Design Authority: ${data.hdAuthority}
- Current Dasha: ${data.currentDasha}
- Active Transits: ${data.activeTansits.join(', ')}

ENERGY GUIDANCE FOR TODAY:
${energyGuidance[energyMode]}

USER'S PSYCHOLOGICAL PROFILE:
- Primary life domains: crisis management, strategic transformation, resource/partnership negotiations
- Communication weakness: struggles to translate complex insights into linear explanations
- Key tension: peaceful visionary vs aggressive resource warrior
- Needs: timing calibration between action and patience

REQUIREMENTS:
1. First sentence: Name what energy phase is active today using the Moon's house position. Define the astrological term in parentheses.
2. Second sentence: Tell them whether today favors action or observation based on the energy mode.
3. Third sentence (optional): Add specific context from their HD type/authority if relevant.
4. Final sentence: Give ONE specific, concrete action they should take or avoid today.

Remember: 3-4 sentences maximum. Must be chart-specific, not generic. End with actionable guidance.`;
}

/**
 * Build complete prompt for Claude API
 */
export function buildDailyInsightPrompt(
  data: DailyInsightData
): InsightGenerationPrompt {
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
```

**Validation:**
- File compiles with no errors
- BANNED_PHRASES constant is complete
- House meanings are accurate to Vedic astrology
- Status comment: `// STATUS: done | Task 2.1`

---

#### Task 2.2: Create Claude API Integration for Content Generation
**File:** `/lib/content/generateInsight.ts` (new file)

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { env } from '@/lib/env';
import type { DailyInsightData } from '@/types';
import { buildDailyInsightPrompt, validateInsightContent } from './promptBuilder';

const anthropic = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY
});

/**
 * Generate daily insight content using Claude API
 * Returns the generated content string
 * Throws error if generation fails or content violates rules
 */
export async function generateDailyInsight(
  data: DailyInsightData
): Promise<string> {
  const prompt = buildDailyInsightPrompt(data);
  
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: prompt.maxTokens,
      temperature: prompt.temperature,
      system: prompt.systemPrompt,
      messages: [
        {
          role: 'user',
          content: prompt.userPrompt
        }
      ]
    });

    // Extract text content from response
    const content = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim();

    if (!content) {
      throw new Error('Claude API returned empty content');
    }

    // Validate content doesn't contain banned phrases
    const validation = validateInsightContent(content);
    if (!validation.valid) {
      console.error('Generated content contains banned phrases:', validation.violations);
      throw new Error(
        `Generated content violates rules. Banned phrases found: ${validation.violations.join(', ')}`
      );
    }

    // Check length constraint (roughly 3-4 sentences)
    const sentenceCount = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    if (sentenceCount > 5) {
      console.warn(`Generated content has ${sentenceCount} sentences, should be 3-4`);
      // Don't throw - this is a soft warning for review
    }

    return content;
    
  } catch (error) {
    console.error('Error generating daily insight:', error);
    throw new Error(
      `Failed to generate daily insight: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Generate insight with retry logic for transient failures
 */
export async function generateDailyInsightWithRetry(
  data: DailyInsightData,
  maxRetries: number = 2
): Promise<string> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await generateDailyInsight(data);
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries) {
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
      }
    }
  }
  
  throw lastError || new Error('Failed to generate insight after retries');
}
```

**Environment Variables Required:**
Add to `.env.local` and `.env.example`:
```
ANTHROPIC_API_KEY=your_api_key_here
```

**Validation:**
- Install Anthropic SDK: `npm install @anthropic-ai/sdk`
- File compiles with no errors
- Error handling is comprehensive
- Status comment: `// STATUS: done | Task 2.2`

---

### Phase 3: API Routes

#### Task 3.1: Create API Route to Fetch Today's Insight
**File:** `/app/api/insights/today/route.ts` (new file)

```typescript
import { NextResponse } from 'next/server';
import { getRequiredSession } from '@/lib/auth/helpers';
import { getTodayInsight, markInsightOpened } from '@/lib/content/insightQueries';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Require authenticated user
    const session = await getRequiredSession();
    const userId = session.user.id;

    // Get today's insight from database
    const insight = await getTodayInsight(userId);

    if (!insight) {
      return NextResponse.json(
        { 
          error: 'No insight available for today',
          message: 'Your daily insight is being prepared. Check back in a few minutes.'
        },
        { status: 404 }
      );
    }

    // Mark as opened if not already marked
    if (insight && !insight.openedAt) {
      await markInsightOpened(insight.id);
    }

    return NextResponse.json({
      id: insight.id,
      content: insight.content,
      generatedAt: insight.generatedAt,
      accuracyRating: insight.accuracyRating
    });

  } catch (error) {
    console.error('Error fetching today\'s insight:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch daily insight' },
      { status: 500 }
    );
  }
}
```

**Validation:**
- Route responds with 401 if not authenticated
- Route responds with 404 if no insight exists
- Route responds with 200 and insight data if exists
- Status comment: `// STATUS: done | Task 3.1`

---

#### Task 3.2: Create API Route to Rate Insight Accuracy
**File:** `/app/api/insights/rate/route.ts` (new file)

```typescript
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getRequiredSession } from '@/lib/auth/helpers';
import { prisma } from '@/lib/db';

const ratingSchema = z.object({
  insightId: z.string(),
  rating: z.number().min(1).max(5)
});

export async function POST(request: Request) {
  try {
    const session = await getRequiredSession();
    const userId = session.user.id;

    const body = await request.json();
    const { insightId, rating } = ratingSchema.parse(body);

    // Verify the insight belongs to this user
    const insight = await prisma.insight.findUnique({
      where: { id: insightId },
      select: { userId: true }
    });

    if (!insight) {
      return NextResponse.json(
        { error: 'Insight not found' },
        { status: 404 }
      );
    }

    if (insight.userId !== userId) {
      return NextResponse.json(
        { error: 'Not authorized to rate this insight' },
        { status: 403 }
      );
    }

    // Update the rating
    await prisma.insight.update({
      where: { id: insightId },
      data: { accuracyRating: rating }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error rating insight:', error);
    return NextResponse.json(
      { error: 'Failed to save rating' },
      { status: 500 }
    );
  }
}

// Also support GET for email link compatibility
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const insightId = searchParams.get('insightId');
    const rating = searchParams.get('rating');

    if (!insightId || !rating) {
      return NextResponse.json(
        { error: 'Missing insightId or rating' },
        { status: 400 }
      );
    }

    const numRating = parseInt(rating, 10);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // For GET requests from email, we just save the rating
    // No auth check because the insightId is effectively the auth token
    await prisma.insight.update({
      where: { id: insightId },
      data: { accuracyRating: numRating }
    });

    // Return a simple HTML page thanking them
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Thank You</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: #f9fafb;
            }
            .card {
              background: white;
              padding: 2rem;
              border-radius: 8px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              text-align: center;
              max-width: 400px;
            }
            h1 { margin: 0 0 1rem; color: #111; }
            p { color: #666; margin: 0; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Thank you!</h1>
            <p>Your rating has been recorded. This helps us improve your daily guidance.</p>
          </div>
        </body>
      </html>
      `,
      {
        headers: { 'Content-Type': 'text/html' }
      }
    );

  } catch (error) {
    console.error('Error rating insight via GET:', error);
    return NextResponse.json(
      { error: 'Failed to save rating' },
      { status: 500 }
    );
  }
}
```

**Validation:**
- POST route validates with Zod schema
- GET route works for email compatibility
- Both routes update the database correctly
- Status comment: `// STATUS: done | Task 3.2`

---

### Phase 4: Dashboard UI Components

#### Task 4.1: Create Daily Insight Card Component
**File:** `/components/insights/DailyInsightCard.tsx` (new file)

```typescript
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
  const [insight, setInsight] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  useEffect(() => {
    fetchTodayInsight();
  }, []);

  async function fetchTodayInsight() {
    try {
      const response = await fetch('/api/insights/today');
      
      if (!response.ok) {
        if (response.status === 404) {
          const data = await response.json();
          setError(data.message || 'No insight available yet');
        } else {
          throw new Error('Failed to fetch insight');
        }
        return;
      }

      const data = await response.json();
      setInsight(data);
      setRating(data.accuracyRating || null);
    } catch (err) {
      setError('Unable to load your daily insight. Please try again.');
      console.error('Error fetching insight:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRating(value: number) {
    if (!insight) return;

    setRating(value);

    try {
      await fetch('/api/insights/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          insightId: insight.id,
          rating: value
        })
      });
    } catch (err) {
      console.error('Error saving rating:', err);
      // Silently fail - rating is not critical
    }
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-amber-50 rounded-lg border border-amber-200 p-6 ${className}`}>
        <p className="text-amber-800 text-sm">{error}</p>
      </div>
    );
  }

  if (!insight) {
    return null;
  }

  const generatedDate = new Date(insight.generatedAt);
  const formattedDate = generatedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Today's Guidance</h2>
        <span className="text-xs text-gray-500">{formattedDate}</span>
      </div>

      {/* Insight Content */}
      <div className="prose prose-sm max-w-none mb-6">
        <p className="text-gray-700 leading-relaxed">{insight.content}</p>
      </div>

      {/* Rating Widget */}
      <div className="border-t border-gray-100 pt-4">
        <p className="text-xs text-gray-600 mb-2">How accurate was this guidance?</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => {
            const isRated = rating !== null && value <= rating;
            const isHovered = hoveredStar !== null && value <= hoveredStar;
            const Icon = isRated || isHovered ? StarIcon : StarIconOutline;
            
            return (
              <button
                key={value}
                onClick={() => handleRating(value)}
                onMouseEnter={() => setHoveredStar(value)}
                onMouseLeave={() => setHoveredStar(null)}
                className="p-1 hover:scale-110 transition-transform"
                aria-label={`Rate ${value} stars`}
              >
                <Icon 
                  className={`w-5 h-5 ${
                    isRated || isHovered 
                      ? 'text-yellow-400' 
                      : 'text-gray-300'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

**Dependencies Required:**
```bash
npm install @heroicons/react
```

**Validation:**
- Component renders without errors
- Star rating is interactive
- Loading and error states work correctly
- Status comment: `// STATUS: done | Task 4.1`

---

#### Task 4.2: Add Daily Insight to Dashboard Page
**File:** `/app/(dashboard)/page.tsx` (modify existing)

```typescript
import { DailyInsightCard } from '@/components/insights/DailyInsightCard';
// ... other imports

export default async function DashboardPage() {
  // ... existing code

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Your personalized guidance for today</p>
      </div>

      {/* Daily Insight Card - Featured Position */}
      <DailyInsightCard className="col-span-full" />

      {/* ... rest of existing dashboard content ... */}
    </div>
  );
}
```

**Validation:**
- Dashboard page renders with DailyInsightCard at the top
- Card is full-width and prominently displayed
- Status comment: `// STATUS: done | Task 4.2`

---

### Phase 5: Background Job for Daily Generation

#### Task 5.1: Create Cron Job for Daily Insight Generation
**File:** `/app/api/cron/generate-daily-insights/route.ts` (new file)

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateDailyInsightWithRetry } from '@/lib/content/generateInsight';
import { saveInsight, getTodayInsight } from '@/lib/content/insightQueries';
import { calculateMoonHouseToday, getCurrentTransits } from '@/lib/astro/transitCalculator';
import type { DailyInsightData } from '@/types';

// Verify this is a Vercel Cron request
function verifyCronRequest(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  
  // In production, verify against CRON_SECRET
  if (process.env.NODE_ENV === 'production') {
    return authHeader === `Bearer ${process.env.CRON_SECRET}`;
  }
  
  // In development, allow all requests
  return true;
}

export async function GET(request: Request) {
  // Verify this is an authorized cron request
  if (!verifyCronRequest(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Get all CORE and VIP tier users
    const users = await prisma.user.findMany({
      where: {
        subscriptionTier: {
          in: ['CORE', 'VIP']
        },
        subscriptionStatus: 'active'
      },
      include: {
        birthProfile: true
      }
    });

    const results = {
      total: users.length,
      generated: 0,
      skipped: 0,
      errors: 0
    };

    // Process users (limit to 50 per run for MVP)
    const usersToProcess = users.slice(0, 50);

    for (const user of usersToProcess) {
      try {
        // Check if insight already exists for today
        const existing = await getTodayInsight(user.id);
        if (existing) {
          results.skipped++;
          continue;
        }

        // Skip users without birth profile
        if (!user.birthProfile) {
          console.warn(`User ${user.id} has no birth profile, skipping`);
          results.skipped++;
          continue;
        }

        // Prepare insight data
        const moonHouse = calculateMoonHouseToday(user.birthProfile);
        const activeTansits = await getCurrentTransits(user.birthProfile);

        const insightData: DailyInsightData = {
          userId: user.id,
          date: new Date().toISOString().split('T')[0],
          moonHouse,
          activeTansits,
          hdType: 'Generator', // TODO: Get from user's HD chart
          hdAuthority: 'Sacral', // TODO: Get from user's HD chart
          currentDasha: 'Mars' // TODO: Get from user's current dasha calculation
        };

        // Generate insight content
        const content = await generateDailyInsightWithRetry(insightData);

        // Save to database
        await saveInsight(user.id, 'DAILY', content);

        results.generated++;

      } catch (error) {
        console.error(`Error generating insight for user ${user.id}:`, error);
        results.errors++;
      }
    }

    // Log summary
    console.log('Daily insights generation complete:', results);

    return NextResponse.json({
      success: true,
      results
    });

  } catch (error) {
    console.error('Error in cron job:', error);
    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 }
    );
  }
}
```

**Vercel Configuration:**
**File:** `vercel.json` (create or modify at project root)

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

**Environment Variables:**
Add to `.env.local` and `.env.example`:
```
CRON_SECRET=your_random_secret_here
```

**Validation:**
- Route can be called manually: `curl http://localhost:3000/api/cron/generate-daily-insights`
- Route generates insights for test users
- Vercel cron configuration is valid
- Status comment: `// STATUS: done | Task 5.1`

---

## Testing Checklist

### Manual Testing
- [ ] Create a test user with CORE subscription
- [ ] Create a birth profile for the test user
- [ ] Manually trigger cron job: `curl http://localhost:3000/api/cron/generate-daily-insights`
- [ ] Verify insight is generated in database
- [ ] Visit dashboard and verify DailyInsightCard displays insight
- [ ] Test star rating functionality
- [ ] Test that rating persists on page reload

### Edge Cases
- [ ] Test with no insight available (404 state)
- [ ] Test with FREE tier user (should show upgrade CTA)
- [ ] Test with user who has no birth profile
- [ ] Test rating insight from email link (GET endpoint)

### Content Quality
- [ ] Verify generated insights are 3-4 sentences
- [ ] Verify no banned phrases appear
- [ ] Verify insights end with actionable guidance
- [ ] Verify astrological terms are defined in plain language

---

## Environment Variables Summary

Required in `.env.local`:
```
# Existing variables
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# New variables for this feature
ANTHROPIC_API_KEY=your_anthropic_api_key
CRON_SECRET=your_random_secret_here
```

---

## Deployment Checklist

- [ ] All environment variables set in Vercel project settings
- [ ] `vercel.json` cron configuration deployed
- [ ] Anthropic API key has sufficient credits
- [ ] Database migration run in production
- [ ] Cron job tested in staging environment
- [ ] Error monitoring configured for insight generation failures

---

## Known Limitations (MVP)

1. **Transit Calculation:** Using placeholder Moon house calculation. Real implementation requires Vedic API integration or Swiss Ephemeris.
2. **HD Data:** Using placeholder HD type/authority. Real implementation requires fetching from user's HD chart.
3. **Dasha Data:** Using placeholder current dasha. Real implementation requires dasha calculation from user's chart.
4. **Batch Size:** Limited to 50 users per cron run. Scale with pagination in Phase 2.
5. **Content Review:** No consultant review in MVP. All insights are AI-generated. Add review workflow in Phase 2.

---

## Next Steps After MVP

1. **Phase 2: Real Transit Integration**
   - Integrate actual Vedic API for Moon position
   - Calculate current transits for each user
   - Implement dasha progression tracking

2. **Phase 3: Email Delivery**
   - Send daily insight via email (Task 7.3)
   - Add email preference settings
   - Track email open rates

3. **Phase 4: Content Review Workflow**
   - Build consultant review dashboard
   - Implement approve/reject workflow
   - Add revision requests

4. **Phase 5: Advanced Personalization**
   - Track insight accuracy scores per user
   - Adjust tone based on user feedback
   - A/B test different prompt strategies

---

## Support Resources

**Documentation:**
- Crossroads Compass PRD: `/mnt/project/crossroads_compass_PRD.docx`
- Task System: `/mnt/project/TASKS.md`

**APIs:**
- Anthropic Docs: https://docs.anthropic.com
- Vedic Astrology API: http://144.76.78.183:9000/api/v1/ (pending documentation)

**Contact:**
- For DECISION NEEDED items, flag in the code and document in TASKS.md
- For technical blockers, surface immediately with context

---

## File Structure Summary

```
/app
  /api
    /insights
      /today/route.ts          # GET today's insight
      /rate/route.ts           # POST/GET rating
    /cron
      /generate-daily-insights/route.ts  # Cron job
  /(dashboard)
    /page.tsx                  # Modified to include DailyInsightCard

/components
  /insights
    /DailyInsightCard.tsx      # UI component

/lib
  /content
    /insightQueries.ts         # Database queries
    /promptBuilder.ts          # Prompt templates
    /generateInsight.ts        # Claude API integration
  /astro
    /transitCalculator.ts      # Transit calculations

/types
  /index.ts                    # Type definitions

vercel.json                    # Cron configuration
```

---

**END OF PROMPT**

This prompt provides complete implementation instructions for the Daily Guidance feature. Follow the tasks sequentially, validate each step, and mark DECISION NEEDED items where real data integration is blocked.
