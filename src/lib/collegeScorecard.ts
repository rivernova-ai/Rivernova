import { researchInternationalSchool } from './ai/perplexity';

const API_KEY = process.env.COLLEGE_SCORECARD_API_KEY?.trim();
const BASE_URL = 'https://api.data.gov/ed/collegescorecard/v1/schools.json';

const FIELDS = [
  'id',
  'school.name',
  'school.state',
  'school.ownership',
  'latest.admissions.admission_rate.overall',
  'latest.completion.completion_rate_4yr_150nt',
  'latest.cost.net_price.public.by_income_level.110001-plus',
  'latest.cost.net_price.private.by_income_level.110001-plus',
  'latest.cost.tuition.in_state',
  'latest.cost.tuition.out_of_state',
  'latest.earnings.10_yrs_after_entry.median',
  'latest.student.size',
].join(',');

export interface CollegeScorecardData {
  unitId: number;
  name: string;
  state: string;           // US state abbreviation, or country name for international schools
  ownership: number;       // 1=public, 2=private nonprofit, 3=for-profit
  admissionRate: number | null;      // 0–1 decimal e.g. 0.42
  completionRate: number | null;     // 0–1 decimal e.g. 0.78
  netPricePublic: number | null;     // dollars (US schools only)
  netPricePrivate: number | null;    // dollars (US schools only)
  tuitionInState: number | null;     // dollars — domestic tuition for international schools
  tuitionOutOfState: number | null;  // dollars — INTERNATIONAL student tuition (used for isInternational=true)
  medianEarnings10yr: number | null; // dollars
  enrollment: number | null;
  dataYear: string;
  // International school extras — populated only via Perplexity for non-US schools
  isInternationalSchool?: boolean;
  country?: string;
  postGradWorkRights?: string;      // e.g. "3-year PGWP (Canada)"
  englishRequirements?: string;     // e.g. "IELTS 6.5 / TOEFL 90"
  tuitionLocalAmount?: number | null;   // original local currency amount e.g. 42500
  tuitionLocalCurrency?: string;        // ISO code e.g. "AUD", "GBP", "CAD"
  source?: 'scorecard' | 'perplexity';
}

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\b(university|college|institute|of|the|at|and|&)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function nameSimilarity(a: string, b: string): number {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.9;
  const aWords = new Set(na.split(' ').filter(Boolean));
  const bWords = new Set(nb.split(' ').filter(Boolean));
  const intersection = [...aWords].filter(w => bWords.has(w)).length;
  const union = new Set([...aWords, ...bWords]).size;
  return union > 0 ? intersection / union : 0;
}

// Deterministic integer ID for international schools (8-digit range, above IPEDS max of ~500000)
function internationalSchoolId(name: string): number {
  let hash = 2166136261;
  for (let i = 0; i < name.length; i++) {
    hash ^= name.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
    hash = hash >>> 0;
  }
  return 10000000 + (hash % 90000000);
}

async function fetchFromScorecard(searchName: string): Promise<CollegeScorecardData | null> {
  if (!API_KEY) {
    console.warn('COLLEGE_SCORECARD_API_KEY not set');
    return null;
  }

  const url = `${BASE_URL}?school.name=${encodeURIComponent(searchName)}&fields=${FIELDS}&per_page=5&api_key=${API_KEY}`;

  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) {
    console.error('College Scorecard API error:', res.status);
    return null;
  }

  const json = await res.json();
  const results: any[] = json.results || [];
  if (results.length === 0) return null;

  const scored = results.map(r => ({
    r,
    score: nameSimilarity(searchName, r['school.name'] || ''),
  }));
  scored.sort((a, b) => b.score - a.score);

  const best = scored[0];
  if (best.score < 0.4) return null;

  const r = best.r;
  const currentYear = new Date().getFullYear();

  return {
    unitId: r['id'],
    name: r['school.name'],
    state: r['school.state'],
    ownership: r['school.ownership'],
    admissionRate: r['latest.admissions.admission_rate.overall'] ?? null,
    completionRate: r['latest.completion.completion_rate_4yr_150nt'] ?? null,
    netPricePublic: r['latest.cost.net_price.public.by_income_level.110001-plus'] ?? null,
    netPricePrivate: r['latest.cost.net_price.private.by_income_level.110001-plus'] ?? null,
    tuitionInState: r['latest.cost.tuition.in_state'] ?? null,
    tuitionOutOfState: r['latest.cost.tuition.out_of_state'] ?? null,
    medianEarnings10yr: r['latest.earnings.10_yrs_after_entry.median'] ?? null,
    enrollment: r['latest.student.size'] ?? null,
    dataYear: `${currentYear - 1}-${currentYear}`,
    source: 'scorecard',
  };
}

