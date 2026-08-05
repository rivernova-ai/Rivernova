import { createPerplexity } from '@ai-sdk/perplexity';
import { generateText } from 'ai';

const perplexity = createPerplexity({
  apiKey: process.env.PERPLEXITY_API_KEY,
});

export interface SchoolResearchQuery {
  major: string;
  careerField: string;
  budgetMin: number;
  budgetMax: number;
  preferredCountries: string[];
  mode: 'domestic' | 'international' | 'lifelong';
  gpa?: string;
  testScores?: string;
}

/**
 * Research schools via Perplexity and return structured JSON.
 *
 * The prompt demands a strict JSON-only response so that downstream
 * consumers (Claude synthesis, dashboard UI) never receive free-text
 * paragraphs that could be mis-parsed as school cards.
 */
export interface VerifiedSchoolFact {
  name: string;
  location: string;
  program: string;
  tuition_instate: number;
  tuition_outstate: number;
  net_price: number;
  acceptance_rate: number;
  graduation_rate: number;
  gpa_minimum: number;
  ranking: string;
  employment_rate: number;
  avg_salary: number;
  scholarship_info: string;
  deadline: string;
  deadline_type: string;
  test_policy: string;
  stem_opt_eligible: string;
  data_year: string;
  highlights: string[];
}

export interface SchoolResearchResult {
  rawText: string;
  schools: VerifiedSchoolFact[];
}

export async function researchSchools(query: SchoolResearchQuery): Promise<SchoolResearchResult> {
  const currentYear = new Date().getFullYear();
  const admissionCycle = `${currentYear}-${currentYear + 1}`;

  const prompt = `You are a real-time school data API with live web access. Search the official university websites, Common Data Sets, and admissions pages RIGHT NOW to find accurate data for the ${admissionCycle} admissions cycle.

STUDENT PROFILE:
- Major/Field: ${query.major}
- Career Goal: ${query.careerField}
- Budget Range: $${query.budgetMin} - $${query.budgetMax} USD per year
- Preferred Countries: ${query.preferredCountries.join(', ')}
- Mode: ${query.mode}
${query.gpa ? `- GPA: ${query.gpa}` : ''}
${query.testScores ? `- Test Scores: ${query.testScores}` : ''}

CRITICAL INSTRUCTIONS:
1. Search the live web RIGHT NOW for each school's official admissions data for ${admissionCycle}.
2. Respond with ONLY a valid JSON object. No markdown, no text, no disclaimers.
3. Every number must come from the school's official website or Common Data Set — not from memory.
4. Provide 10-15 schools.
5. For test_policy: check the school's CURRENT admissions page. Many schools changed policies post-2020.
6. For stem_opt_eligible: verify whether the specific program's CIP code qualifies for 24-month STEM OPT.
7. For deadline: use the EXACT deadline from the school's ${admissionCycle} admissions page.

Respond with EXACTLY this JSON structure:
{
  "schools": [
    {
      "name": "Full University Name",
      "location": "City, State/Country",
      "program": "Specific program name",
      "tuition_instate": 15000,
      "tuition_outstate": 35000,
      "net_price": 12000,
      "acceptance_rate": 83.2,
      "graduation_rate": 65.5,
      "gpa_minimum": 2.5,
      "ranking": "#105-#109 National Universities (US News ${currentYear})",
      "employment_rate": 92,
      "avg_salary": 65000,
      "scholarship_info": "Merit scholarships available up to $10,000/year",
      "deadline": "November 30, ${currentYear}",
      "deadline_type": "Regular Decision",
      "test_policy": "Test-Free",
      "stem_opt_eligible": "No",
      "data_year": "${admissionCycle}",
      "highlights": [
        "Strong research program",
        "Industry partnerships",
        "High employment rate"
      ]
    }
  ]
}

FIELD RULES — every field must reflect live ${admissionCycle} data:
- "tuition_instate": Current in-state tuition as number. Use 0 if genuinely unknown.
- "tuition_outstate": Current out-of-state tuition as number.
- "net_price": Average net price after aid from the most recent IPEDS data.
- "acceptance_rate": Most recent published acceptance rate as a number (e.g. 42.3, not "42.3%").
- "graduation_rate": 6-year graduation rate as a number.
- "gpa_minimum": Official minimum GPA for admission. Use the actual number, not an estimate.
- "ranking": CRITICAL — US News publishes TWO separate ranking lists. You MUST identify which list the school is on:
  1. National Universities (research-focused, ~440 schools): MIT, Stanford, UCLA, SJSU is NOT on this list
  2. Regional Universities split by region — North, South, Midwest, West (teaching-focused state schools)
  Example: San Jose State University = "#4 Regional Universities West (US News ${currentYear})" NOT a National Universities rank.
  Format: "#N [List Name] [Region if applicable] (US News ${currentYear})". NEVER "N/A". NEVER assign a National Universities rank to a Regional school.
- "deadline": Exact deadline from the school's official ${admissionCycle} admissions calendar.
- "deadline_type": "Early Decision" | "Early Action" | "Regular Decision" | "Rolling".
- "test_policy": "Test-Required" | "Test-Optional" | "Test-Free". Check the CURRENT policy — many schools changed post-2020.
- "stem_opt_eligible": "Yes" | "No" | "Partial" — based on the program's CIP code. Undergraduate business/finance typically "No". Graduate STEM programs typically "Yes".
- "data_year": Always "${admissionCycle}".
- "highlights": Array of 3-5 specific, factual highlights from live data.

Respond with the JSON object ONLY.`;

  try {
    const { text } = await generateText({
      model: perplexity('sonar-pro'),
      prompt,
    });

    // Parse the verified facts so they can be passed as structured data to Claude
    let schools: VerifiedSchoolFact[] = [];
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        schools = parsed.schools || [];
      }
    } catch {
      // If parsing fails, schools stays empty — Claude will still get the raw text
    }

    return { rawText: text, schools };
  } catch (error) {
    console.error('Perplexity API error:', error);
    throw new Error('Failed to research schools');
  }
}

