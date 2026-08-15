import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { enforceRateLimit } from '@/lib/rateLimit';
import { sanitizeForPrompt } from '@/lib/sanitize';
import { normalizeQualification } from '@/lib/qualificationNormalizer';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rateLimitResponse = await enforceRateLimit(supabase, user.id, 'last_compare_at', 30_000, 'comparison');
    if (rateLimitResponse) return rateLimitResponse;

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

    // Sanitize all user-controlled strings before prompt interpolation.
    const safeMajor = sanitizeForPrompt(userProfile?.major);
    const safeCareerField = sanitizeForPrompt(userProfile?.careerField);
    const safeDreamJob = sanitizeForPrompt(userProfile?.dreamJob);
    const safeLocation = sanitizeForPrompt(userProfile?.preferredCountries);

    // Resolve academic credentials — same pattern as search-schools and claude.ts
    const { data: profileRow } = await supabase
      .from('profiles')
      .select('academic_background')
      .eq('id', user.id)
      .single();

    const qualCtx = normalizeQualification(profileRow?.academic_background || {});
    const credentialDescription = qualCtx.aiPromptDescription ||
      (userProfile?.gpa ? `GPA: ${userProfile.gpa}` : 'Not provided');
    const isInternationalCredential =
      credentialDescription !== 'Not provided' && !credentialDescription.startsWith('GPA:');
    const credentialRule = isInternationalCredential
      ? `\nINTERNATIONAL CREDENTIAL RULE: This student uses an international credential system, NOT a US GPA. You MUST NOT write "GPA not provided" — it is factually wrong. Reference their actual credential as shown above.\n`
      : '';

    const schoolsText = schools
      .map(
        (school: any, idx: number) => `
School ${idx + 1}: ${sanitizeForPrompt(school.name)}
Location: ${sanitizeForPrompt(school.location)}
Program: ${sanitizeForPrompt(school.program)}
Match Score: ${school.matchScore}%
Tuition: ${sanitizeForPrompt(school.tuition)}
Admission Rate: ${school.admissionRate || 'N/A'}
Employment Rate: ${school.employmentRate || 'N/A'}
Avg Salary: ${school.avgSalary || 'N/A'}
Highlights: ${school.highlights?.map((h: string) => sanitizeForPrompt(h)).join(', ') || 'N/A'}
`
      )
      .join('\n');

    const prompt = `You are an expert education counselor providing personalized school comparison advice.${credentialRule}
STUDENT PROFILE:
- Major: ${safeMajor}
- Career Goal: ${safeCareerField} (Dream Job: ${safeDreamJob})
- Academic Credentials: ${credentialDescription}
- Budget: $${userProfile?.budgetMin || 0} - $${userProfile?.budgetMax || 0} USD/year
- Location Preference: ${safeLocation || 'Not specified'}

SCHOOLS TO COMPARE:
${schoolsText}

Write a clear, well-structured comparison using proper markdown formatting. Use ## headings, bullet points, bold text, and a markdown table for the financial section. Do NOT use plain text section separators like dashes or ALL-CAPS headers.

Use exactly this structure:

## Our Recommendation
[2-3 paragraphs. Name the top pick and give the specific reasons why — program quality, career outcomes, affordability, admission likelihood. Reference the student's actual credentials and budget.]

## The Case for [Other School]
[1-2 paragraphs. Honest strengths of the other school(s). What would make it the better choice?]

## Key Differences
- **[Topic]:** [concrete comparison]
- **[Topic]:** [concrete comparison]
- **[Topic]:** [concrete comparison]
- **[Topic]:** [concrete comparison]

## Financial Breakdown
| Factor | [School A] | [School B] |
|--------|-----------|-----------|
| Annual Tuition | ... | ... |
| Est. 4-Year Cost | ... | ... |
| Budget Fit | ✅/❌ | ✅/❌ |
| Aid Potential | ... | ... |

[1 paragraph on ROI and earnings potential.]

## Next Steps
1. [Specific action item]
2. [Specific action item]
3. [Specific action item]`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content
      .filter(block => block.type === 'text')
      .map(block => (block as { type: 'text'; text: string }).text)
      .join('');

    return NextResponse.json({ recommendation: text });
  } catch (error) {
    console.error('Comparison API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate comparison' },
      { status: 500 }
    );
  }
}
