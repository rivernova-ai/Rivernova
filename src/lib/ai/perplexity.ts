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
export async function researchSchools(query: SchoolResearchQuery) {
  const prompt = `You are a school research data API. Research universities matching this student profile and return ONLY valid JSON.

STUDENT PROFILE:
- Major/Field: ${query.major}
- Career Goal: ${query.careerField}
- Budget Range: $${query.budgetMin} - $${query.budgetMax} USD per year
- Preferred Countries: ${query.preferredCountries.join(', ')}
- Mode: ${query.mode}
${query.gpa ? `- GPA: ${query.gpa}` : ''}
${query.testScores ? `- Test Scores: ${query.testScores}` : ''}

CRITICAL INSTRUCTIONS:
1. Respond with ONLY a valid JSON object. No markdown, no explanatory text, no disclaimers, no footnotes, no "Critical Limitations" sections.
2. Do NOT include any text before or after the JSON.
3. Do NOT wrap the JSON in markdown code fences.
4. Every school must be a real, accredited university or college.
5. Provide 10-15 schools.

Respond with EXACTLY this JSON structure and nothing else:
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
      "ranking": "Top 50 National Universities",
      "employment_rate": 92,
      "avg_salary": 65000,
      "scholarship_info": "Merit scholarships available up to $10,000/year",
      "deadline": "January 15, 2026",
      "highlights": [
        "Strong research program",
        "Industry partnerships",
        "High employment rate"
      ],
      "match_score": 78
    }
  ]
}

FIELD RULES:
- "name": Full official university name. REQUIRED.
- "location": City and state/country. REQUIRED.
- "program": Specific program name for the student's major. REQUIRED.
- "tuition_instate": Annual in-state tuition as a number (no $ sign). Use 0 if unknown.
- "tuition_outstate": Annual out-of-state tuition as a number. Use 0 if unknown.
- "net_price": Average net price after aid as a number. Use 0 if unknown.
- "acceptance_rate": Percentage as a number (e.g., 83.2 not "83.2%"). Use 0 if unknown.
- "graduation_rate": Percentage as a number. Use 0 if unknown.
- "gpa_minimum": Minimum GPA as a decimal number. Use 0 if unknown.
- "ranking": Brief ranking description or "Unranked".
- "employment_rate": Post-graduation employment percentage as a number. Use 0 if unknown.
- "avg_salary": Average starting salary as a number. Use 0 if unknown.
- "scholarship_info": Brief scholarship description or "Contact financial aid office".
- "deadline": Application deadline or "Rolling admissions".
- "highlights": Array of 3-5 short highlight strings.
- "match_score": Overall match score 0-100 based on student profile fit.

Use the most recent data available (2024-2025). Respond with the JSON object ONLY.`;

  try {
    const { text } = await generateText({
      model: perplexity('sonar-pro'),
      prompt,
    });

    return text;
  } catch (error) {
    console.error('Perplexity API error:', error);
    throw new Error('Failed to research schools');
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
