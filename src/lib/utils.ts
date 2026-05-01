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
 * Calculates AI match score based on user profile and school data
 * Weights: GPA alignment (40%), Budget fit (30%), Program availability (20%), Location preference (10%)
 * @returns Score from 0-100
 */
export function calculateMatchScore(params: {
  userGPA?: number;
  schoolMinGPA?: number;
  userBudgetMin?: number;
  userBudgetMax?: number;
  schoolTuition?: number;
  programAvailable?: boolean;
  locationMatch?: boolean;
}): number {
  let score = 0;
  const weights = {
    gpa: 0.4,
    budget: 0.3,
    program: 0.2,
    location: 0.1,
  };

  // GPA Alignment (40%)
  if (params.userGPA !== undefined && params.schoolMinGPA !== undefined) {
    const gpaDiff = params.userGPA - params.schoolMinGPA;
    const gpaScore = Math.min(100, Math.max(0, 50 + gpaDiff * 10));
    score += gpaScore * weights.gpa;
  } else {
    score += 75 * weights.gpa; // Default to 75 if no data
  }

  // Budget Fit (30%)
  if (
    params.userBudgetMin !== undefined &&
    params.userBudgetMax !== undefined &&
    params.schoolTuition !== undefined
  ) {
    if (params.schoolTuition >= params.userBudgetMin && params.schoolTuition <= params.userBudgetMax) {
      score += 100 * weights.budget;
    } else if (params.schoolTuition < params.userBudgetMin) {
      const diff = params.userBudgetMin - params.schoolTuition;
      const budgetScore = Math.max(50, 100 - (diff / params.userBudgetMin) * 50);
      score += budgetScore * weights.budget;
    } else {
      const diff = params.schoolTuition - params.userBudgetMax;
      const budgetScore = Math.max(30, 100 - (diff / params.userBudgetMax) * 70);
      score += budgetScore * weights.budget;
    }
  } else {
    score += 70 * weights.budget; // Default to 70 if no data
  }

  // Program Availability (20%)
  score += (params.programAvailable !== false ? 100 : 50) * weights.program;

  // Location Preference (10%)
  score += (params.locationMatch !== false ? 100 : 60) * weights.location;

  return Math.round(score);
}

/**
 * Gets color class for match score badge
 */
export function getMatchScoreColor(score: number): string {
  if (score >= 85) return 'bg-purple-500/20 border-purple-500/30 text-purple-300';
  if (score >= 70) return 'bg-blue-500/20 border-blue-500/30 text-blue-300';
  return 'bg-gray-500/20 border-gray-500/30 text-gray-300';
}