export interface InternationalSchoolData {
  name: string;
  country: string;
  tuitionInternational: number | null;  // what international students pay (USD)
  tuitionDomestic: number | null;        // what domestic/home students pay (USD, for reference)
  admissionRate: number | null;           // 0–1 decimal
  completionRate: number | null;          // 0–1 decimal
  medianEarnings: number | null;          // USD post-graduation
  enrollment: number | null;
  postGradWorkRights: string;             // e.g. "3-year PGWP (Canada)", "UK Graduate Route 2yr"
  englishRequirements: string;            // e.g. "IELTS 6.5 / TOEFL 90"
  applicationDeadline: string;
  dataYear: string;
}

export async function researchInternationalSchool(
  schoolName: string,
  programName: string = ''
): Promise<InternationalSchoolData | null> {
  const currentYear = new Date().getFullYear();
  const admissionCycle = `${currentYear}-${currentYear + 1}`;

  const prompt = `You have live web access. Search the official international admissions and fees pages of "${schoolName}" RIGHT NOW for the ${admissionCycle} academic year.

${programName ? `Program of interest: ${programName}` : ''}

CRITICAL: Return data specifically for INTERNATIONAL students, not domestic/home students. These are completely different fee structures at most universities.

Search these official sources right now:
1. The university's official international student tuition/fees page for ${admissionCycle}
2. The international admissions requirements page
3. The post-graduation work permit or graduate visa page for international students

Return ONLY this JSON (no markdown, no explanation):
{
  "name": "${schoolName}",
  "country": "Full country name e.g. Canada, United Kingdom, Australia, Germany",
  "tuition_international_usd": 45000,
  "tuition_domestic_usd": 12000,
  "admission_rate": 0.43,
  "completion_rate": 0.85,
  "median_earnings_usd": 65000,
  "enrollment": 45000,
  "post_grad_work_rights": "3-year Post-Graduation Work Permit (PGWP) available for full-time programs over 2 years",
  "english_requirements": "IELTS 6.5 overall (no band below 6.0) / TOEFL iBT 90",
  "application_deadline": "January 15, ${currentYear + 1} for international applicants",
  "data_year": "${admissionCycle}"
}

FIELD RULES:
- "tuition_international_usd": Convert to USD using current exchange rate. Include ALL mandatory fees international students pay. Source ONLY from the official international student fees page. Do not guess.
- "tuition_domestic_usd": Local/home student tuition in USD. Use 0 if unknown.
- "admission_rate": As decimal 0–1. From official admissions statistics page.
- "completion_rate": Graduation or completion rate as decimal 0–1.
- "median_earnings_usd": Median salary of graduates in USD. Use graduate employment surveys.
- "post_grad_work_rights": Country-specific — Canada=PGWP, UK=Graduate Route, Australia=Temporary Graduate Visa, Germany=18-month job seeker visa, USA=OPT/STEM OPT. Be specific about duration.
- "english_requirements": Exact minimum scores. Check current requirements — many changed post-2022.
- "application_deadline": For international applicants specifically. Use exact date.

If any field is genuinely unavailable after searching, use null for numbers and empty string for text. Never guess.`;

  try {
    const { text } = await generateText({
      model: perplexity('sonar-pro'),
      prompt,
    });

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const data = JSON.parse(jsonMatch[0]);

    return {
      name: data.name || schoolName,
      country: data.country || 'Unknown',
      tuitionInternational: data.tuition_international_usd ?? null,
      tuitionDomestic: data.tuition_domestic_usd ?? null,
      admissionRate: data.admission_rate ?? null,
      completionRate: data.completion_rate ?? null,
      medianEarnings: data.median_earnings_usd ?? null,
      enrollment: data.enrollment ?? null,
      postGradWorkRights: data.post_grad_work_rights || '',
      englishRequirements: data.english_requirements || '',
      applicationDeadline: data.application_deadline || '',
      dataYear: data.data_year || admissionCycle,
    };
  } catch (err) {
    console.error(`Perplexity international research failed for ${schoolName}:`, err);
    return null;
  }
}

export async function researchScholarships(schoolName: string, major: string) {
  const prompt = `Research scholarship opportunities at ${schoolName} for ${major} students. Include:
- Merit-based scholarships
- Need-based financial aid
- International student scholarships
- Application deadlines
- Eligibility criteria
- Average award amounts

Provide recent, accurate information with citations.`;

  try {
    const { text } = await generateText({
      model: perplexity('sonar'),
      prompt,
    });

    return text;
  } catch (error) {
    console.error('Perplexity API error:', error);
    throw new Error('Failed to research scholarships');
  }
}

export async function researchVisaInfo(country: string) {
  const prompt = `Research student visa information for ${country}:
- Visa type and requirements
- Application process
- Success rates
- Processing time
- Post-graduation work opportunities
- Recent policy changes (2023-2024)

Provide accurate, up-to-date information with sources.`;

  try {
    const { text } = await generateText({
      model: perplexity('sonar'),
      prompt,
    });

    return text;
  } catch (error) {
    console.error('Perplexity API error:', error);
    throw new Error('Failed to research visa information');
  }
}
