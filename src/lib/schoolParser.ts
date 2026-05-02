/**
 * School data parser & validator
 * 
 * Primary path: Parse structured JSON from the Perplexity API
 * Fallback path: Extract schools from free text (heavily filtered)
 * 
 * Validation rejects:
 * - Entries starting with verbs (Visiting, Reviewing, etc.)
 * - Disclaimers, notes, limitations
 * - Entries shorter than 50 characters
 * - Entries without a recognizable school name
 * - Entries missing both location AND tuition/acceptance data
 */

import { stripMarkdown } from './utils';

// ─── Interfaces ────────────────────────────────────────────────

export interface ParsedSchool {
  name: string;
  location: string;
  program: string;
  tuition: string;
  netPrice: string;
  admissionRate: string;
  graduationRate: string;
  gpaMinimum: string;
  ranking: string;
  employmentRate: string;
  avgSalary: string;
  scholarships: string;
  deadline: string;
  highlights: string[];
  matchScore?: number;
}

/** Raw JSON shape returned by the search-schools API */
export interface SchoolJSON {
  name: string;
  location: string;
  program: string;
  tuition_instate?: number;
  tuition_outstate?: number;
  net_price?: number;
  acceptance_rate?: number;
  graduation_rate?: number;
  gpa_minimum?: number;
  ranking?: string;
  employment_rate?: number;
  avg_salary?: number;
  scholarship_info?: string;
  deadline?: string;
  highlights?: string[];
  match_score?: number;
}

// ─── Validation helpers ────────────────────────────────────────

/** Words that signal a non-school entry */
const REJECT_KEYWORDS = [
  'limitation', 'note:', 'disclaimer', 'important', 'warning'
];

/** Verbs that indicate an instruction, not a school name */
const REJECT_VERB_STARTS = [
  'visiting', 'reviewing', 'consulting', 'checking',
  'contacting', 'researching', 'exploring', 'considering',
  'applying', 'comparing', 'evaluating', 'verifying',
  'ensuring', 'confirming', 'looking', 'searching',
  'reaching', 'browsing', 'reading', 'understanding'
];

/** Patterns that indicate a real school name */
const SCHOOL_NAME_PATTERNS = [
  /university/i, /college/i, /institute/i, /school/i, /polytechnic/i,
  /academy/i, /conservatory/i, /seminary/i, /tech/i, /\bMIT\b/,
  /\bNYU\b/, /\bUCLA\b/, /\bUSC\b/, /\bCaltech\b/i, /\bStanford\b/i,
  /\bHarvard\b/i, /\bYale\b/i, /\bPrinceton\b/i, /\bColumbia\b/i,
  /\bBerkeley\b/i, /\bCornell\b/i, /\bPenn\b/, /\bDartmouth\b/i,
  /\bBrown\b/i, /\bRice\b/i, /\bEmory\b/i, /\bDuke\b/i, /\bGeorgetown\b/i,
  /\bVanderbilt\b/i, /\bTufts\b/i, /\bWellesley\b/i, /\bAmherst\b/i,
  /\bWilliams\b/i, /\bBowdoin\b/i, /\bPomona\b/i, /\bSwarthmore\b/i,
  /\bCarleton\b/i, /\bOberlin\b/i, /\bA&M\b/i, /\bState\b/i
];

/**
 * Validate a single school entry has the minimum required data
 * and is not a garbage paragraph
 */
export function validateSchoolEntry(entry: any): boolean {
  if (!entry || typeof entry !== 'object') return false;

  const fullEntryStr = JSON.stringify(entry).toLowerCase();
  
  // Reject if shorter than 50 characters
  if (fullEntryStr.length < 50) return false;

  // Reject if contains limitation or warning words anywhere in the entry
  for (const keyword of REJECT_KEYWORDS) {
    if (fullEntryStr.includes(keyword)) return false;
  }

  const name = String(entry.name || '').trim();
  const lowerName = name.toLowerCase();

  // Must have a real name
  if (!name || name.length < 3) return false;

  // Starts with bullet point or dash
  if (name.startsWith('-') || name.startsWith('•')) return false;

  // Starts with a verb → instruction, not a school
  for (const verb of REJECT_VERB_STARTS) {
    if (lowerName.startsWith(verb)) return false;
  }

  // Doesn't contain a recognizable school name pattern
  if (!SCHOOL_NAME_PATTERNS.some(pattern => pattern.test(name))) return false;

  // Must have a location
  const location = String(entry.location || '').trim();
  if (!location || location.length < 3) return false;

  // Must have at least tuition OR acceptance rate
  const hasTuition = !!(
    (entry.tuition_instate && entry.tuition_instate > 0) ||
    (entry.tuition_outstate && entry.tuition_outstate > 0) ||
    (entry.tuition && String(entry.tuition).length > 0) ||
    (entry.net_price && entry.net_price > 0) ||
    (entry.netPrice && String(entry.netPrice).length > 0)
  );
  
  const hasAcceptanceRate = !!(
    (entry.acceptance_rate && entry.acceptance_rate > 0) ||
    (entry.admissionRate && String(entry.admissionRate).length > 0)
  );

  if (!hasTuition && !hasAcceptanceRate) return false;

  return true;
}

