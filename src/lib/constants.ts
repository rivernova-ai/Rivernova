// Single source of truth for thresholds used across the product.
// Change here → changes everywhere. Never duplicate these.

// Tier thresholds (successProbability 0–100)
export const TIER_THRESHOLDS = {
  SAFETY_MIN: 75,   // >= 75 → safety
  TARGET_MIN: 45,   // >= 45 → target, < 45 → reach
} as const;

export function deriveTier(successProbability: number): 'safety' | 'target' | 'reach' {
  if (successProbability >= TIER_THRESHOLDS.SAFETY_MIN) return 'safety';
  if (successProbability >= TIER_THRESHOLDS.TARGET_MIN) return 'target';
  return 'reach';
}

// Match score thresholds (calculateMatchScore returns 0–100)
export const MATCH_SCORE_THRESHOLDS = {
  SAFETY_MIN: 75,
  TARGET_MIN: 45,
  HIDE_BELOW: 30, // filter out schools below this score
} as const;

export function matchScoreToTier(score: number): 'safety' | 'target' | 'reach' {
  if (score >= MATCH_SCORE_THRESHOLDS.SAFETY_MIN) return 'safety';
  if (score >= MATCH_SCORE_THRESHOLDS.TARGET_MIN) return 'target';
  return 'reach';
}

// Budget defaults — shown before the user sets their own budget
export const DEFAULT_BUDGET_MIN = 10_000;
export const DEFAULT_BUDGET_MAX = 50_000;

// Pricing — single place to update when pricing changes
export const PRICING_MONTHLY = 49;
export const PRICING_DISPLAY = `$${PRICING_MONTHLY}/mo`;

// College Scorecard cache TTL
export const SCORECARD_CACHE_TTL_DAYS = 365;