const CACHE_TTL_DAYS = 365; // refresh school data once per year

// Main export — cache → College Scorecard → Perplexity (international fallback)
export async function lookupSchool(
  schoolName: string,
  supabase: any,
  programName?: string
): Promise<CollegeScorecardData | null> {
  try {
    // 1. Check Supabase cache (works for both US and international schools)
    const { data: cached } = await supabase
      .from('schools_cache')
      .select('*')
      .ilike('name', `%${schoolName.split(' ').slice(0, 3).join('%')}%`)
      .limit(5);

    if (cached && cached.length > 0) {
      const best = cached
        .map((c: any) => ({ c, score: nameSimilarity(schoolName, c.name) }))
        .sort((a: any, b: any) => b.score - a.score)[0];

      if (best.score >= 0.6) {
        // Check freshness — stale after 365 days so tuition/rates refresh annually
        const updatedAt = best.c.updated_at ? new Date(best.c.updated_at) : new Date(0);
        const daysSince = (Date.now() - updatedAt.getTime()) / 86400000;

        if (daysSince <= CACHE_TTL_DAYS) {
          return {
            unitId: best.c.unit_id,
            name: best.c.name,
            state: best.c.state,
            ownership: best.c.ownership ?? 1,
            admissionRate: best.c.admission_rate,
            completionRate: best.c.completion_rate,
            netPricePublic: best.c.net_price_public,
            netPricePrivate: best.c.net_price_private,
            tuitionInState: best.c.tuition_in_state,
            tuitionOutOfState: best.c.tuition_out_of_state,
            medianEarnings10yr: best.c.median_earnings_10yr,
            enrollment: best.c.enrollment,
            dataYear: best.c.data_year,
            isInternationalSchool: best.c.source === 'perplexity',
            country: best.c.country,
            postGradWorkRights: best.c.post_grad_work_rights,
            englishRequirements: best.c.english_requirements,
            source: best.c.source || 'scorecard',
          };
        }

        console.log(`Cache stale for "${schoolName}" (${Math.floor(daysSince)}d old) — refreshing`);
      }
    }

    // 2. Try College Scorecard (US schools)
    const scorecardData = await fetchFromScorecard(schoolName);
    if (scorecardData) {
      await supabase.from('schools_cache').upsert({
        unit_id: scorecardData.unitId,
        name: scorecardData.name,
        state: scorecardData.state,
        ownership: scorecardData.ownership,
        admission_rate: scorecardData.admissionRate,
        completion_rate: scorecardData.completionRate,
        net_price_public: scorecardData.netPricePublic,
        net_price_private: scorecardData.netPricePrivate,
        tuition_in_state: scorecardData.tuitionInState,
        tuition_out_of_state: scorecardData.tuitionOutOfState,
        median_earnings_10yr: scorecardData.medianEarnings10yr,
        enrollment: scorecardData.enrollment,
        data_year: scorecardData.dataYear,
        source: 'scorecard',
        country: 'United States',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'unit_id' });

      return scorecardData;
    }

    // 3. College Scorecard returned null → non-US school → Perplexity live search
    console.log(`Scorecard miss for "${schoolName}" — falling back to Perplexity international search`);
    const intlData = await researchInternationalSchool(schoolName, programName);
    if (!intlData) return null;

    const unitId = internationalSchoolId(schoolName);
    const currentYear = new Date().getFullYear();

    const mapped: CollegeScorecardData = {
      unitId,
      name: intlData.name,
      state: intlData.country,        // repurpose state field to hold country
      ownership: 1,                    // default public; Perplexity prompt could refine this
      admissionRate: intlData.admissionRate,
      completionRate: intlData.completionRate,
      netPricePublic: null,            // not applicable for international schools
      netPricePrivate: null,
      tuitionInState: intlData.tuitionDomestic,          // domestic tuition
      tuitionOutOfState: intlData.tuitionInternational,  // international student tuition — used when isInternational=true
      tuitionLocalAmount: intlData.tuitionLocalAmount,
      tuitionLocalCurrency: intlData.tuitionLocalCurrency || 'USD',
      medianEarnings10yr: intlData.medianEarnings,
      enrollment: intlData.enrollment,
      dataYear: intlData.dataYear || `${currentYear - 1}-${currentYear}`,
      isInternationalSchool: true,
      country: intlData.country,
      postGradWorkRights: intlData.postGradWorkRights,
      englishRequirements: intlData.englishRequirements,
      source: 'perplexity',
    };

    // Cache permanently — same school never searched twice
    await supabase.from('schools_cache').upsert({
      unit_id: unitId,
      name: mapped.name,
      state: mapped.state,
      ownership: mapped.ownership,
      admission_rate: mapped.admissionRate,
      completion_rate: mapped.completionRate,
      net_price_public: null,
      net_price_private: null,
      tuition_in_state: mapped.tuitionInState,
      tuition_out_of_state: mapped.tuitionOutOfState,
      median_earnings_10yr: mapped.medianEarnings10yr,
      enrollment: mapped.enrollment,
      data_year: mapped.dataYear,
      source: 'perplexity',
      country: mapped.country,
      post_grad_work_rights: mapped.postGradWorkRights,
      english_requirements: mapped.englishRequirements,
      tuition_local_amount: mapped.tuitionLocalAmount ?? null,
      tuition_local_currency: mapped.tuitionLocalCurrency ?? null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'unit_id' });

    return mapped;
  } catch (err) {
    console.error('lookupSchool error:', err);
    return null;
  }
}