// ─── Primary path: JSON parsing ────────────────────────────────

/**
 * Format a dollar amount from a number
 */
function formatDollars(value: number | undefined | null): string {
  if (!value || value <= 0) return '';
  return `$${value.toLocaleString()}`;
}

/**
 * Format a percentage from a number
 */
function formatPercent(value: number | undefined | null): string {
  if (!value || value <= 0) return '';
  return `${value}%`;
}

/**
 * Parse structured JSON school data from the API response.
 * This is the primary parsing path.
 */
export function parseSchoolJSON(schools: SchoolJSON[]): ParsedSchool[] {
  if (!Array.isArray(schools)) return [];

  const results: ParsedSchool[] = [];

  for (const school of schools) {
    // Validate before converting
    if (!validateSchoolEntry(school)) {
      console.warn('Rejected invalid school entry:', school.name || '(no name)');
      continue;
    }

    // Determine best tuition display
    let tuitionDisplay = '';
    if (school.tuition_instate && school.tuition_instate > 0) {
      tuitionDisplay = formatDollars(school.tuition_instate);
      if (school.tuition_outstate && school.tuition_outstate > 0 && school.tuition_outstate !== school.tuition_instate) {
        tuitionDisplay += ` (Out-of-state: ${formatDollars(school.tuition_outstate)})`;
      }
    } else if (school.tuition_outstate && school.tuition_outstate > 0) {
      tuitionDisplay = formatDollars(school.tuition_outstate);
    } else if (school.net_price && school.net_price > 0) {
      tuitionDisplay = formatDollars(school.net_price);
    }

    const parsed: ParsedSchool = {
      name: stripMarkdown(String(school.name || '')).trim(),
      location: stripMarkdown(String(school.location || '')).trim(),
      program: stripMarkdown(String(school.program || '')).trim(),
      tuition: tuitionDisplay,
      netPrice: formatDollars(school.net_price),
      admissionRate: formatPercent(school.acceptance_rate),
      graduationRate: formatPercent(school.graduation_rate),
      gpaMinimum: school.gpa_minimum && school.gpa_minimum > 0 ? String(school.gpa_minimum) : '',
      ranking: stripMarkdown(String(school.ranking || '')).trim(),
      employmentRate: formatPercent(school.employment_rate),
      avgSalary: formatDollars(school.avg_salary),
      scholarships: stripMarkdown(String(school.scholarship_info || '')).trim(),
      deadline: stripMarkdown(String(school.deadline || '')).trim(),
      highlights: (school.highlights || [])
        .map(h => stripMarkdown(String(h)).trim())
        .filter(h => h.length > 0)
        .slice(0, 5),
      matchScore: school.match_score,
    };

    results.push(parsed);
  }

  return results;
}

// ─── Batch validation ──────────────────────────────────────────

/**
 * Validate and clean an array of parsed schools.
 * Ensures formatting consistency.
 */
export function validateSchoolData(schools: ParsedSchool[]): ParsedSchool[] {
  return schools
    .filter(s => {
      // Must have location
      if (!s.location || s.location.length < 3) return false;
      // Must have tuition or admission rate
      if (!s.tuition && !s.admissionRate) return false;
      return true;
    })
    .map(s => ({
      ...s,
      // Ensure tuition has $ sign
      tuition: s.tuition && !s.tuition.includes('$') && /\d/.test(s.tuition) ? `$${s.tuition}` : s.tuition,
      // Ensure rates have % sign
      admissionRate: s.admissionRate && !s.admissionRate.includes('%') && /\d/.test(s.admissionRate) ? `${s.admissionRate}%` : s.admissionRate,
      graduationRate: s.graduationRate && !s.graduationRate.includes('%') && /\d/.test(s.graduationRate) ? `${s.graduationRate}%` : s.graduationRate,
      employmentRate: s.employmentRate && !s.employmentRate.includes('%') && /\d/.test(s.employmentRate) ? `${s.employmentRate}%` : s.employmentRate,
      // Ensure salary has $ sign
      avgSalary: s.avgSalary && !s.avgSalary.includes('$') && /\d/.test(s.avgSalary) ? `$${s.avgSalary}` : s.avgSalary,
      // Limit highlights
      highlights: s.highlights.slice(0, 5),
    }));
}
