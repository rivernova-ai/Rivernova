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

export async function researchSchools(query: SchoolResearchQuery) {
  const prompt = `You are a school research assistant. Research and provide detailed information about universities/programs that match this profile:

Major/Field: ${query.major}
Career Goal: ${query.careerField}
Budget Range: $${query.budgetMin} - $${query.budgetMax} USD per year
Preferred Countries: ${query.preferredCountries.join(', ')}
Mode: ${query.mode}
${query.gpa ? `GPA: ${query.gpa}` : ''}
${query.testScores ? `Test Scores: ${query.testScores}` : ''}

Please research and provide:
1. 10-15 universities/programs that match this profile
2. For each school, include:
   - School name and location
   - Program name and ranking
   - Tuition cost (annual)
   - Living expenses estimate
   - Admission requirements
   - Scholarship opportunities
   - Employment outcomes and average starting salary
   - Visa success rate (if international)
   - ROI analysis
3. Include citations and sources for all data

Focus on recent data (2023-2024) and provide accurate, verifiable information.`;

  try {
    const { text } = await generateText({
      model: perplexity('sonar-pro'),
      prompt,
      maxTokens: 4000,
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
      maxTokens: 2000,
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
      maxTokens: 1500,
    });

    return text;
  } catch (error) {
    console.error('Perplexity API error:', error);
    throw new Error('Failed to research visa information');
  }
}
