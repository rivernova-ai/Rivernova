import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface MatchSynthesisInput {
  researchData: string;
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
  const prompt = `You are an expert education counselor. Based on the research data below and the student's profile, synthesize 8-12 ranked school matches.

STUDENT PROFILE:
- Major: ${input.userProfile.major}
- Career Goal: ${input.userProfile.careerField} (Dream Job: ${input.userProfile.dreamJob})
- GPA: ${input.userProfile.gpa || 'Not provided'}
- Test Scores: ${input.userProfile.testScores || 'Not provided'}
- Budget: $${input.userProfile.budget.min} - $${input.userProfile.budget.max} USD/year
- Preferred Countries: ${input.userProfile.preferredCountries.join(', ')}
- Mode: ${input.userProfile.mode}

RESEARCH DATA:
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
      "whyUnbiased": "This recommendation is based purely on program fit, career outcomes, and affordability. Rivernova receives $0 commission from this institution.",
      "citations": ["Source 1", "Source 2"]
    }
  ]
}

Rank matches by overall fit (success probability, affordability, career outcomes). Ensure all data is accurate and based on the research provided. Include the "whyUnbiased" field for every match to emphasize zero commission.`;

  try {
    const { text } = await generateText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      prompt,
      maxSteps: 10,
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
      model: anthropic('claude-3-5-sonnet-20241022'),
      prompt,
      maxSteps: 5,
    });

    return text;
  } catch (error) {
    console.error('Claude API error:', error);
    throw new Error('Failed to generate essay outline');
  }
}
