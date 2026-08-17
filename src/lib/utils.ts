import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Strips markdown syntax from AI-generated text
 * Removes: **bold**, *italic*, _underline_, [citations], ### headers, `code`
 * @param text - Raw text from AI/Perplexity API
 * @returns Cleaned text without markdown or citations
 */
export function stripMarkdown(text: string | undefined | null): string {
  if (!text) return '';
  
  let cleaned = String(text);
  
  // Remove citation brackets like [1], [2], [3], etc.
  cleaned = cleaned.replace(/\[\d+\]/g, '');
  
  // Remove bold markdown (**text** or __text__)
  cleaned = cleaned.replace(/\*\*(.+?)\*\*/g, '$1');
  cleaned = cleaned.replace(/__(.+?)__/g, '$1');
  
  // Remove italic markdown (*text* or _text_)
  // Be careful not to remove underscores in the middle of words
  cleaned = cleaned.replace(/\*([^\*]+)\*/g, '$1');
  cleaned = cleaned.replace(/_([^_]+)_/g, '$1');
  
  // Remove headers (# ## ### etc)
  cleaned = cleaned.replace(/^#+\s+/gm, '');
  
  // Remove inline code (`text`)
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
  
  // Remove links but keep text [text](url)
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
  
  // Remove HTML tags
  cleaned = cleaned.replace(/<[^>]+>/g, '');
  
  // Remove multiple spaces and normalize whitespace
  cleaned = cleaned.replace(/\s+/g, ' ');
  
  // Remove leading/trailing whitespace
  cleaned = cleaned.trim();
  
  return cleaned;
}

/**
 * Legacy function name - use stripMarkdown instead
 * Kept for backwards compatibility
 */
export function cleanAIText(text: string | undefined | null): string {
  return stripMarkdown(text);
}

/**
 * Aggressively clean text of ALL markdown artifacts.
 * Handles edge cases that stripMarkdown misses:
 * - Orphaned ** or * at start/end (e.g., "** Fort Wayne" or "text**")
 * - Leading bullets (- or •)
 * - Header markers (### etc.)
 * - Citation brackets ([1], [2])
 * Use this for ALL user-facing text in school cards and comparisons.
 */
export function cleanText(text: string | undefined | null): string {
  if (!text) return '';
  let s = String(text);
  // Remove bold markdown (paired)
  s = s.replace(/\*\*([\s\S]*?)\*\*/g, '$1');
  // Remove italic markdown (paired)
  s = s.replace(/\*([\s\S]*?)\*/g, '$1');
  // Remove orphaned ** or * at start or end of string
  s = s.replace(/^\*{1,2}\s*/g, '');
  s = s.replace(/\s*\*{1,2}$/g, '');
  // Remove orphaned ** or * at start of lines
  s = s.replace(/^\*{1,2}\s*/gm, '');
  // Remove underline markdown (paired)
  s = s.replace(/__([\s\S]*?)__/g, '$1');
  s = s.replace(/_([^_]+)_/g, '$1');
  // Remove header markers
  s = s.replace(/#{1,6}\s/g, '');
  // Remove citation brackets
  s = s.replace(/\[\d+\]/g, '');
  // Remove leading bullet characters on each line
  s = s.replace(/^[-•]\s*/gm, '');
  // Remove inline code
  s = s.replace(/`([^`]+)`/g, '$1');
  // Remove links but keep text
  s = s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  // Remove HTML tags
  s = s.replace(/<[^>]+>/g, '');
  // Normalize whitespace
  s = s.replace(/\s+/g, ' ');
  return s.trim();
}

export function toSlug(name: string | undefined | null): string {
  if (!name) return '';
  return cleanText(name)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * 5-component match score formula.
 * Returns null if the school scores below 55 (should be filtered out).
 *
 * Components:
 *   GPA Compatibility     0–30 pts
 *   Budget Fit            0–25 pts  (uses netPrice if available, else tuition)
 *   Program Availability  0–20 pts
 *   Admission Probability 0–15 pts  (from acceptance rate)
 *   Graduation Rate       0–10 pts
 *
 * Total possible: 100. Display as percentage.
 */
export function calculateMatchScore(params: {
  // Student profile
  userGPA?: number;
  userBudgetMax?: number;
  userMajor?: string;
  // School data
  schoolMinGPA?: number;
  schoolNetPrice?: number;
  schoolTuition?: number;
  schoolAcceptanceRate?: number;  // numeric percent, e.g. 83.2
  schoolGraduationRate?: number;  // numeric percent, e.g. 65.5
  schoolProgram?: string;         // program name string
  // Legacy / unused but kept for call-site compat
  userBudgetMin?: number;
  programAvailable?: boolean;
  locationMatch?: boolean;
  schoolName?: string;
}): number {
  let score = 0;

  // ── 1. GPA Compatibility (0–30 pts) ─────────────────────────────────────
  const userGPA = Number(params.userGPA) || 0;
  const minGPA  = Number(params.schoolMinGPA) || 0;
  if (userGPA > 0 && minGPA > 0) {
    const diff = userGPA - minGPA;
    if (diff >= 0.5) score += 30;
    else if (diff >= 0) score += 22;
    else if (diff >= -0.1) score += 12;
    else score += 0;
  } else {
    score += 15; // neutral fallback
  }

  // ── 2. Budget Fit (0–25 pts) ────────────────────────────────────────────
  const budgetMax = Number(params.userBudgetMax) || 0;
  const price = Number(params.schoolNetPrice) || Number(params.schoolTuition) || 0;
  if (budgetMax > 0 && price > 0) {
    if (price <= budgetMax) score += 25;
    else if (price <= budgetMax * 1.20) score += 15;
    else if (price <= budgetMax * 1.50) score += 8;
    else score += 0;
  } else {
    score += 12; // neutral fallback
  }

  // ── 3. Program Availability (0–20 pts) ──────────────────────────────────
  const userMajor   = (params.userMajor || '').toLowerCase();
  const schoolProg  = (params.schoolProgram || '').toLowerCase();
  if (userMajor && schoolProg) {
    if (schoolProg.includes(userMajor) || userMajor.includes(schoolProg)) {
      score += 20; // exact major match
    } else {
      // Related-field check
      const relatedGroups: string[][] = [
        ['data science', 'computer science', 'statistics', 'machine learning', 'ai', 'information technology', 'software'],
        ['business', 'finance', 'accounting', 'economics', 'management', 'mba'],
        ['engineering', 'mechanical', 'electrical', 'civil', 'chemical', 'aerospace'],
        ['biology', 'chemistry', 'biochemistry', 'biomedical', 'neuroscience', 'pre-med'],
        ['psychology', 'sociology', 'social work', 'counseling', 'human services'],
        ['english', 'communications', 'journalism', 'writing', 'media'],
        ['education', 'teaching', 'curriculum', 'pedagogy'],
        ['nursing', 'healthcare', 'public health', 'health sciences'],
        ['law', 'pre-law', 'criminal justice', 'political science'],
        ['art', 'design', 'graphic design', 'fine arts', 'architecture'],
      ];
      const isRelated = relatedGroups.some(
        group => group.some(t => userMajor.includes(t)) && group.some(t => schoolProg.includes(t))
      );
      score += isRelated ? 12 : 0;
    }
  } else {
    score += 10; // neutral fallback
  }

  // ── 4. Admission Probability (0–15 pts) ─────────────────────────────────
  const acceptance = Number(params.schoolAcceptanceRate) || 0;
  if (acceptance > 0) {
    if (acceptance >= 85) score += 15;
    else if (acceptance >= 70) score += 12;
    else if (acceptance >= 50) score += 8;
    else if (acceptance >= 30) score += 4;
    else score += 1;
  } else {
    score += 7; // neutral fallback
  }

  // ── 5. Graduation Rate Quality (0–10 pts) ───────────────────────────────
  const gradRate = Number(params.schoolGraduationRate) || 0;
  if (gradRate > 0) {
    if (gradRate >= 70) score += 10;
    else if (gradRate >= 55) score += 7;
    else if (gradRate >= 40) score += 4;
    else score += 1;
  } else {
    score += 5; // neutral fallback
  }

  return Math.round(Math.min(100, Math.max(0, score)));
}

/**
 * Returns null if the score is below the 55-point threshold
 * (school should be filtered out of results).
 */
export function isValidMatchScore(score: number): boolean {
  return score >= 55;
}

/**
 * Gets color class for match score badge.
 * 85+ = bright purple (Excellent Match)
 * 70-84 = blue (Good Match)
 * 55-69 = gray (Possible Match)
 */
export function getMatchScoreColor(score: number): string {
  if (score >= 85) return 'bg-[#7C3AED]/20 border-[#7C3AED]/40 text-[#7C3AED]';
  if (score >= 70) return 'bg-[#3B82F6]/20 border-[#3B82F6]/40 text-[#3B82F6]';
  return 'bg-[#6B7280]/20 border-[#6B7280]/40 text-[#6B7280]';
}

/**
 * Gets the human-readable label for a match score.
 */
export function getMatchScoreLabel(score: number): string {
  if (score >= 85) return 'Excellent Match';
  if (score >= 70) return 'Good Match';
  return 'Possible Match';
}