// Applies verified data on top of a Claude-generated match object.
// Works for both US schools (College Scorecard) and international schools (Perplexity).
export function applyVerifiedData(match: any, scorecard: CollegeScorecardData, isInternational: boolean): any {
  const isPublic = scorecard.ownership === 1;

  // For international students: always use out-of-state/international tuition
  const tuition = isInternational
    ? (scorecard.tuitionOutOfState ?? scorecard.tuitionInState)
    : (scorecard.tuitionInState ?? scorecard.tuitionOutOfState);

  // Net price only meaningful for US domestic students; hide for international context
  const netPrice = isInternational
    ? null   // domestic net price is misleading for international students
    : (isPublic ? scorecard.netPricePublic : scorecard.netPricePrivate);

  const dataSourceLabel = scorecard.source === 'perplexity'
    ? `Verified via Perplexity live search ${scorecard.dataYear}`
    : `College Scorecard ${scorecard.dataYear}`;

  return {
    ...match,
    ...(scorecard.admissionRate !== null && {
      admissionRate: `${(scorecard.admissionRate * 100).toFixed(1)}%`,
    }),
    ...(scorecard.completionRate !== null && {
      graduationRate: `${(scorecard.completionRate * 100).toFixed(1)}%`,
    }),
    ...(tuition !== null && {
      costBreakdown: {
        ...match.costBreakdown,
        tuition,
        total: tuition + (match.costBreakdown?.living || 15000),
        ...(scorecard.tuitionLocalAmount != null && {
          tuitionLocalAmount: scorecard.tuitionLocalAmount,
          tuitionLocalCurrency: scorecard.tuitionLocalCurrency || 'USD',
        }),
      },
    }),
    ...(netPrice !== null && {
      netPrice: `$${netPrice.toLocaleString()}`,
    }),
    ...(scorecard.medianEarnings10yr !== null && {
      avgSalary: `$${scorecard.medianEarnings10yr.toLocaleString()}`,
      median_earnings_10yr: scorecard.medianEarnings10yr,
    }),
    // International-specific fields (populated for non-US schools)
    ...(scorecard.postGradWorkRights && {
      postGradWorkRights: scorecard.postGradWorkRights,
    }),
    ...(scorecard.englishRequirements && {
      englishRequirements: scorecard.englishRequirements,
    }),
    // Metadata
    unitId: scorecard.unitId,
    isInternationalSchool: scorecard.isInternationalSchool || false,
    schoolCountry: scorecard.country || 'United States',
    dataSource: dataSourceLabel,
    // Per-field source tracking — tells the UI which fields are verified vs estimated
    dataSources: {
      ...(match.dataSources || {}),
      ...(scorecard.admissionRate !== null && { admissionRate: dataSourceLabel }),
      ...(scorecard.completionRate !== null && { graduationRate: dataSourceLabel }),
      ...(tuition !== null && { tuition: dataSourceLabel }),
      ...(scorecard.medianEarnings10yr !== null && { avgSalary: dataSourceLabel }),
      ...(netPrice !== null && { netPrice: dataSourceLabel }),
    },
    scorecard: {
      admissionRate: scorecard.admissionRate,
      completionRate: scorecard.completionRate,
      medianEarnings10yr: scorecard.medianEarnings10yr,
      tuitionInState: scorecard.tuitionInState,
      tuitionOutOfState: scorecard.tuitionOutOfState,
      netPrice: netPrice,
      source: scorecard.source,
    },
  };
}
