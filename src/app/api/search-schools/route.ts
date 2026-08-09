import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { enforceRateLimit } from '@/lib/rateLimit';
import { matchScoreToTier, DEFAULT_BUDGET_MIN } from '@/lib/constants';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Repair common AI JSON issues: trailing commas, truncated output
function repairJSON(raw: string): any {
  let s = raw.trim();

  // Strip markdown code fences
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) s = fence[1].trim();

  // Extract outermost { ... }
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start === -1 || end <= start) return null;
  s = s.substring(start, end + 1);

  // Remove trailing commas before ] or }
  s = s.replace(/,(\s*[}\]])/g, '$1');

  // Try direct parse
  try { return JSON.parse(s); } catch {}

  // Try completing truncated JSON by balancing brackets
  s = closeTruncatedJSON(s);
  try { return JSON.parse(s); } catch {}

  return null;
}

function closeTruncatedJSON(str: string): string {
  const stack: string[] = [];
  let inStr = false;
  let esc = false;

  for (const ch of str) {
    if (esc) { esc = false; continue; }
    if (ch === '\\' && inStr) { esc = true; continue; }
    if (ch === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (ch === '{' || ch === '[') stack.push(ch === '{' ? '}' : ']');
    else if ((ch === '}' || ch === ']') && stack.length) stack.pop();
  }

  // If we're mid-string, close it
  if (inStr) str += '"';
  // Close any open objects/arrays
  return str + stack.reverse().join('');
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rateLimitResponse = await enforceRateLimit(supabase, user.id, 'last_search_at', 30_000, 'school search');
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const {
      // Rich profile fields (new)
      gpaScale = '4.0',
      budgetPerYear,
      satScore,
      actScore,
      ieltsToeflScore,
      englishProficiencyType,
      preferredCountries,
      preferredUSStates,
      residenceState,
      citizenshipCountry,
      mode = 'international',
      dreamJob,
      careerField,
      dreamCompany,
      fundingSource,
      scholarshipNeeded,
      fafsaFiled,
      inStateTuition,
      studyTimeline,
      // Legacy / fallback fields
      major,
      gpa,
      budget,
      location,
      goals,
      citizenship,
    } = body;

    if (!major) {
      return NextResponse.json({ error: 'Major is required' }, { status: 400 });
    }

    if (!process.env.PERPLEXITY_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const isDomestic = mode === 'domestic';
    const isInternational = !isDomestic;

    // Resolve budget
    const budgetNum =
      budgetPerYear ||
      (budget ? parseInt(String(budget).replace(/[^0-9]/g, '')) : 0) ||
      DEFAULT_BUDGET_MIN;

    // Resolve location preferences
    const countryList = Array.isArray(preferredCountries)
      ? preferredCountries.join(', ')
      : location || 'Any';
    const stateList = Array.isArray(preferredUSStates)
      ? preferredUSStates.join(', ')
      : '';
    const homeState = residenceState || '';
    const citizenry = citizenshipCountry || citizenship || (isDomestic ? 'United States' : 'International');

    // ── Build student profile block ──────────────────────────────────────────
    const studentBlock = [
      `STUDENT PROFILE:`,
      `- Intended Major: ${major}`,
      `- GPA: ${gpa || 'Not provided'} / ${gpaScale} scale`,
      `- Annual Budget (all-in, tuition + living): $${budgetNum.toLocaleString()}`,
      `- Career Goal: ${dreamJob || goals || 'Not specified'}`,
      `- Career Field: ${careerField || 'Not specified'}`,
      `- Dream Company / Sector: ${dreamCompany || 'Not specified'}`,
      `- Study Timeline: ${studyTimeline || 'Not specified'}`,
      isDomestic
        ? `- Student Type: US Domestic student`
        : `- Student Type: International student from ${citizenry}`,
      isDomestic
        ? `- Home State: ${homeState || 'Not specified'} (may qualify for in-state tuition rates)`
        : `- Citizenship: ${citizenry}`,
      isDomestic
        ? `- Standardized Tests: SAT ${satScore || 'not provided'} / ACT ${actScore || 'not provided'}`
        : `- English Proficiency: ${englishProficiencyType ? `${englishProficiencyType.toUpperCase()} ${ieltsToeflScore || ''}` : 'Not provided'}`,
      isDomestic && fafsaFiled
        ? `- Financial Aid: FAFSA filed — eligible for federal need-based grants and loans`
        : null,
      isDomestic && inStateTuition
        ? `- Preference: Strongly prioritize schools where this student qualifies for in-state tuition`
        : null,
      isDomestic && scholarshipNeeded
        ? `- Aid Need: Requires merit scholarship opportunities`
        : null,
      isInternational && scholarshipNeeded
        ? `- Aid Need: Requires international merit scholarship or significant institutional aid`
        : null,
      `- Preferred Location: ${isDomestic
        ? (stateList || homeState || countryList || 'Any US state')
        : (countryList || 'Worldwide')}`,
      `- Funding Source: ${fundingSource || 'Not specified'}`,
    ].filter(Boolean).join('\n');

    // ── Tier definition block ─────────────────────────────────────────────────
    const tierBlock = `
TIER STRATEGY (must return EXACTLY 6 safety + 8 target + 6 reach = 20 schools):

"safety" (6 schools): Student's profile is WELL ABOVE this school's typical admit.
  - Acceptance rate ≥ 50% OR student GPA is ≥ 0.4 above school's average admitted GPA
  - Student has > 80% probability of admission if they apply
  - These schools should still be excellent fits for their major and career goals

"target" (8 schools): Student's profile aligns with the typical admitted student.
  - Acceptance rate 15–65% AND student GPA is within ±0.3 of average admitted GPA
  - Competitive but highly achievable with a well-crafted application
  - These are the core of the application list

"reach" (6 schools): Highly selective or profile is slightly below typical admit.
  - Acceptance rate < 20% OR student GPA is below the school's average admitted GPA
  - Ambitious and worth applying — even elite students get rejected from reach schools
  - Include at least 2 nationally top-ranked programs the student would love
`.trim();

    // ── Data accuracy rules ───────────────────────────────────────────────────
    const dataRules = `
DATA REQUIREMENTS:
1. Return ONLY raw valid JSON. No markdown, no backticks, no explanation.
2. All numeric fields are plain numbers (no $, %, commas). 67.4 = 67.4%, not "67.4%".
3. tuition_instate = annual tuition only. NOT room and board.
4. tuition_outofstate = annual tuition for non-resident / international students.
5. net_price = average net price AFTER all grants/scholarships from College Scorecard. Always < sticker tuition.
6. room_board = annual room and board cost (separate from tuition).
7. graduation_rate = 6-year rate from NCES or Common Data Set. e.g., 78.4
8. median_earnings_10yr = median earnings 10 years after enrollment from College Scorecard.
9. ${isDomestic
    ? `Use in-state tuition for ${homeState || 'student\'s home state'} when student qualifies. Show out-of-state as well.`
    : 'Use international/out-of-state tuition rates. Do NOT use in-state rates.'}
10. match_score: GPA fit (30%) + Budget fit (25%) + Program strength (25%) + Acceptance rate (20%).
    Scores MUST span meaningfully from at least 48 to 95. Do NOT bunch in a 10-point range.
    Safety schools should score 75-95. Target schools 62-82. Reach schools 48-70.
11. why_matched: 2 sentences. Reference this student's SPECIFIC stats — their actual GPA, exact budget number, specific program rank. Must sound like a human counselor who studied their file personally.
12. concern: 1 brutally honest, specific warning for THIS student at this school. Never vague. Examples:
    "Your $40k budget is $11k below their average net price of $51k — aggressive merit aid negotiation is essential."
    "Only 9% of applicants are admitted — this is a long shot given your 3.4 GPA vs their median 3.9 admitted GPA."
    "Their ${major} program is not in the top 50 nationally — may limit recruiting at your target companies."
13. test_policy: Exactly "Test-Optional", "Test-Required", or "Test-Free".
14. program_rank: Specific rank with source and year, or empty string. e.g., "Ranked #7 for ${major} by US News 2024".
15. highlights: Exactly 3 concrete, school-specific strengths relevant to this student's exact major AND career goal. Zero generic filler.
16. deadline_type: "Rolling", "Regular Decision", "Early Action", or "Early Decision".
`.trim();

    const fullPrompt = `
${studentBlock}

${tierBlock}

${dataRules}

Return EXACTLY this JSON structure (no other text):
{
  "schools": [
    {
      "name": "Full official university name",
      "location": "City, State/Country",
      "city": "City name only",
      "state": "2-letter state abbreviation (US) or country name",
      "setting": "urban or suburban or rural",
      "program": "Specific degree program name",
      "tier": "safety",
      "test_policy": "Test-Optional",
      "deadline_type": "Regular Decision",
      "tuition_instate": 15000,
      "tuition_outofstate": 28000,
      "net_price": 12000,
      "room_board": 11000,
      "acceptance_rate": 83.2,
      "graduation_rate": 67.4,
      "gpa_minimum": 2.5,
      "gpa_average_admitted": 3.2,
      "scholarship_info": "Merit awards up to $18k/yr for GPA above 3.5",
      "top_employers": ["Company A", "Company B", "Company C"],
      "median_earnings_10yr": 65000,
      "international_student_pct": 8.2,
      "match_score": 82,
      "why_matched": "Your 3.8 GPA is comfortably above their 3.2 average admitted GPA, and your $60k budget covers their $14k net price with significant margin. This is a strong safety with an excellent ${major} placement record.",
      "concern": "Their ${major} program is ranked #48 nationally — below your target of top-25 programs for Big Tech recruiting.",
      "program_rank": "Ranked #12 for ${major} by US News 2024",
      "highlights": [
        "Co-op program places 94% of ${major} students at Fortune 500 companies before graduation",
        "Average net price of $12,400 — well within your $60k budget even after room and board",
        "Test-optional policy with 67% acceptance rate makes this a near-certain admit given your profile"
      ]
    }
  ]
}

CRITICAL: Return exactly 20 schools — 6 labeled "safety", 8 labeled "target", 6 labeled "reach". This is non-negotiable.
`.trim();

    console.log('Calling Perplexity API (20-school tiered match)...');

    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: `You are a world-class college admissions strategist and data researcher with real-time web access. You have deep knowledge of every major university's admissions requirements, financial aid policies, program rankings, and employment outcomes.

Data sources in strict priority order:
1. NCES (nces.ed.gov) — enrollment, tuition, financial aid data
2. College Scorecard (collegescorecard.ed.gov) — net price, 10-year earnings
3. Common Data Set 2024-2025 — acceptance rates, GPA ranges, test policies
4. US News & World Report Rankings 2024 — program-specific rankings
5. School official websites — current test policies, deadlines, scholarship info

ABSOLUTE RULES:
- Return ONLY raw valid JSON. Zero explanation. Zero markdown. Zero backticks.
- Every school must be real, accredited, and genuinely well-matched to the student.
- match_score MUST span at least 40 points across all 20 schools.
- concern field must be specific, honest, and directly reference this student's profile vs this school's data.
- A student will make a life-changing $100,000+ decision based on your output. Accuracy is non-negotiable.
- why_matched must reference the student's specific GPA: ${gpa || 'provided'}, budget: $${budgetNum.toLocaleString()}, and major: ${major}.`,
          },
          {
            role: 'user',
            content: fullPrompt,
          },
        ],
        max_tokens: 8000,
        temperature: 0.1,
        return_citations: true,
      }),
    });

    if (!perplexityResponse.ok) {
      const errorText = await perplexityResponse.text();
      console.error('Perplexity API error:', perplexityResponse.status, errorText);
      return NextResponse.json(
        { error: `Perplexity API error: ${perplexityResponse.status}` },
        { status: 500 }
      );
    }

    const data = await perplexityResponse.json();
    const rawContent = data.choices[0].message.content;
    const citations = data.citations || [];

    console.log('Raw Perplexity response length:', rawContent.length);

    const parsedData = repairJSON(rawContent);
    if (!parsedData) {
      console.error('Could not parse AI response after repair attempts. Length:', rawContent.length);
      return NextResponse.json(
        { error: 'AI returned malformed data. Please try again.' },
        { status: 502 }
      );
    }

    const schools = parsedData.schools;
    if (!Array.isArray(schools) || schools.length === 0) {
      return NextResponse.json(
        { error: 'No school recommendations returned. Please try again.' },
        { status: 502 }
      );
    }

    const cleanStr = (str: any): string => {
      if (!str || typeof str !== 'string') return str || '';
      return str
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/\[\d+\]/g, '')
        .replace(/#{1,6}\s/g, '')
        .trim();
    };

    const VALID_TIERS = new Set(['safety', 'target', 'reach']);
    const VALID_TEST_POLICIES = new Set(['Test-Optional', 'Test-Required', 'Test-Free']);

    const cleanedSchools = schools.map((school: any) => {
      let matchScore = Number(school.match_score) || 65;
      matchScore = Math.max(40, Math.min(98, matchScore));

      // Resolve tier — trust AI first, fall back to score-based
      let tier: string = school.tier;
      if (!VALID_TIERS.has(tier)) {
        tier = matchScoreToTier(matchScore);
      }

      const testPolicy = VALID_TEST_POLICIES.has(school.test_policy)
        ? school.test_policy
        : 'Test-Optional';

      const annualCost = isInternational
        ? (Number(school.tuition_outofstate) || Number(school.net_price) || 28000)
        : (Number(school.net_price) || Number(school.tuition_instate) || 12000);

      return {
        ...school,
        name: cleanStr(school.name),
        location: cleanStr(school.location),
        city: cleanStr(school.city) || cleanStr(school.location)?.split(',')[0]?.trim() || '',
        state: cleanStr(school.state) || '',
        program: cleanStr(school.program),
        tier,
        test_policy: testPolicy,
        deadline_type: cleanStr(school.deadline_type) || 'Regular Decision',
        scholarship_info: cleanStr(school.scholarship_info) || '',
        setting: school.setting || 'suburban',
        why_matched: cleanStr(school.why_matched) || '',
        concern: cleanStr(school.concern) || '',
        program_rank: cleanStr(school.program_rank) || '',
        highlights: Array.isArray(school.highlights)
          ? school.highlights.map((h: any) => cleanStr(h)).filter(Boolean)
          : [],
        top_employers: Array.isArray(school.top_employers) ? school.top_employers : [],

        // Ensure all numerics are numbers
        tuition_instate: Number(school.tuition_instate) || 0,
        tuition_outofstate: Number(school.tuition_outofstate) || 0,
        net_price: Number(school.net_price) || 0,
        room_board: Number(school.room_board) || 0,
        acceptance_rate: Number(school.acceptance_rate) || 0,
        graduation_rate: Number(school.graduation_rate) || 0,
        gpa_minimum: Number(school.gpa_minimum) || 0,
        gpa_average_admitted: Number(school.gpa_average_admitted) || 0,
        median_earnings_10yr: Number(school.median_earnings_10yr) || 0,
        international_student_pct: Number(school.international_student_pct) || 0,
        match_score: matchScore,
        annual_cost_estimate: annualCost,
        is_international_tuition: isInternational,
      };
    });

    // Sort: safety → target → reach, then by match score within each tier
    const TIER_ORDER: Record<string, number> = { safety: 0, target: 1, reach: 2 };
    cleanedSchools.sort((a: any, b: any) => {
      const ta = TIER_ORDER[a.tier] ?? 1;
      const tb = TIER_ORDER[b.tier] ?? 1;
      if (ta !== tb) return ta - tb;
      return b.match_score - a.match_score;
    });

    console.log(`Parsed ${cleanedSchools.length} schools (${cleanedSchools.filter((s: any) => s.tier === 'safety').length} safety / ${cleanedSchools.filter((s: any) => s.tier === 'target').length} target / ${cleanedSchools.filter((s: any) => s.tier === 'reach').length} reach)`);

    // Persist matches — delete prior run for this user then insert fresh set.
    // Fire-and-forget: a persistence failure never blocks the UI response.
    (async () => {
      try {
        await supabase.from('matches').delete().eq('user_id', user.id);
        const rows = cleanedSchools.map((s: any) => ({
          user_id: user.id,
          school_name: s.name,
          school_data: s,
          success_probability: s.match_score,
          reasoning: s.why_matched || '',
          cost_breakdown: {
            tuition_instate: s.tuition_instate,
            tuition_outofstate: s.tuition_outofstate,
            net_price: s.net_price,
            room_board: s.room_board,
            annual_cost_estimate: s.annual_cost_estimate,
          },
          citations: citations || [],
        }));
        const { error } = await supabase.from('matches').insert(rows);
        if (error) console.error('[search-schools] match persistence error:', error.message);
      } catch (e: any) {
        console.error('[search-schools] match persistence exception:', e?.message);
      }
    })();

    return NextResponse.json({ schools: cleanedSchools, citations });
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search schools' },
      { status: 500 }
    );
  }
}
