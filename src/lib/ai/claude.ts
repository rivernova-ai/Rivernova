import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { type VerifiedSchoolFact } from './perplexity';

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface MatchSynthesisInput {
  researchData: string;
  verifiedFacts: VerifiedSchoolFact[];
  userProfile: {
    major: string;
    careerField: string;
    dreamJob: string;
    gpa?: string;
    testScores?: string;
    budget: { min: number; max: number };
    preferredCountries: string[];
    mode: string;
  };
}

export async function synthesizeMatches(input: MatchSynthesisInput) {
  const verifiedFactsBlock = input.verifiedFacts.length > 0
    ? `\n\nVERIFIED REAL-TIME SCHOOL FACTS (scraped live from official university websites by Perplexity):
${JSON.stringify(input.verifiedFacts, null, 2)}

⚠️ ENFORCEMENT RULE: The VERIFIED REAL-TIME SCHOOL FACTS above are ground truth. For every school you include in your response, you MUST copy the following fields EXACTLY as they appear above — do not alter, round, or substitute from your own training knowledge:
- tuition → use tuition_outstate for international/out-of-state students
- acceptance_rate → copy exactly as admissionRate (add % symbol)
- graduation_rate → copy exactly as graduationRate (add % symbol)
- gpa_minimum → copy exactly as admissionRequirements.gpa
- deadline → copy exactly
- deadline_type → copy exactly
- test_policy → copy exactly (this may differ from your training data — trust the live data)
- stem_opt_eligible → copy exactly as stemOpt
- ranking → copy exactly (never substitute with your own memory of rankings)
- data_year → include in your response
Your job is ONLY to add: reasoning, highlights, why_matched, concern, whyUnbiased, and the tier classification. Every number and policy fact must come from the verified data above.\n`
    : '';

  const prompt = `You are an expert education counselor. Based on the verified real-time research data below and the student's profile, synthesize 8-12 ranked school matches.

STUDENT PROFILE:
- Major: ${input.userProfile.major}
- Career Goal: ${input.userProfile.careerField} (Dream Job: ${input.userProfile.dreamJob})
- GPA: ${input.userProfile.gpa || 'Not provided'}
- Test Scores: ${input.userProfile.testScores || 'Not provided'}
- Budget: $${input.userProfile.budget.min} - $${input.userProfile.budget.max} USD/year
- Preferred Countries: ${input.userProfile.preferredCountries.join(', ')}
- Mode: ${input.userProfile.mode}
${verifiedFactsBlock}
FULL RESEARCH CONTEXT:
${input.researchData}

Please provide a JSON response with this exact structure:
{
  "matches": [
    {
      "schoolName": "University Name",
      "location": "City, Country",
      "programName": "Specific Program Name",
      "successProbability": 85,
      "reasoning": "Detailed explanation of why this is a good match, considering the student's profile, goals, and the school's strengths. Mention specific factors like program quality, career outcomes, affordability, and admission likelihood.",
      "costBreakdown": {
        "tuition": 45000,
        "living": 15000,
        "total": 60000,
        "scholarshipPotential": 10000
      },
      "highlights": [
        "Top-ranked program in the field",
        "Strong industry connections",
        "95% employment rate within 6 months"
      ],
      "admissionRequirements": {
        "gpa": "3.5+",
        "testScores": "SAT 1400+ or equivalent",
        "other": "Portfolio, essays, recommendations"
      },
      "tier": "target",
      "ranking": "#105-#109 National Universities (US News & World Report)",
      "admissionRate": "42%",
      "graduationRate": "78%",
      "employmentRate": "91%",
      "avgSalary": "$85,000",
      "netPrice": "$22,000",
      "deadline": "December 1",
      "deadline_type": "Regular Decision",
      "test_policy": "Test-Optional",
      "concern": "One honest concern about this school for this specific student — e.g. high cost relative to budget, low STEM OPT rate, or competitive admission given their GPA.",
      "why_matched": "A personalized 2-3 sentence explanation of why this school fits this exact student's goals, background, and budget.",
      "top_employers": ["Amazon", "Google", "Deloitte", "TCS"],
      "stemOpt": "Yes",
      "whyUnbiased": "This recommendation is based purely on program fit, career outcomes, and affordability. Rivernova receives $0 commission from this institution.",
      "citations": ["Source 1", "Source 2"]
    }
  ]
}

For the "tier" field, classify each school as:
- "reach": successProbability below 45 (admission is ambitious given the student's profile)
- "target": successProbability 45–74 (realistic and well-aligned with the student's profile)
- "safety": successProbability 75 or above (high confidence of admission)

For the "ranking" field: CRITICAL — US News publishes TWO entirely separate ranking lists:
1. National Universities (~440 research-focused schools: MIT, Stanford, UCLA, Michigan, etc.)
2. Regional Universities (teaching-focused state schools, split into North/South/Midwest/West regions)
Many mid-tier state schools appear ONLY on the Regional list, NOT the National list. Assigning a National Universities rank to a Regional school is a factual error.
Examples of correct rankings: "San Jose State University" = "#4 Regional Universities West (US News 2025)", NOT a National Universities rank.
Format: "#N [List Name] [Region] (US News YEAR)". If the verified facts above contain a ranking, copy it exactly. NEVER return "N/A".

For the "admissionRate" field: provide the actual acceptance rate as a percentage string (e.g., "42%"). Use real data from the research provided.

For the "graduationRate" field: provide the 4 or 6-year graduation rate as a percentage string.

For the "stemOpt" field: "Yes" if the program qualifies for 24-month STEM OPT extension, "No" if it does not, "Check with DSO" if uncertain.

Rank matches by overall fit (success probability, affordability, career outcomes). Ensure all data is accurate and based on the research provided. Include the "whyUnbiased" field for every match to emphasize zero commission.`;

  try {
    const { text } = await generateText({
      model: anthropic('claude-sonnet-4-6'),
      prompt,
    });

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse Claude response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Claude API error:', error);
    throw new Error('Failed to synthesize matches');
  }
}

export async function generateEssayOutline(topic: string, schoolName: string, userBackground: string) {
  const prompt = `Generate a detailed essay outline for a college application essay.

Topic: ${topic}
School: ${schoolName}
Student Background: ${userBackground}

Provide a structured outline with:
1. Hook/Opening
2. Main themes (3-4)
3. Key experiences to highlight
4. Connection to school/program
5. Conclusion

Make it personal, authentic, and compelling.`;

  try {
    const { text } = await generateText({
      model: anthropic('claude-sonnet-4-6'),
      prompt,
    });

    return text;
  } catch (error) {
    console.error('Claude API error:', error);
    throw new Error('Failed to generate essay outline');
  }
}
