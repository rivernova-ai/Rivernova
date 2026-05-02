import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { schools, userProfile } = await request.json();

    if (!schools || schools.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 schools required for comparison' },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const schoolsText = schools
      .map(
        (school: any, idx: number) => `
School ${idx + 1}: ${school.name}
Location: ${school.location}
Program: ${school.program}
Match Score: ${school.matchScore}%
Tuition: ${school.tuition}
Admission Rate: ${school.admissionRate || 'N/A'}
Employment Rate: ${school.employmentRate || 'N/A'}
Avg Salary: ${school.avgSalary || 'N/A'}
Highlights: ${school.highlights?.join(', ') || 'N/A'}
`
      )
      .join('\n');

    const prompt = `You are an expert education counselor providing personalized school comparison advice.

STUDENT PROFILE:
- Major: ${userProfile.major}
- Career Goal: ${userProfile.careerField} (Dream Job: ${userProfile.dreamJob})
- GPA: ${userProfile.gpa || 'Not provided'}
- Budget: $${userProfile.budgetMin || 0} - $${userProfile.budgetMax || 0} USD/year
- Location Preference: ${userProfile.preferredCountries || 'Not specified'}

SCHOOLS TO COMPARE:
${schoolsText}

Provide a detailed, honest comparison in this exact format:

RECOMMENDATION:
[Your main recommendation - which school is the better fit and why, considering the student's profile, goals, and financial situation. Be specific about factors like program quality, career outcomes, affordability, and admission likelihood.]

ALTERNATIVE PERSPECTIVE:
[The honest case for the other school(s) - what makes it a compelling choice despite not being the top recommendation. Acknowledge its strengths.]

KEY DIFFERENCES:
[3-4 bullet points highlighting the most important differences between the schools]

FINANCIAL ANALYSIS:
[Compare the financial aspects - tuition, potential aid, ROI based on salary outcomes]

NEXT STEPS:
[Specific action items the student should take to decide between these schools]`;

    const { text } = await generateText({
      model: anthropic('claude-sonnet-4-20250514'),
      prompt,
      temperature: 0.7,
    });

    return NextResponse.json({ recommendation: text });
  } catch (error) {
    console.error('Comparison API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate comparison' },
      { status: 500 }
    );
  }
}
